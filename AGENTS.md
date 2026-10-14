# AGENTS.md — Laboratorio

Showcase de **fondos interactivos y efectos de texto** en React, servido con Astro.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (estático)
- `npm run preview` — previsualiza el build
- `npm run check` (o `npx astro check`) — typecheck de `.astro` + TS. Requiere TypeScript 6.

## Estructura

- `src/components/backgrounds/*.tsx` — experimentos de fondo (React, canvas).
- `src/components/texts/*.tsx` — experimentos de texto (React).
- `src/components/ui/` — UI de la galería (`Gallery`, `ExperimentPreview`, `Stage`).
- `src/content/experiments/*.md` — metadatos de cada experimento (frontmatter + uso).
- `src/lib/registry.tsx` — mapa `component` (string) → componente React.
- `src/lib/props.ts` — tipos del playground de props (`PropDef`).
- `src/styles/global.css` — Tailwind + tokens de tema + clase compartida `.bg-canvas` + estilos de markdown.
- `src/components/ui/ThemeToggle.tsx` — toggle claro/oscuro (persiste en `localStorage`).
- `+/*.astro` — material original (no se compila; excluido en `tsconfig.json`).

## Convenciones

- Componentes de canvas usan el wrapper `<div className="bg-canvas">` y limpian
  `ResizeObserver`, listeners de `window` y `requestAnimationFrame` en el cleanup del `useEffect`.
- Cada componente nuevo debe registrarse en `src/lib/registry.tsx` y tener su `.md` en `src/content/experiments/`.
- En frontmatter YAML, cita cualquier valor que contenga `: `.
- UI con temas: usa tokens semánticos (`bg-surface`, `bg-panel`, `text-fg`, `text-muted`,
  `text-faint`, `bg-subtle`, `bg-subtle-strong`, `border-line`, `border-line-strong`) definidos
  en `global.css`. No uses colores fijos (`text-white`, `bg-[#141416]`) salvo en overlays sobre
  previews (badges, texto del hero, pantalla completa).

## Conversión Astro → React

Usa el subagente **`astro-to-react`** (`.opencode/agent/astro-to-react.md`) para
convertir un `*.astro` a `*.tsx` siguiendo el contrato del proyecto.
