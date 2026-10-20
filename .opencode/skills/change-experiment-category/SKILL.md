---
name: change-experiment-category
description: >-
  Use when the user asks to assign or change experiment categories, or asks to
  publish an existing experiment (e.g. pastes JSX with defaults and says
  "publícala"): edits `category:` frontmatter, deciding the category from the
  component name and description, and coordinates with update-component-defaults
  when defaults are given. Maps loose names to slugs and verifies. Do not use
  for UI pieces or for creating experiments.
---

# Cambiar la categoría de experimentos

## Cuándo se activa

- El usuario da una lista de nombres y dice "añádelos a la categoría
  'pendientes'", "mueve estos a naturaleza", "pásalos a texts", etc.
- Pide reclasificar uno o varios experimentos.
- Pide **publicar** un experimento ya existente: "publícala", "publica este
  experimento", "cambia estos defaults y publícala", normalmente pegando JSX.
  En ese caso hay que actualizar defaults (si vienen) **y** decidir la categoría.

No es para crear experimentos nuevos (eso lo hacen el agente
`.opencode/agent/tsx-to-experiment.md` y el skill `publish-tsx-experiment`) ni
para las piezas de `src/content/ui/` (tienen su propio `category`, string libre,
por defecto `buttons`; **no las toques**). Si el `.md` o el componente aún no
existen, primero publica con `publish-tsx-experiment`; este skill solo decide
sobre algo ya integrado.

## Modo publicación (JSX + "publícala")

Cuando el usuario pide publicar y pega JSX con atributos:

1. Localiza el componente y su `.md` (ver "Cómo localizar" más abajo).
2. Si el JSX trae defaults distintos, aplica el skill
   `update-component-defaults`: actualiza **el componente y el `.md`**. No toques
   el ejemplo de `## Uso` salvo que lo pidan.
3. Decide la categoría con la guía de abajo y edita `category:` en el `.md`.
4. Verifica (conteos + `npm run check`; build si el cambio es amplio).

Si el usuario solo pide reclasificar, sáltate el paso 2.

### Guía de decisión

Manda el **sujeto/título/descripción** del experimento; la técnica de renderizado
solo desempata. Si el usuario ya dijo la categoría, esa manda.

| Señal principal | Categoría |
| --- | --- |
| Texto animado, `src/components/texts/`, props de texto/`children` | `texts` |
| Flora, fauna, agua, paisaje, cielo o astros | `naturaleza` |
| Fractal, curva, atractor, fórmula paramétrica, caos, espiral áurea, envolvente o curvas de nivel | `matematica` |
| Partículas, muelles, fluidos, crecimiento, autómatas o física | `simulacion` |
| Rejilla, teselado, patrón, simetría, proyección, Voronoi o Penrose | `geometria` |

Reglas para los solapes:

- Si el nombre/título es una construcción matemática con nombre propio
  (`Árbol de Pitágoras`, `Conjunto de Julia`, `Atractor de Lorenz`), va a
  `matematica` aunque el resultado parezca una planta o un paisaje.
- Si el foco es un ser vivo, un bosque o un paisaje realista, va a `naturaleza`
  aunque se genere con una fórmula.
- Un péndulo, una tela o un fluido es `simulacion` aunque su movimiento sea
  caótico; el caos matemático puro (atractores, juego del caos) es `matematica`.
- Una rejilla o un teselado es `geometria` aunque use senos, ruido o una fórmula.
- Si siguen empatando dos categorías, elige la del sustantivo principal del
  título; si el título no ayuda, pregunta una sola vez. No inventes una
  categoría nueva sin pedirlo.

Ejemplos:

| Entrada | Categoría | Motivo |
| --- | --- | --- |
| `RejillaSynthwaveBackground` | `geometria` | Rejilla en perspectiva |
| `PhyllotaxisBackground` | `matematica` | Ángulo áureo / espiral |
| `KoiBackground` | `naturaleza` | Carpas |
| `LifeBackground` | `simulacion` | Autómata celular |
| `VoronoiBackground` | `geometria` | Teselado computacional |
| `FlipText` | `texts` | Texto animado |
| `AtractorDeLorenzBackground` | `matematica` | Atractor |
| `PenduloDobleBackground` | `simulacion` | Simulación física |

`pendiente` no es un cajón para todo: úsalo solo si el experimento aún no se ha
revisado o si de verdad no se puede decidir. Si el usuario pidió publicar y la
categoría es clara, asígnala directamente.

Ejemplo completo. El usuario pega:

```tsx
<RejillaSynthwaveBackground cols={12} rows={14} speed={1} hor={0.55} sun={120} alpha={0.5} />
```

y dice "publícala". Entonces:

1. Actualiza esos defaults en `RejillaSynthwaveBackground.tsx` y en
   `src/content/experiments/rejilla-synthwave.md` (solo si difieren).
2. Clasifícala como `geometria`: es una rejilla en perspectiva, no una fórmula
   matemática.
3. Verifica y reporta defaults + categoría final.

## Atajo: si te dan el slug (más rápido y barato)

Si el usuario pasa el **slug exacto** (p. ej. `jelly`) en vez del nombre
(`medusas`), sáltate por completo el Paso 1 (mapa de títulos) y el Paso 2
(mapeo de nombres): el slug **es** el nombre de archivo, así que es inequívoco.

1. Comprueba que existe:
   ```powershell
   Test-Path ./src/content/experiments/<slug>.md
   ```
2. Confirma la categoría actual (y que el valor destino está en
   `EXPERIMENT_CATEGORIES`):
   ```powershell
   Select-String -Path ./src/content/experiments/<slug>.md -Pattern '^category:'
   ```
3. `Read ./src/content/experiments/<slug>.md` con `limit: 5` y luego `edit`.

El ahorro está en evitar el inventario y la resolución de nombres (el coste por
archivo — 1 `Read` corto + 1 `edit` — es el mismo). Requisito: el slug debe ser
exacto (minúsculas y guiones); ante cualquier duda, vuelve al inventario del Paso 1.

## Dónde vive la categoría

- Solo en el frontmatter de `src/content/experiments/<slug>.md`.
- Alimenta el filtro de la galería y, en los fondos, la ruta de import/snippet
  que genera `ExperimentPreview` mediante `isBackgroundCategory`. Si mueves un
  fondo a una categoría que no está en `BACKGROUND_CATEGORIES`, su página de
  detalle se rompe. El componente React y `src/lib/registry.tsx` no leen el
  valor.

## Fuente de verdad de las categorías (no las memorices)

La fuente de verdad es **`src/lib/categories.ts`**, no un enum literal en
`src/content.config.ts` (este lo importa). Contiene tres listas que deben ir
coordinadas:

- `EXPERIMENT_CATEGORIES`: valores válidos de `category:`.
- `CATEGORY_LABELS`: etiqueta visible de cada valor. Es un
  `Record<ExperimentCategory, string>`: si añades una categoría sin etiqueta,
  `npm run check` falla.
- `BACKGROUND_CATEGORIES`: categorías cuyos componentes viven en
  `src/components/backgrounds/`. Añade aquí toda categoría nueva de fondos
  (`geometria`, `matematica`, `naturaleza`, `simulacion`).

Para añadir una categoría, edita las tres listas en el mismo cambio y usa el
singular (`matematica`, no `matemáticas`). No busques un `z.enum([...])` literal:
no existe. Después valida con `npm run check`.

Con el script de referencia (lee la fuente de verdad y las categorías en uso):

```powershell
pwsh .opencode/skills/change-experiment-category/scripts/categories.ps1
```

Reglas:

- El destino debe existir en `EXPERIMENT_CATEGORIES`. Si no, añádelo primero
  siguiendo el párrafo anterior.
- `pendiente` es la categoría de entrada/revisión: el scaffold de
  `publish-tsx-experiment` la crea por defecto. El **modo publicación** de este
  skill puede asignar la categoría definitiva directamente si el usuario lo pide
  y la decisión es clara; si no, se queda en `pendiente` hasta revisión. Frase
  como "añádelos a pendientes" significa poner `category: pendiente`.
- El script sirve para cualquier categoría futura sin tocarlo: extrae las listas
  y cuenta las que estén en uso dinámicamente.

### Cómo localizar el experimento

- Slug exacto: `src/content/experiments/<slug>.md` (o usa el atajo de arriba).
- Nombre/título: `Select-String -Path ./src/content/experiments/*.md -Pattern
  'title:.*<termino>'`.
- Componente: `Select-String -Path ./src/content/experiments/*.md -Pattern
  'component:.*<Name>'`.
- Si hay que entender qué dibuja, `Read` el `.md` (título, descripción y props)
  y, solo si hace falta, el inicio del `.tsx`. No hace falta leer el algoritmo
  entero para elegir categoría.

## Paso 1 — Inventario (una sola pasada)

Primero, enum válido + categorías en uso (ver "Fuente de verdad", arriba):

```powershell
pwsh .opencode/skills/change-experiment-category/scripts/categories.ps1
```

Después, el mapa título → archivo y la categoría actual de todos los
experimentos:

```powershell
Select-String -Path ./src/content/experiments/*.md -Pattern '^(title|category):' |
  ForEach-Object { $_.Filename + ' :: ' + $_.Line }
```

De ahí obtienes todo lo necesario para mapear. No leas cada archivo entero.

## Paso 2 — Mapear nombres del usuario → slug

El usuario casi siempre escribe nombres sueltos, en español o inglés, sin
acentos y en minúsculas, y **no** coinciden con el slug. Normaliza (minúsculas,
sin acentos), admite coincidencia parcial y traducción. Ejemplos reales de este
repo (verifica siempre con el Paso 1, pueden cambiar):

| Lo que dice el usuario     | Archivo (slug)   | Título               |
| -------------------------- | ---------------- | -------------------- |
| Azulejos Truchet           | truchet          | Azulejos Truchet     |
| gotas liquidas             | blob             | Gotas líquidas       |
| Estanque de carpas         | koi              | Estanque de carpas   |
| medusas                    | jelly            | Medusas              |
| luciernagas                | fireflies        | Luciérnagas          |
| juego de la vida           | life             | Juego de la Vida     |
| terreno isometrico         | iso              | Terreno isométrico   |
| tela                       | cloth            | Tela                 |
| turtles / tortugas         | turtle           | Tortugas             |
| orbitas elasticas          | planets-orbits   | Órbitas elásticas    |
| lluvia y ondas             | rain-ripples     | Lluvia y ondas       |
| pulso hexagonal            | hex-pulse        | Pulso hexagonal      |
| onda de pendulos           | pendulum-wave    | Onda de péndulos     |
| tile spin                  | tile-spin        | Tile Spin            |
| parallax rings             | parallax-rings   | Parallax Rings       |
| fog                        | fog              | Fog                  |

Para buscar un término concreto:

```powershell
Select-String -Path ./src/content/experiments/*.md -Pattern 'title:.*<termino>'
```

Reglas:

1. Un nombre = un archivo. Correos parciales y traducciones son lo normal.
2. Si un nombre no casa con ninguno, o casa con varios, **pregunta o repórtalo**;
   no inventes slug, título ni categoría.
3. Procesa toda la lista en un único lote, no de uno en uno.

## Paso 3 — Editar el frontmatter

La herramienta `edit` exige haber leído el archivo antes. Para ir rápido, lee
solo el encabezado:

- `Read <archivo>.md` con `limit: 5` (cubre `title`, `description`,
  `category`, `component`) para confirmar la línea exacta.
- Luego `edit`: `category: <actual>` → `category: <nueva>`. El valor es único en
  cada archivo, así que el `oldString` no es ambiguo.

Las ediciones son independientes: lanza todas en un mismo mensaje (varios
`edit` en paralelo). No uses shell/`Set-Content` para esto.

## Paso 4 — Verificar

1. Conteos por categoría (dinámico, sirve para categorías futuras); la suma debe
   cuadrar con el total de `.md`:

   ```powershell
   pwsh .opencode/skills/change-experiment-category/scripts/categories.ps1
   ```

2. `npm run check` (valida que el valor destino está en `EXPERIMENT_CATEGORIES`)
3. `npm run build`
4. Filtro renderizado en la galería (la etiqueta visible sale de
   `CATEGORY_LABELS`, en `src/lib/categories.ts`). Sustituye `<categoria>` por
   la etiqueta visible:

   ```powershell
   $html = Get-Content -Raw dist-site/index.html
   [regex]::Match($html, '><categoria></span>.{0,120}').Value
   ```

## Notas

- La galería (`Gallery.tsx`) deriva los filtros de las categorías presentes y
  los etiqueta con `CATEGORY_LABELS` (`src/lib/categories.ts`). El valor es singular.
- `LazyPreview` y `ExperimentPreview` tratan `texts` de forma especial y
  `isBackgroundCategory` (geometría, matemáticas, naturaleza, simulación) como
  fondos; `pendiente` cae en la rama genérica y **igual muestra preview**, así
  que reclasificar no deja tarjetas vacías.
- No toques `flip-text` (es `texts`) ni otras categorías fuera de la lista.

## Cierre

- En modo publicación, indica también qué defaults cambiaste (componente y
  `.md`) o que no había cambios.
- Reporta una tabla: nombre pedido → archivo → título → categoría nueva.
- Indica los conteos por categoría y el resultado de `check`/`build`.
