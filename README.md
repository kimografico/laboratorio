# @kimografico/laboratorio

Fondos interactivos (canvas) y componentes de UI en **React** (19 + botón + toggle + texto),
listos para incrustar en **Astro**, **Next.js** o **Vite**.

> Este repositorio es a la vez la **librería** y el **showcase** que la documenta.
> La build de la librería va a `dist/`; la del sitio, a `dist-site/`.

## Componentes

- `backgrounds` — `AnimatedBackground`, `AuroraBackground`, `ContourBackground`, `CrossBackground`,
  `DotBackground`, `FlowBackground`, `MantaBackground`, `MatrixBackground`, `NeedleBackground`,
  `NetworkBackground2`, `PlanktonBackground`, `RidgeBackground`, `RingsBackground`, `ShoalBackground`,
  `TentacleBackground`, `TileBackground`, `TileSpinBackground`, `TriangleBackground2`,
  `WarpGridBackground`. Cada uno exporta además su tipo `*Props`.
- `FlipText` (+ `FlipTextProps`) — texto con animación de volteo por carácter.
- `Button` (+ `ButtonProps`) — botón configurable (variantes, tamaños, iconos, color).
- `ThemeToggle` — conmutador claro/oscuro.

## Requisitos

- **React** >= 19 y **React DOM** >= 19 (peer dependencies).
- **Tailwind CSS v4** en el proyecto consumidor (los componentes usan utilidades de Tailwind).

`lucide-react` es dependencia directa (lo usan `Button` y `ThemeToggle`).

## Instalación

```bash
npm install @kimografico/laboratorio
```

## Uso

### 1. CSS

Importa el tema después de Tailwind. `theme.css` aporta los tokens (`--surface`, `--fg`, …),
`.bg-canvas` y los estilos de `FlipText`:

```css
/* tu CSS principal */
@import "tailwindcss";
@import "@kimografico/laboratorio/theme.css";

/* deja que Tailwind escanee las clases que vienen compiladas en la librería */
@source "../node_modules/@kimografico/laboratorio/dist";
```

### 2. Fondos (canvas)

Necesitan un contenedor con tamaño y `position: relative`:

```tsx
import { AuroraBackground } from "@kimografico/laboratorio";

export function Hero() {
  return (
    <div className="relative h-96 overflow-hidden rounded-2xl">
      <AuroraBackground colors={["#ee3d3d", "#f5a623", "#2b4eff"]} />
      <h1 className="relative z-10 p-8 text-3xl text-fg">Hola</h1>
    </div>
  );
}
```

En **Astro**:

```astro
---
import { AuroraBackground } from "@kimografico/laboratorio";
---
<div class="relative h-96 overflow-hidden rounded-2xl">
  <AuroraBackground client:visible />
</div>
```

En **Next.js** (App Router) el archivo debe llevar `"use client"` (los fondos usan `useEffect`).

### 3. Botón

```tsx
import { Button } from "@kimografico/laboratorio";

<Button label="Descargar" icon="download" />

{/* color propio (hex); sin `color` usa los tokens del tema */}
<Button label="Acción" variant="solid" color="#2b4eff" />

{/* solo icono, forma y ancho */}
<Button icon="heart" iconOnly shape="circle" />
```

Props: `label`, `variant` (`solid` | `outline` | `ghost`), `size` (`xs` | `sm` | `md` | `lg`),
`icon` (`none` | `arrow-right` | `plus` | `check` | `download` | `search` | `heart`),
`iconPosition` (`left` | `right`), `iconOnly`, `shape` (`circle` | `rounded` | `squared`),
`fullWidth`, `color`, `disabled`.

### 4. Texto

```tsx
import { FlipText } from "@kimografico/laboratorio";

<FlipText duration={4.5} loop>
  Hola mundo
</FlipText>
```

### 5. ThemeToggle

```tsx
import { ThemeToggle } from "@kimografico/laboratorio";

<ThemeToggle size="sm" variant="toggle" shape="circle" interactive />
```

Con `interactive` alterna la clase `html.light` y persiste en `localStorage` (requiere `theme.css`
para los tokens). Sin `interactive` es solo visual.

## Desarrollo

```bash
npm run dev        # showcase en http://localhost:4321
npm run build:lib  # librería  -> dist/        (dist/index.js + dist/index.d.ts)
npm run build      # showcase  -> dist-site/
npm run check      # astro check
```

## Publicar / consumir desde otro proyecto

La librería se compila a `dist/` (ESM + tipos). Tres formas de usarla:

**a) Tarball local** (sin publicar en npm):

```bash
# en este repo (prepack dispara build:lib)
npm pack
# en el otro proyecto
npm install ../laboratorio/kimografico-laboratorio-0.1.0.tgz
```

**b) Workspace / monorepo**: referencia la carpeta del repo como package y añade el `@source`
de Tailwind apuntando a `dist/` (o a `src/` si transpilas el código fuente).

**c) Publicar**:

```bash
npm publish --access public
```

## Licencia

Sin licencia definida (uso interno).
