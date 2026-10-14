import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Maximize2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import Stage from "./Stage";
import { defaultsFromProps, type PropDef, type PropValues } from "../../lib/props";

interface ExperimentPreviewProps {
  componentId: string;
  propDefs: PropDef[];
  category: string;
  accent?: string;
  backHref?: string;
  backLabel?: string;
  allowFullscreen?: boolean;
}

function isHex(v: unknown): v is string {
  return typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
}

function formatValue(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) return JSON.stringify(v);
  return String(v);
}

function importPath(category: string, componentId: string): string {
  if (category === "texts") return `@/components/texts/${componentId}`;
  if (category === "backgrounds") return `@/components/backgrounds/${componentId}`;
  return `@/components/ui/${componentId}`;
}

function buildSnippet(componentId: string, propDefs: PropDef[], values: PropValues, category: string): string {
  const attrs: string[] = [];
  let child = "";
  for (const p of propDefs) {
    const v = values[p.name];
    if (p.name === "children") {
      child = typeof v === "string" ? v : "";
      continue;
    }
    if (typeof v === "boolean") {
      attrs.push(v ? `\n  ${p.name}` : `\n  ${p.name}={false}`);
    } else {
      attrs.push(`\n  ${p.name}={${formatValue(v)}}`);
    }
  }
  const path = importPath(category, componentId);
  if (category === "texts") {
    return `import ${componentId} from "${path}";\n\n<${componentId}${attrs.join("")}>\n  ${child}\n</${componentId}>`;
  }
  return `import ${componentId} from "${path}";\n\n<${componentId}${attrs.join("")} />\n`;
}

export default function ExperimentPreview({
  componentId,
  propDefs,
  category,
  accent,
  backHref = "/",
  backLabel = "Galería",
  allowFullscreen = true,
}: ExperimentPreviewProps) {
  const [values, setValues] = useState<PropValues>(() => defaultsFromProps(propDefs));
  const [fullscreen, setFullscreen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const isText = category === "texts";
  const isBackground = category === "backgrounds";
  const snippet = useMemo(
    () => buildSnippet(componentId, propDefs, values, category),
    [componentId, propDefs, values, category]
  );
  const themed = useMemo(
    () => propDefs.filter((p) => p.type === "color" && values[p.name] === p.default).map((p) => p.name),
    [propDefs, values]
  );

  const update = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const stage = (
    <div
      className={`relative w-full overflow-hidden ${
        fullscreen ? "h-full" : "h-[60vh] min-h-[380px] rounded-2xl border border-line"
      }`}
    >
      {isBackground ? (
        <>
          <Stage componentId={componentId} values={values} themed={themed} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
            <h1 className="max-w-2xl text-3xl font-bold text-fg drop-shadow-sm sm:text-5xl">
              Construye héroes que reaccionan
            </h1>
            <p className="max-w-lg text-sm text-muted sm:text-base">
              Mueve el cursor sobre el lienzo para explorar el efecto en vivo.
            </p>
            <div className="pointer-events-auto flex gap-3">
              <button className="rounded-full bg-fg px-5 py-2 text-sm font-medium text-surface transition hover:bg-fg/90">
                Empezar
              </button>
              <button className="rounded-full border border-line-strong px-5 py-2 text-sm font-medium text-muted transition hover:border-fg/60">
                Ver más
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-panel p-8 text-center">
          <div className={isText ? "text-3xl sm:text-5xl" : ""}>
            <Stage componentId={componentId} values={values} themed={themed} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </a>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setValues(defaultsFromProps(propDefs))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-subtle px-3 py-1.5 text-xs text-fg/70 transition hover:border-line-strong hover:text-fg"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          {allowFullscreen && (
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-subtle px-3 py-1.5 text-xs text-fg/70 transition hover:border-line-strong hover:text-fg"
            >
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              Pantalla completa
            </button>
          )}
        </div>
      </div>

      {fullscreen ? (
        <div className="fixed inset-0 z-50 bg-surface">
          <div className="h-full w-full">{stage}</div>
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface/60 px-3 py-1.5 text-xs text-fg backdrop-blur transition hover:bg-surface/80"
          >
            <Minimize2 className="h-3.5 w-3.5" /> Salir
          </button>
        </div>
      ) : (
        stage
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-fg">
            <SlidersHorizontal className="h-4 w-4" style={{ color: accent ?? "currentColor" }} />
            Controles ({propDefs.length})
          </span>
          <ChevronDown className={`h-4 w-4 text-faint transition ${panelOpen ? "rotate-180" : ""}`} />
        </button>

        {panelOpen && (
          <div className="border-t border-line p-4">
            {propDefs.length === 0 ? (
              <p className="text-sm text-faint">Este componente no expone props configurables.</p>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {propDefs.map((p) => (
                  <Control key={p.name} def={p} value={values[p.name]} onChange={(v) => update(p.name, v)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-sm font-medium text-fg">Código de uso</span>
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-subtle px-3 py-1.5 text-xs text-fg/70 transition hover:border-line-strong hover:text-fg"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-[color:var(--code-fg)]">
          <code>{snippet}</code>
        </pre>
      </div>
    </div>
  );
}

function Control({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (def.type === "text") {
    return <TextControl def={def} value={value} onChange={onChange} />;
  }

  const label = def.label ?? def.name;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-xs text-muted">
        <span>{label}</span>
        {def.type === "number" && <span className="font-mono text-faint">{String(value)}</span>}
      </span>

      {def.type === "number" && (
        <input
          type="range"
          min={def.min}
          max={def.max}
          step={def.step ?? 1}
          value={Number(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-fg"
        />
      )}

      {def.type === "boolean" && (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-fg"
        />
      )}

      {def.type === "select" && (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-line bg-subtle px-3 py-1.5 text-sm text-fg outline-none focus:border-line-strong"
        >
          {(def.options ?? []).map((o) => (
            <option key={o} value={o} className="bg-panel">
              {o}
            </option>
          ))}
        </select>
      )}

      {def.type === "color" && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={isHex(value) ? value.trim() : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-line bg-transparent"
          />
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-lg border border-line bg-subtle px-3 py-1.5 font-mono text-xs text-fg outline-none focus:border-line-strong"
          />
        </div>
      )}

      {def.type === "colors" && (
        <input
          type="text"
          value={Array.isArray(value) ? (value as string[]).join(", ") : String(value ?? "")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          className="rounded-lg border border-line bg-subtle px-3 py-1.5 font-mono text-xs text-fg outline-none focus:border-line-strong"
        />
      )}
    </label>
  );
}

function TextControl({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const current = String(value ?? "");
  const [draft, setDraft] = useState(current);

  useEffect(() => {
    setDraft(String(value ?? ""));
  }, [value]);

  const dirty = draft !== current;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{def.label ?? def.name}</span>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty) onChange(draft);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded-lg border border-line bg-subtle px-3 py-1.5 text-sm text-fg outline-none focus:border-line-strong"
        />
        <button
          type="submit"
          disabled={!dirty}
          aria-label="Aplicar texto"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-subtle text-fg/70 transition hover:border-line-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </label>
  );
}
