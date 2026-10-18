# @kimografico/laboratorio

Fondos interactivos (canvas), efectos de texto y piezas de UI en **React 19**, listos para
incrustar en **Astro**, **Next.js** o **Vite**.

> Este repositorio es a la vez la **librería** y el **showcase** que la documenta.
> La build de la librería va a `dist/`; la del sitio, a `dist-site/`.

## Componentes

Todos se importan por **subruta** (un archivo por componente), así que solo traes lo que usas.

- **`backgrounds/…`** — 75 fondos de canvas (`AuroraBackground`, `LavaLampBackground`,
  `MatrixBackground`, `PlanktonBackground`, …). Cada uno exporta además su tipo
  `*BackgroundProps`. El listado completo vive en el showcase del repositorio.
- **`texts/…`** — 11 efectos de texto, render puro con CSS (sin hidratación): `FlipText`,
  `FadeUpText`, `BlurInText`, `ScaleInText`, `TrackingInText`, `TiltInText`, `WaveText`,
  `ShineText`, `GlowText`, `GlitchText`, `TypewriterText`.
- **`ui/…`** — `Button` (+ `ButtonProps`) y `ThemeToggle`. `Gallery`, `ExperimentPreview` y
  `Stage` son internos del showcase y no se publican.

## Requisitos

- **React** >= 19 y **React DOM** >= 19 (peer dependencies).
- **Tailwind CSS v4** en el proyecto consumidor (los componentes usan utilidades de Tailwind).

`lucide-react` es dependencia directa (lo usan `Button` y `ThemeToggle`).

## Instalación

Hay dos caminos, y el que te convenga depende de si solo la usas tú o quieres repartirla.

**yalc** — enlaza el paquete local de este repo dentro de tu proyecto. Es el mejor para iterar:
los cambios se ven sin reinstalar.

```bash
yalc publish                      # en este repo (tras npm run build:lib)
yalc add @kimografico/laboratorio # en tu proyecto
```

**npm** — para instalarla por nombre desde el registro público.

```bash
npm install @kimografico/laboratorio
```

En ambos casos la librería se resuelve igual: `@kimografico/laboratorio/<subruta>`.

## Uso

### 1. CSS

Importa el tema (tokens) después de Tailwind y, por cada componente que uses, su CSS. La
librería se importa por subrutas (un archivo por componente), así que solo traes lo que usas:

```css
/* tu CSS principal */
@import "tailwindcss";
@import "@kimografico/laboratorio/theme.css";

/* fondos canvas (común a todos los *Background) */
@import "@kimografico/laboratorio/backgrounds/base.css";

/* textos animados: importa solo los que uses (FlipText, FadeUpText, …) */
@import "@kimografico/laboratorio/texts/FlipText.css";

/* deja que Tailwind escanee las clases que vienen compiladas en la librería */
@source "../node_modules/@kimografico/laboratorio/dist";
```

`theme.css` aporta los tokens (`--surface`, `--fg`, …) y las utilidades del tema; cada
componente trae su propio CSS junto al componente. Las piezas de `ui/` no necesitan CSS propio.

### 2. Fondos (canvas)

Necesitan un contenedor con tamaño y `position: relative`:

```tsx
import AuroraBackground from "@kimografico/laboratorio/backgrounds/AuroraBackground";

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
import AuroraBackground from "@kimografico/laboratorio/backgrounds/AuroraBackground";
---
<div class="relative h-96 overflow-hidden rounded-2xl">
  <AuroraBackground client:visible />
</div>
```

En **Next.js** (App Router) el archivo debe llevar `"use client"` (los fondos usan `useEffect`).

### 3. Textos

Render puro con CSS: no usan `useEffect`, así que no necesitan directiva de cliente en Astro ni
`"use client"` en Next.js.

```tsx
import FlipText from "@kimografico/laboratorio/texts/FlipText";

<FlipText duration={4.5} loop>
  Hola mundo
</FlipText>
```

### 4. Botón

```tsx
import Button from "@kimografico/laboratorio/ui/Button";

<Button label="Descargar" icon="download" />

{/* color propio (hex); sin `color` usa los tokens del tema */}
<Button label="Acción" variant="solid" color="#2b4eff" />

{/* solo icono, forma y ancho */}
<Button icon="heart" iconOnly shape="circle" />

{/* como enlace */}
<Button label="Docs" href="/docs" />
```

Props: `label`, `variant` (`solid` | `outline` | `ghost`), `size` (`xs` | `sm` | `md` | `lg`),
`icon` (`none` | `arrow-left` | `arrow-right` | `plus` | `check` | `download` | `search` |
`heart` | `rotate-ccw` | `maximize` | `minimize` | `copy`), `iconPosition` (`left` | `right`),
`iconOnly`, `shape` (`circle` | `rounded` | `squared`), `badge`, `fullWidth`, `color`,
`disabled`, `href`.

### 5. ThemeToggle

```tsx
import ThemeToggle from "@kimografico/laboratorio/ui/ThemeToggle";

<ThemeToggle size="sm" variant="toggle" shape="circle" interactive />
```

`variant` (`toggle` | `solid` | `mini` | `solid-mini`), `size`, `shape` (modos mini). Con
`interactive` alterna la clase `html.light` y persiste en `localStorage`; sin él es solo
visual. Usa `useEffect`, así que en **Astro** monta esta pieza con `client:visible` y en
**Next.js** el archivo debe llevar `"use client"`.

## Desarrollo

```bash
npm run dev        # showcase en http://localhost:4321
npm run build:lib  # librería  -> dist/        (un archivo + tipos por componente)
npm run build      # showcase  -> dist-site/
npm run check      # astro check
```

## Llevarla a otro proyecto

La librería se compila a `dist/` (ESM + tipos). Tres formas de usarla fuera de este repo:

**a) yalc** (enlace local, se sincroniza solo — lo recomendado para iterar):

```bash
yalc publish                      # en este repo (tras npm run build:lib)
yalc add @kimografico/laboratorio # en tu proyecto
yalc push                         # en este repo, tras cada cambio
```

**b) npm pack** (copia estática en un `.tgz`, sin publicar):

```bash
npm pack                                 # en este repo (dispara build:lib)
npm install ../laboratorio/kimografico-laboratorio-0.1.0.tgz   # en tu proyecto
```

**c) Publicar en npm** (para que cualquiera la instale por nombre):

```bash
npm login
npm publish --access public
```

`--access public` es obligatorio: los scopes (`@kimografico/…`) son privados de forma
predeterminada y hay que declararlos públicos. npm además pide doble factor (2FA) para
publicar.

## Licencia

Sin licencia definida (uso interno).
