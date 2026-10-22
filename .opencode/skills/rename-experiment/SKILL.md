---
name: rename-experiment
description: >-
  Use ONLY when the user explicitly asks to rename an experiment's slug, its
  React component, or both ("renombra doble-rendija a double-slit", "cambia el
  componente FooBackground por BarBackground"). Updates the .md filename and
  frontmatter, the component and its owned CSS, registry imports/entries,
  global.css imports and internal references. Do NOT use for creating, deleting,
  recategorizing, restyling or changing the defaults of an experiment.
---

# Renombrar un experimento

Renombra el **slug**, el **componente React** o ambos, y deja coherentes la
página, el registro, el CSS y las referencias internas. No cambia el diseño, las
props, los defaults, la categoría ni el comportamiento del experimento.

## Cuándo usarlo

Solo cuando el usuario lo pide explícitamente:

- “renombra `doble-rendija` a `double-slit`”
- “cambia el componente `FooBackground` por `BarBackground`”
- “renombra el experimento y todo lo que dependa de él”

No lo ejecutes de forma proactiva ni como parte automática de otro flujo.

## Qué actualiza

Por cada renombrado:

1. **Slug:** renombra `src/content/experiments/<old>.md` y actualiza los enlaces
   internos del tipo `/experiment/<old>`.
2. **Componente:** renombra
   `src/components/backgrounds/<Old>.tsx` o
   `src/components/texts/<Old>.tsx`, y actualiza el identificador dentro del
   archivo (`Old` y tipos `OldProps`/`OldRef`/`OldHandle`/`OldContext`).
3. **CSS propio:** renombra `<Old>.css` y `<Old>.*.css` junto al componente, y
   actualiza su import en `src/styles/global.css`.
4. **Frontmatter:** actualiza `component:` y los ejemplos de uso del `.md`.
5. **Registro:** actualiza el import y la entrada en `src/lib/registry.tsx`.
6. **Referencias internas:** recorre `src`, `README.md` y `AGENTS.md` para
   actualizar imports, JSX, tipos y enlaces al slug.

No se tocan:

- `+/`
- `src/content/ui/`
- `dist/` ni `dist-site/`
- `package.json` ni `tsup.config.ts` (los entries de la librería son por glob)
- El `title`, `description`, `category`, `props` ni los defaults del `.md`
- Los nombres de clases CSS internas
- Código de consumidores externos al repositorio

## Comandos

Renombrar solo el slug:

```powershell
pwsh .opencode/skills/rename-experiment/scripts/rename.ps1 `
  -Slug doble-rendija `
  -NewSlug double-slit `
  -DryRun
```

Renombrar solo el componente:

```powershell
pwsh .opencode/skills/rename-experiment/scripts/rename.ps1 `
  -Slug aurora `
  -NewComponent AuroraV2Background `
  -DryRun
```

Renombrar ambos:

```powershell
pwsh .opencode/skills/rename-experiment/scripts/rename.ps1 `
  -Slug doble-rendija `
  -NewSlug double-slit `
  -NewComponent DoubleSlitBackground `
  -DryRun
```

Buscar por componente en lugar de por slug:

```powershell
pwsh .opencode/skills/rename-experiment/scripts/rename.ps1 `
  -Component FooBackground `
  -NewSlug foo `
  -DryRun
```

Quita `-DryRun` cuando el plan sea correcto.

Opciones:

- `-Slug`: slug actual. Es la forma recomendada.
- `-Component`: componente actual; se usa si no se conoce el slug.
- `-NewSlug`: nuevo slug, kebab-case en minúsculas.
- `-NewComponent`: nuevo componente, PascalCase alfanumérico.
- `-Root <ruta>`: raíz alternativa para probar el script con un fixture.
- `-DryRun`: muestra renombrados y archivos que se actualizarían, sin escribir.

Se puede pasar `-Slug` y `-Component` a la vez si coinciden; el script lo valida.

## Reglas de nombres

- Slug: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, por ejemplo `doble-rendija`.
- Componente: `^[A-Z][A-Za-z0-9]*$`, por ejemplo `DobleRendijaBackground`.
- No se admiten cambios que solo alteren mayúsculas/minúsculas en Windows.
- El script aborta si el slug, el componente, el CSS o la entrada del registro ya
  existen.
- Si el componente existe en `backgrounds/` y `texts/`, aborta por ambigüedad.

## Después de renombrar

El script actualiza las referencias internas, pero los consumidores externos de
la librería tendrán que cambiar sus imports:

```tsx
// antes
import FooBackground from "@kimografico/laboratorio/backgrounds/FooBackground";

// después
import BarBackground from "@kimografico/laboratorio/backgrounds/BarBackground";
```

Verifica:

```powershell
npm run check
npm run build
npm run build:lib
```

Y comprueba que la ruta nueva se genera:

```powershell
Test-Path dist-site/experiment/<new-slug>
```

Debe devolver `True`. La ruta antigua debe dejar de existir tras el build.

## Notas

- El `title` del `.md` no cambia automáticamente. Si el nuevo slug debe tener
  otro título visible, edítalo aparte.
- Las clases CSS internas (`flip-text`, etc.) no se renombran; el CSS sigue
  funcionando aunque el archivo y el componente cambien de nombre.
- El script actualiza `README.md` y `AGENTS.md` si mencionan el componente o el
  slug. No modifica documentación externa ni `.opencode/`.
- `dist/` y `dist-site/` son generados: no los edites a mano.
- Si el componente está referenciado desde fuera de `src`, revisa esos archivos
  antes de publicar la librería.
