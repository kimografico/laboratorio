---
name: update-component-defaults
description: >-
  Use when the user pastes JSX usage of a showcase component with explicit
  attributes (e.g. `<LavaLampBackground count={12} ... />`, one or several) or
  asks to change a component's defaults / "valores por defecto" / "cambiar
  defaults". Updates the React component defaults and its content `.md`
  playground frontmatter together, for one or many components.
---

# Cambiar los defaults de un componente

## Cuándo se activa

- El usuario pega uno o varios elementos JSX con atributos y sin más
  instrucciones: quiere que esos valores pasen a ser los **defaults**.
- Lo pide explícitamente: "cambia los defaults", "valores por defecto",
  "update defaults", "cambiar defaults".

No es para crear experimentos nuevos ni para tocar el algoritmo visual. Es solo
sincronizar valores por defecto.

## Dónde viven los defaults (hay que tocar AMBOS)

1. **Componente React** — en el destructuring de props, p. ej. `count = 12`.
   - `src/components/backgrounds/<Name>.tsx`
   - `src/components/texts/<Name>.tsx`
   - `src/components/ui/<Name>.tsx`
2. **Frontmatter del contenido** — en `props[].default` (misma lista `props` que
   dibuja los controles del playground).
   - `src/content/experiments/<slug>.md`
   - `src/content/ui/<slug>.md`

AGENTS.md exige que coincidan. Si actualizas uno solo, queda inconsistente.

## Cómo localizar los archivos (sin explorar de más)

- Componente React: glob `src/components/**/<Component>.tsx`.
- `.md`: grep `component: <Component>` en `src/content/**/*.md`. El campo
  `component` del frontmatter es el export React (y la clave de
  `src/lib/registry.tsx`).

No hace falta leer el componente entero para tareas típicas: basta con localizar
la línea del destructuring y la entrada del prop en el `.md`.

## Cómo interpretar el JSX pegado

- `prop={valor}` → `valor` tal cual (número, booleano, string…).
- `prop="texto"` → string `texto`.
- `prop` sin valor → `true` (p. ej. `pool` → `pool = true`).
- Ignora props estructurales como `className`, `children` o handlers.

Para cada prop, en este orden:

1. Actualiza el default en el destructuring del componente React.
2. Actualiza `props[].default` en el `.md`.
3. Si el valor queda fuera del `min`/`max` del `.md`, amplía `min`/`max` para que
   el default sea válido (no dejes un default fuera de rango).
4. Si la prop no existe en el `.md`, actualiza solo el componente y avísalo.
5. Si la prop no existe en el componente, repórtalo y no inventes nada.

No toques el ejemplo de la sección `## Uso` salvo que lo pidan expresamente.

## Varios componentes a la vez

Procesa cada elemento JSX por separado con el mismo flujo, aunque vengan en un
único mensaje. Agrupa el resultado final.

## Ejemplo (LavaLamp)

Entrada:

```tsx
<LavaLampBackground count={12} softness={0.01} pool color="#e11900" />
```

- `src/components/backgrounds/LavaLampBackground.tsx`:
  `count = 12`, `softness = 0.01`, `pool = true`, `color = "#e11900"`.
- `src/content/experiments/lava-lamp.md`: mismo `default:` para `count`,
  `softness`, `pool` y `color`.

## Cierre

- Ejecuta `npm run check`.
- Reporta en una línea por cada archivo modificado (componente + `.md`).
