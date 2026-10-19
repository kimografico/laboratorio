#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

function findRoot(start) {
  let dir = start;
  while (true) {
    if (existsSync(join(dir, "src", "content", "experiments"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error("No se encontró la raíz del repo (src/content/experiments).");
    }
    dir = parent;
  }
}

const ROOT = findRoot(HERE);
const EXPERIMENTS_DIR = join(ROOT, "src", "content", "experiments");
const CATEGORIES_FILE = join(ROOT, "src", "lib", "categories.ts");

function readCategoryOrder() {
  const source = readFileSync(CATEGORIES_FILE, "utf8");
  const block = source.match(/EXPERIMENT_CATEGORIES\s*=\s*\[([\s\S]*?)\]\s*as const/);
  if (!block) {
    throw new Error("No se pudo leer EXPERIMENT_CATEGORIES de src/lib/categories.ts");
  }
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    data[kv[1]] = value;
  }
  return data;
}

function readExperiments() {
  return readdirSync(EXPERIMENTS_DIR)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const slug = name.slice(0, -3);
      const data = parseFrontmatter(readFileSync(join(EXPERIMENTS_DIR, name), "utf8"));
      return {
        slug,
        title: data.title ?? slug,
        category: data.category ?? "",
        component: data.component ?? "",
      };
    });
}

function usage() {
  console.log(`Uso: node .opencode/skills/list-experiments/scripts/list-experiments.mjs [opciones]

Opciones:
  --json               Salida JSON (total, counts y experiments).
  --category <slug>    Filtra por categoría (geometria, naturaleza, simulacion, texts, pendiente).
  -h, --help           Muestra esta ayuda.`);
}

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  usage();
  process.exit(0);
}

function option(name) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

const categoryFilter = option("category");
const asJson = args.includes("--json");

const order = readCategoryOrder();
const experiments = readExperiments();

const unknown = [...new Set(experiments.map((e) => e.category).filter((c) => !order.includes(c)))];
if (unknown.length > 0) {
  console.error(`Categorías desconocidas en el frontmatter: ${unknown.join(", ")}`);
  process.exitCode = 1;
}

if (categoryFilter && !order.includes(categoryFilter)) {
  console.error(`Categoría inválida '${categoryFilter}'. Válidas: ${order.join(", ")}`);
  process.exit(2);
}

const filtered = categoryFilter
  ? experiments.filter((e) => e.category === categoryFilter)
  : experiments;

function compare(a, b) {
  const ca = order.indexOf(a.category);
  const cb = order.indexOf(b.category);
  if (ca !== cb) return ca - cb;
  return (
    a.title.localeCompare(b.title, "es", { sensitivity: "base" }) ||
    a.slug.localeCompare(b.slug)
  );
}

filtered.sort(compare);

const counts = filtered.reduce((acc, e) => {
  acc[e.category] = (acc[e.category] ?? 0) + 1;
  return acc;
}, {});

if (asJson) {
  console.log(JSON.stringify({ total: filtered.length, counts, experiments: filtered }, null, 2));
} else if (filtered.length === 0) {
  console.log("Sin resultados.");
} else {
  console.log(`Experimentos: ${filtered.length}`);
  const groups = new Map();
  for (const e of filtered) {
    if (!groups.has(e.category)) groups.set(e.category, []);
    groups.get(e.category).push(e);
  }
  for (const [category, items] of groups) {
    console.log(`\n${category} (${items.length})`);
    for (const e of items) {
      console.log(`  ${e.slug}\t${e.title}\t${e.component}`);
    }
  }
  const summary = [...groups].map(([category, items]) => `${category} ${items.length}`).join(" · ");
  console.log(`\nTotal: ${filtered.length} — ${summary}`);
}
