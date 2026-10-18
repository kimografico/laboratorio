# AGENTS.md — Laboratorio

Showcase de **fondos interactivos y efectos de texto** en React, servido con Astro.
El mismo repo se publica como **librería** (`@kimografico/laboratorio`): la build de la lib va a
`dist/` (tsup: ESM + tipos) y la del sitio, a `dist-site/`.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción del sitio (estático) → `dist-site/`
- `npm run build:lib` — build de la librería (tsup) → `dist/`
- `npm run preview` — previsualiza el build
- `npm run check` (o `npx astro check`) — typecheck de `.astro` + TS. Requiere TypeScript 6.
- `npm pack` — genera el tarball de la librería (dispara `prepack` → `build:lib`).

## Estructura

- `src/components/backgrounds/*.tsx` — experimentos de fondo (React, canvas).
- `src/components/texts/*.tsx` — experimentos de texto (React).
- `src/components/ui/` — UI de la galería (`Gallery`, `ExperimentPreview`, `Stage`) y piezas
  de interfaz (`Button`, `ThemeToggle`).
- `src/components/ui/icons/*.astro` — iconos animados reutilizables.
- `src/content/experiments/*.md` — metadatos de cada experimento (frontmatter + uso).
- `src/content/ui/*.md` — metadatos de cada pieza de interfaz (frontmatter + uso).
- `src/content/pages/*.md` — contenido de las páginas de texto (colección `pages`; p. ej. `info.md`).
- `src/lib/registry.tsx` — mapa `component` (string) → componente React.
- `src/lib/base.ts` — `base`/`withBase` (prefijo del `base` de Astro para enlaces internos).
- `src/lib/props.ts` — tipos del playground de props (`PropDef`).
- `src/lib/text.ts` — frases compartidas de los experimentos de texto (`PHRASES`), override en
  `localStorage` y hooks (`useSharedText`, `applySharedText`, `resolveSharedText`).
- `src/lib/theme.ts` — tema activo (`useTheme`), resolución de colores y `applyTheme` para las previews.
- `src/pages/experiment/[id].astro` — detalle de experimento (playground + snippet).
- `src/pages/ui/index.astro` + `src/pages/ui/[id].astro` — listado y detalle de piezas de interfaz.
- `src/styles/global.css` — Tailwind + importa `theme.css` y el CSS de cada componente + estilos de
  markdown (uso del sitio).
- `src/styles/theme.css` — tokens de tema (solo variables). **Es el CSS base que se exporta**
  (`@kimografico/laboratorio/theme.css`). El CSS de cada componente vive junto a él:
  `src/components/backgrounds/base.css` (fondos canvas) y `src/components/texts/<Nombre>.css`
  (textos animados; comparten `_shared.css`).
- `src/components/ui/ThemeToggle.tsx` — toggle claro/oscuro (persiste en `localStorage`).
- `tsup.config.ts` — build de la librería.
- `.opencode/skills/publish-tsx-experiment/` — skill con scripts (`inventory`, `scaffold`,
  `verify`) para publicar `.tsx` de `+/` como experimentos; apoyo del agente `tsx-to-experiment`.
- `+/*.astro` — material original (no se compila; excluido en `tsconfig.json`).

## Convenciones

- Componentes de canvas usan el wrapper `<div className="bg-canvas">` y limpian
  `ResizeObserver`, listeners de `window` y `requestAnimationFrame` en el cleanup del `useEffect`.
- Cada componente nuevo debe registrarse en `src/lib/registry.tsx`; los experimentos llevan su `.md`
  en `src/content/experiments/` y las piezas de interfaz en `src/content/ui/`. El listado de piezas
  reutiliza `Gallery` con `basePath="/ui"`.
- **Categoría de entrada:** todo experimento nuevo en `src/content/experiments/` entra con
  `category: pendiente` (fondo, texto o cualquier otro tipo). No lo reclasifiques a `backgrounds`
  o `texts` al crearlo; esa revisión es manual, con el skill `change-experiment-category`. Las
  piezas de `src/content/ui/` usan su propia categoría de colección (por defecto `buttons`).
- Los componentes reutilizables (fondos, `FlipText`, `Button`, `ThemeToggle`) se publican como
  **subrutas** (`@kimografico/laboratorio/backgrounds/<Nombre>`, `.../texts/FlipText`, `.../ui/Button`).
  No hay barrel: `tsup.config.ts` genera un entry por componente y `Gallery`, `ExperimentPreview` y
  `Stage` quedan fuera del paquete. Cada componente lleva su CSS al lado (`texts/<Nombre>.css`).
- En frontmatter YAML, cita cualquier valor que contenga `: `.
- UI con temas: usa tokens semánticos (`bg-surface`, `bg-panel`, `text-fg`, `text-muted`,
  `text-faint`, `bg-subtle`, `bg-subtle-strong`, `border-line`, `border-line-strong`) definidos
  en `theme.css`. No uses colores fijos (`text-white`, `bg-[#141416]`) salvo en overlays sobre
  previews (badges, texto del hero, pantalla completa).
- Previews de experimentos: `Stage` recibe `themed` (nombres de props `color` que siguen el tema).
  Al estar en su valor por defecto, `background` adopta el color de lienzo del tema y `color`/
  `fill` se invierten (manteniendo el alfa) si no encajan con el tema activo. Si el usuario
  cambia un color en el playground, deja de seguir el tema. La lógica vive en `src/lib/theme.ts`.
