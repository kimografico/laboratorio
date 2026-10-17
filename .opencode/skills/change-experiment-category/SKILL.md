---
name: change-experiment-category
description: >-
  Use when the user asks to change or reclassify experiment categories, e.g.
  "añade a la categoría pendiente", "pasa esto a pendientes", "mueve X a
  backgrounds/texts", usually with a list of names/titles. Edits the
  `category:` frontmatter of `src/content/experiments/*.md`, mapping loose
  names to slugs, and verifies. Do not use for UI pieces or for creating
  experiments.
---

# Cambiar la categoría de experimentos

## Cuándo se activa

- El usuario da una lista de nombres y dice "añádelos a la categoría
  'pendientes'", "mueve estos a backgrounds", "pásalos a texts", etc.
- Pide reclasificar uno o varios experimentos.

No es para crear experimentos nuevos (eso lo hace el agente
`.opencode/agent/tsx-to-experiment.md`) ni para las piezas de
`src/content/ui/` (tienen su propio `category`, string libre, por defecto
`buttons`; **no las toques**).

## Atajo: si te dan el slug (más rápido y barato)

Si el usuario pasa el **slug exacto** (p. ej. `jelly`) en vez del nombre
(`medusas`), sáltate por completo el Paso 1 (mapa de títulos) y el Paso 2
(mapeo de nombres): el slug **es** el nombre de archivo, así que es inequívoco.

1. Comprueba que existe:
   ```powershell
   Test-Path ./src/content/experiments/<slug>.md
   ```
2. Confirma la categoría actual (y que el valor destino está en el enum):
   ```powershell
   Select-String -Path ./src/content/experiments/<slug>.md -Pattern '^category:'
   ```
3. `Read ./src/content/experiments/<slug>.md` con `limit: 5` y luego `edit`.

El ahorro está en evitar el inventario y la resolución de nombres (el coste por
archivo — 1 `Read` corto + 1 `edit` — es el mismo). Requisito: el slug debe ser
exacto (minúsculas y guiones); ante cualquier duda, vuelve al inventario del Paso 1.

## Dónde vive la categoría

- Solo en el frontmatter de `src/content/experiments/<slug>.md`.
- El componente React y `src/lib/registry.tsx` **no** la usan: solo alimenta el
  filtro de la galería. Cambiarla no rompe la página de detalle.

## Fuente de verdad de las categorías (no las memorices)

Las categorías válidas **no son fijas**: salen del enum
`category: z.enum([...])` de `src/content.config.ts`. Pueden añadirse categorías
en el futuro, así que **consulta siempre** ese enum y las que están en uso en
lugar de asumir una lista.

Con el script de referencia (lee ambos):

```powershell
pwsh .opencode/skills/change-experiment-category/scripts/categories.ps1
```

Equivale a:

```powershell
Select-String -Path ./src/content.config.ts -Pattern 'category:\s*z\.enum' | % { $_.Line }
# y, para las que están en uso:
Select-String -Path ./src/content/experiments/*.md -Pattern '^category:\s*(.+)$' |
  % { $_.Matches[0].Groups[1].Value.Trim() } | Group-Object | Sort-Object Name
```

Reglas:

- El destino debe existir en el enum. Si no, **añádelo a
  `src/content.config.ts`** (usa singular, p. ej. `pendiente`). Una categoría
  nueva pasa a ser válida en cuanto aparece ahí; no hay que registrarla en
  ningún otro sitio. Si el enum no contempla el valor, `npm run check` fallará.
- `pendiente` es la categoría de entrada/revisión (ver
  `.opencode/agent/tsx-to-experiment.md`). Frase como "añádelos a pendientes"
  significa poner `category: pendiente`.
- El script sirve para cualquier categoría futura sin tocarlo: extrae el enum y
  cuenta las que estén en uso dinámicamente.

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

2. `npm run check` (valida que el valor destino está en el enum)
3. `npm run build`
4. Filtro renderizado en la galería (el valor aparece en minúsculas, la
   `capitalize` del botón lo muestra capitalizado). Sustituye `<categoria>` por
   el valor destino:

   ```powershell
   $html = Get-Content -Raw dist-site/index.html
   [regex]::Match($html, '><categoria></span>.{0,120}').Value
   ```

## Notas

- La galería (`Gallery.tsx`) deriva los filtros de las categorías presentes y
  los muestra con `capitalize` (`pendiente` → "Pendiente"). El valor es singular.
- `LazyPreview` trata `backgrounds` y `texts` de forma especial; `pendiente`
  cae en la rama genérica y **igual muestra preview**, así que reclasificar no
  deja tarjetas vacías.
- No toques `flip-text` (es `texts`) ni otras categorías fuera de la lista.

## Cierre

- Reporta una tabla: nombre pedido → archivo → título → categoría nueva.
- Indica los conteos por categoría y el resultado de `check`/`build`.
