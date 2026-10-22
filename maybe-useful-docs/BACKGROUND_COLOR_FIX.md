# Corrección de colores de fondo en experimentos

## Problema

En la galería de experimentos, los cards de los fondos interactivos (backgrounds) mostraban colores de fondo inconsistentes:

- La mayoría de los experimentos mostraban el color del card (`bg-panel`, definido en `theme.css` como `var(--panel)`)
- Algunos experimentos (MimosaPudica, Truchet, Bevel, Maze, Meadow, HexPulse) mostraban el color de fondo de la página (`bg-surface`, `var(--surface)`)

Esto ocurría porque:
1. **Categoría incorrecta**: 5 experimentos estaban en `category: pendiente` en lugar de `category: backgrounds`. El componente `LazyPreview` en `Gallery.tsx` solo aplica el contenedor con `bg-surface` para textos, y para backgrounds renderiza directo el `Stage`. Al estar en `pendiente`, caían en la rama genérica y se envolvían en un `div` con `bg-surface`.
2. **Canvas sin fondo explícito**: Los componentes canvas no definían `backgroundColor` en el elemento `<canvas>`, por lo que eran transparentes y dejaban ver el fondo del contenedor padre.

## Solución

### 1. Mantener la categoría `pendiente` (por convención del proyecto)
Los experimentos nuevos entran en `pendiente` y se reclasifican manualmente después. No se cambiaron las categorías.

### 2. Añadir `backgroundColor: "var(--panel)"` a los canvas
Se modificaron los 6 componentes afectados para que el canvas tenga fondo explícito del panel del card:

```tsx
<canvas ref={canvasRef} style={{ backgroundColor: "var(--panel)" }} />
```

**Archivos modificados:**
- `src/components/backgrounds/MimosaPudicaBackground.tsx` (línea 383)
- `src/components/backgrounds/TruchetBackground.tsx` (línea 165)
- `src/components/backgrounds/BevelBackground.tsx` (línea 229)
- `src/components/backgrounds/MazeBackground.tsx` (línea 293)
- `src/components/backgrounds/MeadowBackground.tsx` (línea 305)
- `src/components/backgrounds/HexPulseBackground.tsx` (línea 211)

### 3. Tokens de tema (theme.css)
Los tokens relevantes en `src/styles/theme.css`:
```css
:root {
  --surface: #0b0b0c;  /* fondo de página */
  --panel: #141416;    /* fondo de cards/paneles */
}
```

Al usar `var(--panel)` en el canvas, este hereda el color del card independientemente de en qué contenedor se renderice (galería, detalle, fullscreen).

## Verificación
- `npm run check` → 0 errores
- `npm run build` → build exitoso
- Los 6 experimentos ahora muestran el mismo fondo que el resto de cards en la galería

---

## Nota posterior: cambio de categorías

Este documento es histórico. La categoría `backgrounds` se eliminó: los fondos
se reparten ahora entre `geometria`, `naturaleza` y `simulacion`, y los textos
mantienen `texts`. Las referencias a `backgrounds` de este texto describen el
estado de la época, no la convención actual. La fuente de verdad es
`src/lib/categories.ts` (`EXPERIMENT_CATEGORIES`).