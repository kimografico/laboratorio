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

## Regla de oro: categoría `pendiente`

Todo experimento nuevo que se añada en `src/content/experiments/` (fondo, texto
o cualquier otro) entra **siempre** con `category: pendiente`, sin importar su
técnica de renderizado. `pendiente` es la categoría de entrada y revisión: la
reclasificación a `backgrounds`/`texts` la hace una persona después (con el
skill `change-experiment-category`). El valor debe existir en el enum de
`src/content.config.ts`.

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

4. **Verificar.** Chequeos estáticos y, opcionalmente, build + rutas:

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
siempre. Ejemplo:

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
