---
title: Info
description: "Acerca de Laboratorio, un proyecto de kimografico.com, y guía paso a paso para implementar los componentes en tu proyecto."
---

## Acerca de

**Laboratorio** es un proyecto de [kimografico.com](https://kimografico.com): un cuaderno de experimentos donde probamos fondos generativos sobre canvas y efectos tipográficos hechos con CSS puro, todos envueltos en componentes de React.

El mismo repositorio cumple dos funciones. Por un lado es el *showcase* que ves aquí, con un playground para ajustar cada componente en vivo y copiar su código de uso. Por otro, se compila y se publica como librería (`@kimografico/laboratorio`) para reutilizar esos componentes en Astro, Next.js o Vite.

Cada experimento documenta sus *props* y su acción sobre el lienzo. Los fondos reaccionan al cursor y se adaptan al tamaño del contenedor; los textos se animan con fotogramas clave y respetan la preferencia de `prefers-reduced-motion`. Buena parte del trabajo es artesanal y experimental: no es un sistema cerrado, sino un lugar para probar ideas.

## Cómo implementar

Los componentes se publican por **subrutas**, un archivo por componente, así que solo importas lo que usas. Cada uno trae su propio CSS: `theme.css` aporta los tokens y las utilidades semánticas, los fondos comparten `backgrounds/base.css`, cada texto tiene su `texts/<Nombre>.css` y las piezas de interfaz no necesitan CSS propio. En todos los casos añade `@source "../node_modules/@kimografico/laboratorio/dist"` en tu CSS para que Tailwind escanee las utilidades de la librería.

**Requisitos:** React 19 y React DOM 19 (peer dependencies) y Tailwind CSS v4 en el proyecto consumidor: los componentes usan utilidades de Tailwind. `lucide-react` va incluido como dependencia directa (lo usan `Button` y `ThemeToggle`).

Hay dos formas de llevar la librería a tu proyecto. **yalc** enlaza el paquete local dentro de tu proyecto: ideal si solo lo usas tú, porque ves los cambios sin reinstalar. **npm** lo reparte por nombre desde el registro público: necesario solo si quieres que cualquiera pueda instalarlo.

<details class="accordion">
<summary class="accordion__summary"><span class="accordion__title">Cómo implementar fondos (con yalc)</span><svg class="accordion__chevron" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>

<div class="accordion__body">

Flujo completo para usar los fondos desde el repositorio, sin publicar nada en npm.

**Instala yalc** (una sola vez, a nivel global):

```bash
npm install -g yalc
```

Y ahora, paso a paso:

1. **Construye la librería.** La build escribe un archivo por componente en `dist/`:

   ```bash
   npm run build:lib
   ```

2. **Publica el paquete en yalc.** No sube nada a internet: solo lo deja en tu almacén local (`~/.yalc`):

   ```bash
   yalc publish
   ```

3. **Añádelo en tu proyecto.** Copia el paquete en `node_modules` y deja un `yalc.lock` en la raíz:

   ```bash
   yalc add @kimografico/laboratorio
   ```

4. **Importa el CSS.** A un fondo solo le hacen falta el tema y el CSS común de los fondos (más `@source`, para que Tailwind escanee la librería):

   ```css
   @import "tailwindcss";
   @import "@kimografico/laboratorio/theme.css";
   @import "@kimografico/laboratorio/backgrounds/base.css";
   @source "../node_modules/@kimografico/laboratorio/dist";
   ```

5. **Usa el fondo** por su subruta (export por defecto). Necesita un contenedor con tamaño y `position: relative`:

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

6. **Hidrátalo.** Los fondos usan `useEffect`, así que en Astro monta el componente con una directiva de cliente (`client:visible` o `client:load`) y en Next.js el archivo debe llevar `"use client"`. En Vite no hace falta nada.

7. **Sincroniza tras cada cambio.** Si tocas un componente del repositorio, vuelve a construir y empuja; yalc actualiza tu proyecto sin reinstalar:

   ```bash
   npm run build:lib
   yalc push
   ```

</div>
</details>

<details class="accordion">
<summary class="accordion__summary"><span class="accordion__title">Cómo implementar textos (con yalc)</span><svg class="accordion__chevron" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>

<div class="accordion__body">

Mismo flujo que con los fondos, pero con el CSS y el uso propios de los efectos de texto.

**Instala yalc** (si aún no lo tienes):

```bash
npm install -g yalc
```

Y ahora, paso a paso:

1. **Construye la librería** en el repositorio:

   ```bash
   npm run build:lib
   ```

2. **Publica y añade** el paquete:

   ```bash
   yalc publish
   ```

   ```bash
   yalc add @kimografico/laboratorio
   ```

3. **Importa el CSS.** Cada efecto de texto tiene su propio archivo; importa el del que uses (se apoya en un CSS común que ya incluye):

   ```css
   @import "tailwindcss";
   @import "@kimografico/laboratorio/theme.css";
   @import "@kimografico/laboratorio/texts/FlipText.css";
   @source "../node_modules/@kimografico/laboratorio/dist";
   ```

4. **Usa el texto** por su subruta. Recibe el texto como hijos y lo divide en palabras y caracteres:

   ```tsx
   import FlipText from "@kimografico/laboratorio/texts/FlipText";

   export function Titulo() {
     return (
       <FlipText duration={4.5} loop>
         Hola mundo
       </FlipText>
     );
   }
   ```

5. **Sin hidratación.** Los efectos de texto son render puro (CSS, sin `useEffect`), así que en Astro se pueden servir sin directiva de cliente y en Next.js no necesitan `"use client"`.

6. **Sincroniza tras cada cambio:**

   ```bash
   npm run build:lib
   yalc push
   ```

</div>
</details>

<details class="accordion">
<summary class="accordion__summary"><span class="accordion__title">Cómo implementar componentes de interfaz (con yalc)</span><svg class="accordion__chevron" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>

<div class="accordion__body">

Flujo completo para `Button` y `ThemeToggle`. No llevan CSS propio: se apoyan en los tokens del tema y en utilidades de Tailwind.

**Instala yalc** (si aún no lo tienes):

```bash
npm install -g yalc
```

Y ahora, paso a paso:

1. **Construye la librería** en el repositorio:

   ```bash
   npm run build:lib
   ```

2. **Publica y añade** el paquete:

   ```bash
   yalc publish
   ```

   ```bash
   yalc add @kimografico/laboratorio
   ```

3. **Importa el CSS.** Solo hace falta el tema; añade `@source` para que Tailwind escanee las utilidades que usan estos componentes:

   ```css
   @import "tailwindcss";
   @import "@kimografico/laboratorio/theme.css";
   @source "../node_modules/@kimografico/laboratorio/dist";
   ```

4. **Usa las piezas** por subruta. `Button` acepta `variant`, `size`, `icon`, `badge`, `shape`, `color` (hex, vacío = tokens del tema), `disabled` y `href` (se renderiza como enlace):

   ```tsx
   import Button from "@kimografico/laboratorio/ui/Button";
   import ThemeToggle from "@kimografico/laboratorio/ui/ThemeToggle";

   export function Barra() {
     return (
       <header className="flex items-center justify-between">
         <Button label="Empezar" icon="arrow-right" variant="solid" />
         <Button label="Copiar" icon="copy" badge={3} href="/docs" />
         <ThemeToggle size="md" variant="toggle" />
       </header>
     );
   }
   ```

5. **Hidrata solo lo que haga falta.** `Button` es render puro y no necesita directiva de cliente. `ThemeToggle` usa `useEffect`, así que en Astro monta esa pieza con `client:visible` y en Next.js el archivo debe llevar `"use client"`. Con `interactive` cambia el tema real del sitio (clase `light` en `<html>` y `localStorage`); sin él, es solo visual.

6. **Sincroniza tras cada cambio:**

   ```bash
   npm run build:lib
   yalc push
   ```

</div>
</details>

<details class="accordion">
<summary class="accordion__summary"><span class="accordion__title">Cómo usar npm</span><svg class="accordion__chevron" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>

<div class="accordion__body">

Para cuando quieras repartir el paquete por nombre, desde el registro público de npm.

**Publicar**

1. **Crea una cuenta** npm gratuita en [npmjs.com](https://www.npmjs.com) y verifica el correo.

2. **Inicia sesión** en el repositorio del laboratorio:

   ```bash
   npm login
   ```

3. **Comprueba que el nombre está libre** (un error de 404 significa que aún no está publicado):

   ```bash
   npm view @kimografico/laboratorio
   ```

4. **Sube la versión** en `package.json`. npm no deja republicar una versión ya publicada, así que cada publicación necesita un número nuevo.

5. **Publica.** El `prepack` ejecuta `build:lib` automáticamente:

   ```bash
   npm publish --access public
   ```

   `--access public` es obligatorio: los *scopes* (`@kimografico/…`) son privados de forma predeterminada y hay que declararlos públicos para que cualquiera pueda instalarlos. npm además pide doble factor de autenticación (2FA) para publicar.

**Consumir**

1. **Instálalo** en cualquier proyecto:

   ```bash
   npm install @kimografico/laboratorio
   ```

2. **Importa el CSS** igual que con yalc (`theme.css` más `backgrounds/base.css` y/o `texts/<Nombre>.css`).

3. **Usa los componentes** por subruta, igual que antes.

4. **Actualiza** cuando salga una versión nueva:

   ```bash
   npm update @kimografico/laboratorio
   ```

</div>
</details>

## El repositorio

Este repositorio es a la vez la librería y el showcase que la documenta. La build de la librería va a `dist/` (un archivo y sus tipos por componente) y la del sitio, a `dist-site/`. Para trabajar en él:

```bash
npm run dev        # servidor de desarrollo
npm run build      # build del sitio estático  -> dist-site/
npm run build:lib  # build de la librería      -> dist/
npm run check      # typecheck (astro + TS)
```

Para consumirla desde otro proyecto sin publicarla en npm tienes dos caminos: enlazarla en local con **yalc** (queda enlazada en `node_modules` y se sincroniza con `yalc push`) o instalar un tarball estático con **npm pack**.

```bash
# yalc: enlace local, se sincroniza solo
yalc publish                      # en el repo (tras npm run build:lib)
yalc add @kimografico/laboratorio # en tu proyecto
yalc push                         # en el repo, tras cada cambio

# npm pack: copia estática en un .tgz
npm pack                                 # en el repo (dispara build:lib)
npm install ../laboratorio/kimografico-laboratorio-0.1.0.tgz   # en tu proyecto
```

Si añades un componente, regístralo en `src/lib/registry.tsx` y crea su `.md` en `src/content/experiments/`. El listado de la galería se genera solo a partir de esos metadatos.

## Créditos y condiciones

© 2026 [kimografico.com](https://kimografico.com). Todos los derechos reservados. La marca, los textos y el diseño de este sitio pertenecen a kimografico.com.

El código se publica como muestra técnica y experimental, «tal cual», sin garantía de ningún tipo. Puedes leerlo y aprender de él; para reutilizarlo en un proyecto en producción, escríbenos antes para acordar las condiciones.
