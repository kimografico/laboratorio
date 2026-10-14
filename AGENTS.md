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
- `src/components/ui/` — UI de la galería (`Gallery`, `ExperimentPreview`, `Stage`) y piezas
  de interfaz (`Button`, `ThemeToggle`).
- `src/components/ui/icons/*.astro` — iconos animados reutilizables.
- `src/content/experiments/*.md` — metadatos de cada experimento (frontmatter + uso).
- `src/content/ui/*.md` — metadatos de cada pieza de interfaz (frontmatter + uso).
- `src/lib/registry.tsx` — mapa `component` (string) → componente React.
- `src/lib/props.ts` — tipos del playground de props (`PropDef`).
- `src/lib/theme.ts` — tema activo (`useTheme`), resolución de colores y `applyTheme` para las previews.
- `src/pages/experiment/[id].astro` — detalle de experimento (playground + snippet).
- `src/pages/ui/index.astro` + `src/pages/ui/[id].astro` — listado y detalle de piezas de interfaz.
- `src/styles/global.css` — Tailwind + tokens de tema + clase compartida `.bg-canvas` + estilos de markdown.
- `src/components/ui/ThemeToggle.tsx` — toggle claro/oscuro (persiste en `localStorage`).
- `+/*.astro` — material original (no se compila; excluido en `tsconfig.json`).

## Convenciones

- Componentes de canvas usan el wrapper `<div className="bg-canvas">` y limpian
  `ResizeObserver`, listeners de `window` y `requestAnimationFrame` en el cleanup del `useEffect`.
- Cada componente nuevo debe registrarse en `src/lib/registry.tsx`; los experimentos llevan su `.md`
  en `src/content/experiments/` y las piezas de interfaz en `src/content/ui/`. El listado de piezas
  reutiliza `Gallery` con `basePath="/ui"`.
- En frontmatter YAML, cita cualquier valor que contenga `: `.
- UI con temas: usa tokens semánticos (`bg-surface`, `bg-panel`, `text-fg`, `text-muted`,
  `text-faint`, `bg-subtle`, `bg-subtle-strong`, `border-line`, `border-line-strong`) definidos
  en `global.css`. No uses colores fijos (`text-white`, `bg-[#141416]`) salvo en overlays sobre
  previews (badges, texto del hero, pantalla completa).
- Previews de experimentos: `Stage` recibe `themed` (nombres de props `color` que siguen el tema).
  Al estar en su valor por defecto, `background` adopta el color de lienzo del tema y `color`/
  `fill` se invierten (manteniendo el alfa) si no encajan con el tema activo. Si el usuario
  cambia un color en el playground, deja de seguir el tema. La lógica vive en `src/lib/theme.ts`.

## Conversión Astro → React

Usa el subagente **`astro-to-react`** (`.opencode/agent/astro-to-react.md`) para
convertir un `*.astro` a `*.tsx` siguiendo el contrato del proyecto.
