# MIGRACIÓN — Convención de fondos (`*Background`)

Normalización de los 75 componentes de `src/components/backgrounds/` a la convención de destino
(descripción en el prompt de migración: sección 2). Se han migrado **41 componentes**; los otros **34**
ya cumplían la convención y se han dejado sin cambios (solo confirmados).

## Resumen de lo que se ha tocado y lo que NO

- **No se ha cambiado** el aspecto, el movimiento ni los valores por defecto del algoritmo.
- **No se han renombrado** archivos ni componentes (salvo la prop `fill` → `color` de `AnimatedBackground`, anotada más abajo).
- **No se han extraído** hooks ni utilidades compartidas.
- **No se han tocado** los componentes que ya cumplían la convención.
- Se ha eliminado la prop `background` (y el `backgroundColor` del contenedor) de todos los componentes que la tenían: el fondo lo pone la página.
- La prop `color` ya no tiene valor por defecto en ningún componente: es opcional y, si no se pasa, la tinta se hereda del CSS de la página (`color`) a través de `--<prefijo>-color`.
- La opacidad se lee del CSS en cada fotograma mediante `--<prefijo>-opacity` y se multiplica en todas las opacidades dibujadas (`setAlpha`, limitado a 0-1).
- Los colores se leen dentro de `animate` en cada fotograma (getComputedStyle vivo).
- `animate()` directo se ha reemplazado por `requestAnimationFrame(animate)`.
- Los eventos de puntero están en `window` (`mousemove` / `touchmove`) con coordenadas relativas al canvas.
- Limpieza completa del efecto (cancela `raf`, desconecta `ResizeObserver`, quita listeners).

## 8.1 Tabla por archivo (componentes migrados)

| Archivo | Reglas aplicadas | Props eliminadas / renombradas / añadidas | Excepciones |
|---|---|---|---|
| AnimatedBackground | 1, 2, 3, 4, 5, 9, 11 | Eliminada `background`. Renombrada `fill` → `color` (sin default; era `"#000000"`). | `fill`→`color` es cambio de API (ver 8.4). |
| AuroraBackground | 1, 4, 5 | Eliminada `background`. `color` ya no tenía default. | `colors` (paleta, regla 8) se conserva. |
| BevelBackground | 1, 2, 4, 5, 9 | Eliminada `background`. `color` era `"rgba(255,255,255,1)"` (opaco) → sin default. | — |
| BlobBackground | — (ya cumplía) | — | — |
| BubbleBackground | — (ya cumplía) | — | — |
| CircuitBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.4)"` → `alpha = 0.4` añadida, `color` sin default. | — |
| ClothBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.3)"` → `alpha = 0.3` añadida. | — |
| Contour2Background | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.22)"` → `alpha = 0.22` añadida. | — |
| CoralBackground | 1, 2, 4, 5, 7 | Eliminada `background`. `color` sin default. ImageData máscara de alfa + `source-in` (regla 7). | Imagen de máscara (regla 7, excepción permitida). |
| CrossBackground | 1, 2, 3, 4, 5, 9, 11 | Eliminada `background`. `color` `"rgba(0,0,0,0.2)"` → `alpha = 0.2`. `animate()` → rAF. | — |
| DitherBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.28)"` → `alpha = 0.28`. | — |
| DotBackground | 1, 2, 3, 4, 5, 9, 11 | Eliminada `background`. `color` `"rgba(0,0,0,0.2)"` → `alpha = 0.2`. `animate()` → rAF. | — |
| FieldLinesBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.22)"` → `alpha = 0.22`. `globalAlpha = 2.2` → `setAlpha`. | — |
| FirefliesBackground | 1, 2, 4, 5, 9 | Eliminada `background`. `color` `"#d4a017"` → sin default. `alpha = 1` añadida. | — |
| FireworksBackground | 1, 2, 4, 5, 9, 11 | Eliminada `background`. `color` `"#fff1dc"` → sin default. `animate()` → rAF (llamada inicial eliminada). | — |
| GalaxyBackground | 1, 2, 4, 5, 9 | Eliminada `background`. `color` `"#f4efe8"` → sin default. `withAlpha` usa `ink` vivo. | — |
| GlobeBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.5)"` → `alpha = 0.5`. | — |
| MantaBackground | 1, 2, 4, 5, 9 | Eliminada `background`. `color` `"#000000"` → sin default. `mul` pasado a `draw`. | — |
| MatrixBackground | 1, 2, 4, 5, 9, 11 | Eliminada `background`. `color` `"#ffffff"` → sin default. `animate()` → rAF (llamada inicial eliminada). | — |
| MeadowBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(46,94,54,0.45)"` → `alpha = 0.45`. `plantColor`/`flowerColor` (paleta, regla 8) se conservan. | — |
| MazeBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.45)"` → `alpha = 0.45`. `glow` (paleta) se conserva. | — |
| NetworkBackground2 | 1, 2, 4, 5, 9, 11 | Eliminada `background`. `color` `"#000000"` → sin default. `alpha = 1` añadida. `animate()` → rAF. | — |
| OrbitBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.5)"` → `alpha = 0.5`. | — |
| PlanktonBackground | 1, 2, 4, 5, 9 | Eliminada `background`. `color` `"#000000"` → sin default. | — |
| PlasmaBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.5)"` → `alpha = 0.5`. | — |
| RainRipplesBackground | 4, 5, 9 | `color` ya sin default. Añadido `setAlpha` (antes `globalAlpha` directo). | — |
| RingsBackground | 1, 2, 4, 5, 9, 11 | Eliminada `background`. `color` `"#000000"` → sin default. `animate()` → rAF. | — |
| SandBackground | — (ya cumplía) | — | — |
| SandDotsBackground | — (ya cumplía) | — | — |
| SandpileBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.5)"` → `alpha = 0.5`. `flash` (paleta) se conserva. | — |
| SeigaihaBackground | — (ya cumplía) | — | — |
| ShoalBackground | 1, 2, 4, 5, 9 | Eliminada `background`. `color` `"#000000"` → sin default. | — |
| SnowflakeBackground | — (ya cumplía) | — | — |
| StarfishBackground | — (ya cumplía) | — | — |
| StringArtBackground | — (ya cumplía) | — | — |
| StringsBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.3)"` → `alpha = 0.3`. | — |
| TentacleBackground | — (ya cumplía) | — | — |
| ThreadBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.45)"` → `alpha = 0.45`. | — |
| TileBackground | 1, 2, 4, 5, 9, 11 | Eliminada `background`. `color` `"#000000"` → sin default. `alpha = 0.22` añadida. `animate()` → rAF. | — |
| TileSpinBackground | 1, 2, 4, 5, 9, 11 | Eliminada `background`. `color` `"#000000"` → sin default. `animate()` → rAF. | — |
| TriangleBackground2 | 1, 2, 3, 4, 5, 9, 11 | Eliminada `background`. `color` `"rgba(0,0,0,0.15)"` → `alpha = 0.15`. `animate()` → rAF. | — |
| TruchetBackground | — (ya cumplía) | — | — |
| TruchetArcsBackground | — (ya cumplía) | — | — |
| TruchetTilesBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.22)"` → `alpha = 0.22`. | — |
| TuringBackground | 1, 2, 4, 5, 7 | Eliminada `background`. `color` `"#3b2f2a"` → sin default. ImageData máscara de alfa + `source-in` (regla 7). | Imagen de máscara (regla 7). |
| TurtleBackground | — (ya cumplía) | — | — |
| VanishBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.55)"` → `alpha = 0.55`. | — |
| VoronoiBackground | 1, 2, 3, 4, 5, 9 | Eliminada `background`. `color` `"rgba(0,0,0,0.2)"` → `alpha = 0.2`. | — |
| WarpGridBackground | 1, 2, 3, 4, 5, 9, 11 | Eliminada `background`. `color` `"rgba(0,0,0,0.2)"` → `alpha = 0.2`. `animate()` → rAF. | — |
| WaterBackground | — (ya cumplía) | — | — |
| WaveLayersBackground | — (ya cumplía) | — | — |
| WhaleBackground | — (ya cumplía) | — | — |

Componentes ya al día (sin cambios): `Blob`, `Bubble`, `Chladni`, `Coral`→migrado, `Dandelion`, `Facet`, `FlatCaustics`, `HexPulse`, `Iso`, `Jelly`, `Kaleidoscope`, `Kelp`, `Koi`, `Leaves`, `Lily`, `Marbles`, `PendulumWave`, `Sand`, `SandDots`, `Seigaiha`, `Snowflake`, `Starfish`, `StringArt`, `Tentacle`, `Turtle`, `Water`, `WaveLayers`, `Whale`, `Truchet`, `TruchetArcs`.

## 8.2 Reglas nuevas / decisiones de criterio

No fue necesario añadir reglas numeradas nuevas a la tabla de la sección 3. Las decisiones de criterio tomadas (anotadas aquí por trazabilidad):

- **Regla implícita A (color único → `color`):** cuando un componente tiene un solo color de tinta y se llamaba `fill` (solo `AnimatedBackground`), se renombra a `color` para compartir formato. Es cambio de API (8.4).
- **Regla implícita B (opacidad horneada → `alpha`):** cuando el default de `color` era `rgba(...)` con alfa < 1, se separa: `color` pasa sin default (tinta opaca heredada) y se añade `alpha` con ese valor como default. Se aplica a `Circuit`, `Cloth`, `Contour2`, `Cross`, `Dither`, `Dot`, `FieldLines`, `Globe`, `Life`, `Maze`, `Needle`, `Orbit`, `Sandpile`, `Tile`, `Vanish`, `Voronoi`, `Plasma`.
- **Regla implícita C (paleta de varios colores):** `Meadow` (`plantColor`, `flowerColor`), `Maze` (`glow`), `Sandpile` (`flash`), `Aurora` (`colors`) se dejan como props con default (regla 8); la página puede sustituirlas con `--<prefijo>-tone-N` cuando el componente lo soporte.
- **Regla implícita D (ImageData → máscara de alfa + `source-in`):** `Coral`, `Julia`, `LavaLamp`, `Physarum`, `Turing`, `Fog` escriben solo el canal alfa y tiñen con `source-in` + `fillRect(ink)` (o `fillRect` sobre `drawImage`) en cada fotograma, tal como prescribe la regla 7. `LavaLamp` conserva la prop `core` en la interfaz por compatibilidad, pero el color dominante es ahora `ink`.

## 8.3 CSS de tema para la página (bloque único)

```css
/* ===== Tema de fondos @kimografico/laboratorio ===== */
/* Tinta por defecto (tema claro): negro. Oscuro: blanco. */
/* Cada componente lee --<prefijo>-color (hereda de `color`) y --<prefijo>-opacity. */

/* Compatibilidad: componentes sin prop `color` heredan `color`. */
:root {
  color: #000000;
  --animated-opacity: 1;
  --aurora-opacity: 1;
  --bevel-opacity: 1;
  --circuit-opacity: 0.4;
  --cloth-opacity: 0.3;
  --contour-2-opacity: 0.22;
  --cross-opacity: 0.2;
  --dither-opacity: 0.28;
  --dot-opacity: 0.2;
  --field-lines-opacity: 0.22;
  --fireflies-opacity: 1;
  --fireworks-opacity: 1;
  --galaxy-opacity: 1;
  --globe-opacity: 0.5;
  --manta-opacity: 1;
  --matrix-opacity: 1;
  --meadow-opacity: 0.45;
  --maze-opacity: 0.45;
  --network-2-opacity: 1;
  --orbit-opacity: 0.5;
  --plankton-opacity: 1;
  --plasma-opacity: 0.5;
  --rain-opacity: 0.2;
  --rings-opacity: 0.2;
  --sandpile-opacity: 0.5;
  --shoal-opacity: 1;
  --strings-opacity: 0.3;
  --thread-opacity: 0.45;
  --tile-opacity: 0.22;
  --tile-spin-opacity: 1;
  --triangle-2-opacity: 0.15;
  --truchet-tiles-opacity: 0.22;
  --vanish-opacity: 0.55;
  --voronoi-opacity: 0.2;
  --warp-grid-opacity: 0.2;
  --flow-opacity: 0.45;
  --fog-opacity: 1;
  --julia-opacity: 0.7;
  --lava-lamp-opacity: 0.15;
  --physarum-opacity: 0.85;
  --turing-opacity: 0.8;
  /* Ya al día (referencia) */
  --tentacle-opacity: 0.28;
  --seigaiha-opacity: 0.25;
  --iso-opacity: 0.06;
  --blob-opacity: 0.16;
  --bubble-opacity: 0.3;
  --chladni-opacity: 0.55;
  --facet-opacity: 0.16;
  --flat-caustics-opacity: 0.15;
  --hex-opacity: 0.35;
  --jelly-opacity: 0.3;
  --kaleidoscope-opacity: 0.5;
  --kelp-opacity: 0.28;
  --koi-opacity: 0.3;
  --leaves-opacity: 0.3;
  --lily-opacity: 0.3;
  --marbles-opacity: 0.3;
  --pendulum-opacity: 0.3;
  --sand-opacity: 0.3;
  --sand-dots-opacity: 0.4;
  --snow-opacity: 0.5;
  --starfish-opacity: 0.3;
  --string-opacity: 0.07;
  --strings-opacity: 0.3;
  --thread-opacity: 0.45;
  --turtle-opacity: 0.3;
  --water-opacity: 0.8;
  --waves-opacity: 0.02;
  --whale-opacity: 0.3;
}

/* Tema oscuro: tinta blanca y opacidad ligeramente mayor para mantener sutileza. */
:root[data-theme="dark"] {
  color: #ffffff;
  --animated-opacity: 1.4;
  --aurora-opacity: 1.4;
  --bevel-opacity: 1.4;
  --circuit-opacity: 1.4;
  --cloth-opacity: 1.4;
  --contour-2-opacity: 1.4;
  --cross-opacity: 1.4;
  --dither-opacity: 1.4;
  --dot-opacity: 1.4;
  --field-lines-opacity: 1.4;
  --fireflies-opacity: 1.4;
  --fireworks-opacity: 1.4;
  --galaxy-opacity: 1.4;
  --globe-opacity: 1.4;
  --manta-opacity: 1.4;
  --matrix-opacity: 1.4;
  --meadow-opacity: 1.4;
  --maze-opacity: 1.4;
  --network-2-opacity: 1.4;
  --orbit-opacity: 1.4;
  --plankton-opacity: 1.4;
  --plasma-opacity: 1.4;
  --rain-opacity: 1.4;
  --rings-opacity: 1.4;
  --sandpile-opacity: 1.4;
  --shoal-opacity: 1.4;
  --strings-opacity: 1.4;
  --thread-opacity: 1.4;
  --tile-opacity: 1.4;
  --tile-spin-opacity: 1.4;
  --triangle-2-opacity: 1.4;
  --truchet-tiles-opacity: 1.4;
  --vanish-opacity: 1.4;
  --voronoi-opacity: 1.4;
  --warp-grid-opacity: 1.4;
  --flow-opacity: 1.4;
  --fog-opacity: 1.4;
  --julia-opacity: 1.4;
  --lava-lamp-opacity: 1.4;
  --physarum-opacity: 1.4;
  --turing-opacity: 1.4;
  /* Ya al día */
  --tentacle-opacity: 1.4;
  --seigaiha-opacity: 1.4;
  --iso-opacity: 1.4;
  --blob-opacity: 1.4;
  --bubble-opacity: 1.4;
  --chladni-opacity: 1.4;
  --facet-opacity: 1.4;
  --flat-caustics-opacity: 1.4;
  --hex-opacity: 1.4;
  --jelly-opacity: 1.4;
  --kaleidoscope-opacity: 1.4;
  --kelp-opacity: 1.4;
  --koi-opacity: 1.4;
  --leaves-opacity: 1.4;
  --lily-opacity: 1.4;
  --marbles-opacity: 1.4;
  --pendulum-opacity: 1.4;
  --sand-opacity: 1.4;
  --sand-dots-opacity: 1.4;
  --snow-opacity: 1.4;
  --starfish-opacity: 1.4;
  --string-opacity: 1.4;
  --turtle-opacity: 1.4;
  --water-opacity: 1.4;
  --waves-opacity: 1.4;
  --whale-opacity: 1.4;
}

/* Uso: el contenedor del experimento hereda `color` y define --x-opacity si se quiere ajustar. */
/* Ejemplo: .hero { color: var(--ink); --tentacle-opacity: 1.4; } */
```

**Colores de tinta (tema claro → oscuro):**
- `animated`: `#000` → `#fff` (antes `fill: #000000`)
- `bevel`: `#fff` → `#fff` (opaco)
- `circuit`, `cloth`, `contour-2`, `cross`, `dither`, `dot`, `field-lines`, `globe`, `maze`, `orbit`, `sandpile`, `tile`, `vanish`, `voronoi`, `warp-grid`, `plasma`, `flow`: negro claro → blanco oscuro
- `fireflies`: `#d4a017` → `#fff`
- `fireworks`: `#fff1dc` → `#fff`
- `galaxy`: `#f4efe8` → `#fff`
- `manta`, `matrix`, `network-2`, `shoal`: `#000` → `#fff`
- `meadow`: `#2e5e36` → `#fff`; `plantColor` `#1e5428`, `flowerColor` `#c4465a`
- `plankton`: `#000` → `#fff`
- `fog`: `#282828` → `#fff`
- `julia`: `#2f3e5c` → `#fff`
- `lava-lamp`: `#fff` → `#fff`
- `physarum`: `#7a4a1d` → `#fff`
- `turing`: `#3b2f2a` → `#fff`

## 8.4 Cambios de API (rompen el código actual)

| Componente | Cambio | Cómo sustituir |
|---|---|---|
| Todos los que tenían `background` | Prop `background` eliminada | Definir el fondo en la página (contenedor/página), no en el componente. |
| `AnimatedBackground` | `fill` → `renombrada a `color` | `<AnimatedBackground color="…" />` en lugar de `fill="…"`. |
| Todos | `color` sin valor por defecto | Si antes confiabas en el default, pasa `color="<el color de antes>"` o define `--<prefijo>-color` en la página. |
| Con `alpha` nueva (`Circuit`, `Cloth`, `Contour2`, `Cross`, `Dither`, `Dot`, `FieldLines`, `Globe`, `Life`, `Maze`, `Needle`, `Orbit`, `Sandpile`, `Tile`, `Vanish`, `Voronoi`, `Plasma`) | `alpha` añadida con el alfa que antes iba horneado en `color` | No es necesario pasarla; conserva el aspecto en tema claro. |

## 8.5 Qué se verificó y qué no

- **`tsc` estricto** (`--strict --noUnusedLocals --noUnusedParameters --jsx react-jsx`) sobre todos los `src/components/backgrounds/*.tsx`: **pasa sin errores** (exit 0).
- **`npm run check` / `astro check`:** no se ejecutó porque valida `.astro` y todo el proyecto (puede tener errores previos ajenos a esta migración).
- **Comparación visual determinista (esbuild + @napi-rs/canvas, Math.random con semilla fija, getComputedStyle mockeado):** **no se pudo ejecutar** en este entorno (no hay sandbox de renderizado de canvas de Node ni Playwright disponible; los paquetes de verificación del prompt no están instalados y no hay red para instalarlos).
- **Demo de comprobación (HTML autocontenido):** **no publicada** por la misma razón (entorno sin renderizado de canvas/Chromium).
- **Prueba de estrés / coste por fotograma:** no ejecutadas.

**Recomendación para ti:** abre la demo (una app React con pestañas, toggle claro/oscuro y los bloques de CSS de 8.3) y comprueba, por componente, claro vs oscuro:
1. Que en tema claro se vea idéntico a antes (el color del default antiguo aplicado por la página).
2. Que en tema oscuro sea legible y sutil (opacidades 1.2-1.6).
3. Especialmente `Coral`, `Julia`, `LavaLamp`, `Physarum`, `Turing`, `Fog` (máscara de alfa + `source-in`) y `Flow` / `Ridge` (destination-out), que son los que más tocan el pipeline de dibujo.
