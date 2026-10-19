---
name: list-experiments
description: >-
  Use when the user asks for an up-to-date list, count, slugs, categories or
  components of the experiments ("lista de experimentos", "qué experimentos
  hay", "cuántos hay en naturaleza"). Runs a deterministic script over
  src/content/experiments and prints them grouped by category. Do not use for
  UI pieces in src/content/ui.
---

# Listar experimentos

## Cuándo se activa

- El usuario pide la lista actual de experimentos, sus slugs, títulos,
  componentes o el recuento por categoría.
- Hace falta una lista fiable para revisar o reclasificar sin leer los `.md` a mano.

No es para listar piezas de `src/content/ui/` (tienen su propia colección).

## Comando

Desde la raíz del repo:

```bash
node .opencode/skills/list-experiments/scripts/list-experiments.mjs
```

Opciones:

```bash
node .opencode/skills/list-experiments/scripts/list-experiments.mjs --json
node .opencode/skills/list-experiments/scripts/list-experiments.mjs --category naturaleza
```

- `--json`: devuelve `{ total, counts, experiments }`.
- `--category <slug>`: filtra por una categoría válida.
- `-h`, `--help`: ayuda.

## Qué hace

1. Lee `src/content/experiments/*.md` (el slug es el nombre del archivo).
2. Extrae `title`, `category` y `component` del frontmatter.
3. Lee el orden de categorías de `EXPERIMENT_CATEGORIES` en
   `src/lib/categories.ts` (no lo duplica).
4. Valida que todas las categorías del frontmatter existan en ese enum; si no,
   avisa por stderr y sale con código 1.
5. Ordena por categoría y luego por título (locale `es`) y muestra el recuento.

Salida por defecto:

```text
Experimentos: 87

geometria (27)
  animated-dots  Animated Dots  AnimatedBackground
  ...

naturaleza (24)
  ...
```

## Notas

- Es determinista: no usa red, base de datos ni estado previo; solo el
  filesystem.
- No hay que actualizar ninguna lista hardcodeada al añadir o mover
  experimentos: el script siempre refleja el estado actual.
- La fuente de verdad de las categorías es `src/lib/categories.ts`
  (`EXPERIMENT_CATEGORIES`). Si se añade una categoría, el script la recoge sola.
