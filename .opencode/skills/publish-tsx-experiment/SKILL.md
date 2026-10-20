---
name: publish-tsx-experiment
description: >-
  Publica componentes React (.tsx) existentes en el directorio +/ como
  experimentos del showcase y de la librería @kimografico/laboratorio: registra
  el componente y crea su página .md. Incluye scripts deterministas
  para inventariar, andamiar y verificar. Úsalo al integrar .tsx de +/, junto al
  agente tsx-to-experiment o por sí solo.
---

# Publicar un experimento `.tsx`

Skill de apoyo para integrar componentes React de `+/` en el proyecto.
Aporta los **scripts deterministas**; el criterio (auditoría, duplicados,
adaptación de compatibilidad y decisiones de conflicto) vive en el agente
`tsx-to-experiment`. Los scripts pueden ejecutarse también por sí solos.

## Categoría: entrada `pendiente`, decisión al publicar

El scaffold crea todo experimento nuevo de `src/content/experiments/` (fondo,
texto o cualquier otro) con `category: pendiente`. Es la categoría de entrada y
revisión, no una decisión final.

Al terminar la integración, si el usuario pidió publicar o clasificar, usa el
**modo publicación** del skill `change-experiment-category`: decide la categoría
a partir del título, la descripción y el componente (fondo, texto, técnica) y
edita el `.md`. Si la decisión es clara, asígnala directamente; si hay empate
real, deja `pendiente` y pregunta. No dejes en `pendiente` un experimento cuya
categoría es evidente.

La fuente de verdad es `src/lib/categories.ts`: `EXPERIMENT_CATEGORIES`,
`CATEGORY_LABELS` y `BACKGROUND_CATEGORIES` (esta última debe incluir toda
categoría de fondos, p. ej. `matematica`). No edites un enum literal en
`src/content.config.ts`: ese archivo importa la lista.

Las piezas de UI (`src/content/ui/`) usan su propia categoría de colección
(por defecto `buttons`), no `pendiente`.

## Flujo

1. **Inventario (solo lectura).** Antes de tocar nada, lista candidatos y
   detecta duplicados/colisiones:

   ```powershell
   pwsh .opencode/skills/publish-tsx-experiment/scripts/inventory.ps1
   ```

2. **Adaptar el componente.** Copia/adapta el `.tsx` a
   `src/components/<backgrounds|texts|ui>/<Nombre>.tsx` y registra sus props.
   Esto es criterio de diseño; lo decide el agente, no el script.

3. **Andamiaje.** Con un spec JSON (ver abajo), inserta import + entrada en
   `src/lib/registry.tsx` y crea el `.md`:

   ```powershell
   pwsh .opencode/skills/publish-tsx-experiment/scripts/scaffold.ps1 -Spec spec.json
   pwsh .opencode/skills/publish-tsx-experiment/scripts/scaffold.ps1 -Spec spec.json -DryRun
   ```

   Es idempotente: una segunda pasada no duplica imports ni `.md`, y
   nunca sobrescribe un `.md` existente.

4. **Categoría (si se pidió publicar).** Con el `.md` creado, aplica el modo
   publicación de `change-experiment-category`: actualiza defaults si el usuario
   los dio y decide la categoría final. Si no hay una petición de publicación o
   la categoría no está clara, déjala en `pendiente`.

5. **Verificar.** Chequeos estáticos y, opcionalmente, build + rutas:

   ```powershell
   pwsh .opencode/skills/publish-tsx-experiment/scripts/verify.ps1
   pwsh .opencode/skills/publish-tsx-experiment/scripts/verify.ps1 -Run -Slugs foo,bar
   ```

   Devuelve exit code 0 si todo está correcto y 1 si hay fallos.

## Scripts

- `scripts/inventory.ps1` — solo lectura. Lista `+/`, claves del registry,
  slugs/`component` de los `.md` y colisiones candidato vs.
  repo. Parámetros: `-Root`, `-SourceDir` (por defecto `+`).
- `scripts/scaffold.ps1` — idempotente. Crea el `.md` y edita `registry.tsx`
  (ordenado por categoría). Parámetros: `-Spec <json>` o `-Json '<json>'`,
  `-Root`, `-DryRun`.
- `scripts/verify.ps1` — duplicados, referencias rotas y, con `-Run`,
  `npm run check/build/build:lib` y comprobación de rutas `dist-site`. Params:
  `-Root`, `-Run`, `-Slugs`.

Todos aceptan `-Root` para apuntar a otra copia del repo (útil para probar).

## Formato del spec

Array de entradas (o una sola). Campos por entrada:

| Campo         | Obligatorio | Notas                                                                  |
| ------------- | ----------- | ---------------------------------------------------------------------- |
| `kind`        | sí          | `background` \| `text` \| `ui` → carpeta y colección destino           |
| `component`   | sí          | nombre del export por defecto                                          |
| `slug`        | sí          | nombre del `.md`, sin extensión                                        |
| `title`       | sí          | título de la página                                                    |
| `description` | sí          | descripción de la página                                               |
| `props`       | no          | array de `{name, label?, type, default?, min?, max?, step?, options?}` |
| `uiCategory`  | no          | solo `kind: ui` (por defecto `buttons`)                                |
| `usage`       | no          | cuerpo markdown tras el frontmatter (`## Uso`)                         |

Para `kind: background`/`text`, el `.md` se crea con `category: pendiente`
siempre (el scaffold no decide categorías). La categoría final se asigna después
con `change-experiment-category`, no añadiendo un campo al spec. Ejemplo:

````json
[
  {
    "kind": "background",
    "component": "NebulaBackground",
    "slug": "nebula",
    "title": "Nebula",
    "description": "Nebulosa a la deriva.",
    "props": [
      {
        "name": "density",
        "label": "Densidad",
        "type": "number",
        "default": 1,
        "min": 0.1,
        "max": 3,
        "step": 0.05
      },
      { "name": "color", "label": "Color", "type": "color", "default": "#7aa2ff" }
    ],
    "usage": "## Uso\n\nNebulosa suave.\n\n```tsx\n<NebulaBackground density={1.2} />\n```"
  }
]
````

## Qué NO hace el scaffold

- No escribe ni adapta el componente `.tsx` (eso es criterio).
- No sobrescribe `.md` existentes ni pisa imports ya presentes.
- No inventa props, valores ni textos de uso.

---

## Convención de migración de fondos (`*Background`)

Cuando el agente `tsx-to-experiment` adapte un `.tsx` de `+/` como fondo en `src/components/backgrounds/`, debe dejarlo exactamente con esta convención (una sola receta para todos). Si un caso no cubre la receta, decida una regla general, aplíquela a todos los afectados y anótela.

### 1. Estructura del archivo

- Archivo `XBackground.tsx` con `export default function XBackground` e `export interface XBackgroundProps`.
- JSDoc de cada prop **en español y con unidades** (px, 0-1, radianes, fracción del lado menor…).
- Props `color?: string` (opcional, **sin valor por defecto**) y `className?: string`.
- **No existe** prop `background`, ni `backgroundColor` en el contenedor. El componente no pinta fondo.
- Comentarios en español, explicando el porqué, no el qué.

### 2. Tema: contrato con la página

El componente lee del CSS **en cada fotograma** (un `getComputedStyle(canvas)` obtenido una sola vez):

| Variable | Qué es | Por defecto |
|---|---|---|
| `--x-color` | color de la tinta | propiedad CSS `color` heredada |
| `--x-opacity` | multiplicador de opacidad | `1` |
| `--x-tone-1`, `--x-tone-2`… | tonos planos opcionales; si **todos** están definidos se usan en lugar de la tinta con opacidades | no definidos |

`x` = nombre del componente en minúsculas y kebab-case, sin "Background" (`--tentacle-`, `--tile-spin-`, `--wave-layers-`…). La prop `color` solo escribe `--x-color` inline en el contenedor.

### 3. Plantilla mínima de destino

```tsx
export default function XBackground({ /* props con defaults */ color, className }: XBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const style = getComputedStyle(canvas);
    let w = 0, h = 0, raf = 0;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w;
      canvas.height = h;
      // reconstruir el estado aquí
    }
    function onPointer(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      /* x = clientX - rect.left; y = clientY - rect.top */
    }
    const setAlpha = (v: number) => (ctx!.globalAlpha = Math.min(1, Math.max(0, v)));

    function animate() {
      ctx!.clearRect(0, 0, w, h);
      // Tema: color y opacidad vienen del CSS de la página, no del componente
      const ink = style.getPropertyValue("--x-color").trim() || style.color;
      const k = style.getPropertyValue("--x-opacity").trim();
      const mul = k !== "" && Number.isFinite(Number(k)) ? Number(k) : 1;
      ctx!.strokeStyle = ink;
      ctx!.fillStyle = ink;
      // ... dibujar con setAlpha(alpha * mul * ...)
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const onMouse = (e: MouseEvent) => onPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => onPointer(e.touches[0].clientX, e.touches[0].clientY);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });

    resize();
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [/* TODAS las props salvo color y className */]);

  return (
    <div
      className={`bg-canvas ${className ?? ""}`.trim()}
      style={color ? ({ "--x-color": color } as React.CSSProperties) : undefined}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
```

La clase `bg-canvas` ya existe en el CSS global: no se redefine. Si un fondo necesita varios canvas, se les pone `position:absolute; inset:0` inline.

### 4. Reglas de arreglo (aplicar igual a todos)

| # | Desviación | Arreglo canónico |
|---|---|---|
| 1 | Prop `background` o `backgroundColor` en el contenedor | Eliminarla. Es cambio de API: anótalo. |
| 2 | `color` con valor por defecto (`"#000"`, `"#fff"`…) | `color?: string` sin default. El default anterior se anota como valor que debe definir la página en tema claro (y su inverso en oscuro). |
| 3 | Opacidad "horneada" en el color (`"rgba(0,0,0,0.3)"`) | Separar tinta y opacidad: la tinta pasa a ser opaca y el alfa viaja a `alpha` (si ya existe, multiplicar; si no, crear `alpha` con ese default). Resultado visual en tema claro idéntico. |
| 4 | Falta `--x-opacity` | Leerla en cada fotograma y multiplicarla en **todas** las opacidades dibujadas. |
| 5 | Colores leídos una sola vez o solo al cambiar props | Leer `--x-color` y `--x-opacity` dentro de `animate`, en cada fotograma. |
| 6 | Oclusión rellenando con color de fondo | `globalCompositeOperation = "destination-out"` para borrar la silueta, volver a `source-over` y pintar; siempre de atrás adelante. |
| 7 | Buffer de píxeles (`ImageData`) con color fijo | Escribir solo canal alfa y teñir con `source-in` + `fillRect` con el color vivo. Si no es viable sin cambiar el resultado, dejarlo y anotarlo como excepción. |
| 8 | Varios colores propios (paleta) | Mantener la prop de paleta con default, y permitir que la página la sustituya con `--x-tone-1..n`. Nunca pintar fondo. |
| 9 | `globalAlpha` sin limitar | Toda asignación de opacidad por `setAlpha` (limita a 0-1). |
| 10 | Opacidades/estado sin restaurar al final del fotograma | Terminar `animate` con `globalAlpha = 1`; restaurar `globalCompositeOperation` y transformación si se usaron. |
| 11 | Primer fotograma con llamada directa (`animate()`) | `raf = requestAnimationFrame(animate)`. |
| 12 | Eventos en el canvas | `mousemove` y `touchmove` en `window`, coordenadas relativas al canvas con `getBoundingClientRect`. |
| 13 | `devicePixelRatio` | No se maneja: `canvas.width = clientWidth`. Si cambia el aspecto, anotarlo. |
| 14 | Dependencias del `useEffect` incompletas | Todas las props **salvo `color` y `className**». Arrays serializados a clave string. |
| 15 | Limpieza incompleta | `return` cancela `raf`, desconecta `ResizeObserver` y quita los dos listeners (y los que falten: `Image.onload`, timers…). |
| 16 | Estado aleatorio fuera de `resize()` | Generarlo en `resize()` para que sobreviva a cambios de tamaño. |
| 17 | Cálculo lento a 60 fps movido a 30 fps ad hoc | Patrón estándar: `raf = requestAnimationFrame(animate)` primero y luego `if (frame++ % 2 === 1) return;`. No introducir donde no existía. |
| 18 | Valor centinela del puntero inconsistente | `-9999` o flag `hasPointer`. Usar el que ya use el archivo si es correcto. |
| 19 | JSDoc ausente, en inglés o sin unidades | Escribir/traducir en español con unidades. No cambiar el significado. |
| 20 | Interfaz de props no exportada | `export interface XBackgroundProps`. |
| 21 | Contenedor sin `bg-canvas` | `className={\`bg-canvas ${className ?? ""}\`.trim()}`. |
| 22 | Prefijo de variables CSS inconsistente | `--<nombre-kebab>-color`, `--<nombre-kebab>-opacity`, `--<nombre-kebab>-tone-N`. |

### 5. Renombrar props

Solo si dos componentes usan nombres distintos para lo mismo y hay conflicto real con los habituales (`count`, `near`/`far`, `size`, `speed`, `alpha`, `lineWidth`, `radius`/`reach`, `heal`/`decay`, `ease`, `roughness`, `variation`/`randomness`). Por defecto **no se renombrar**; si se hace, es cambio de API y va al informe.

### 6. Qué NO hacer

- No cambiar el aspecto, el movimiento ni los defaults.
- No "mejorar" el algoritmo ni optimizar, salvo bugs evidentes (reportarlos aparte, no arreglar en silencio).
- No renombrar archivos ni componentes.
- No extraer hooks o utilidades compartidas (salvo que se pida).
- No tocar componentes que ya cumplan la convención (solo confirmarlo).
- Si hay conflicto entre conservar el aspecto y cumplir la convención, gana el aspecto y se anota como excepción.

### 7. Verificación tras la migración

1. `tsc` en modo estricto (`strict`, `jsx: react-jsx`, `noUnusedLocals`) sobre el archivo migrado: debe pasar sin errores.
2. El componente lee `--x-color` y `--x-opacity` dentro de `animate` (cada fotograma).
3. No hay `backgroundColor` en el div contenedor ni prop `background`.
4. `className` incluye `bg-canvas`.
5. Limpieza completa del `useEffect` (raf, ResizeObserver, listeners).
