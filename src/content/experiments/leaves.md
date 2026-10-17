---
title: Leaves
description: Ramas que entran desde los bordes con hojas que aletean con el viento y se apartan del puntero.
category: pendiente
component: LeavesBackground
props:
  - name: near
    label: Cercanas
    type: number
    default: 4
    min: 0
    max: 12
    step: 1
  - name: far
    label: Lejanas
    type: number
    default: 3
    min: 0
    max: 12
    step: 1
  - name: size
    label: Tamaño hoja (px)
    type: number
    default: 80
    min: 20
    max: 200
    step: 5
  - name: wind
    label: Viento
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: push
    label: Empuje del puntero
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor línea
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Las ramas cercanas llevan contorno, nervios y peciolo; las lejanas son siluetas grandes y tenues. Ajusta `near`/`far` para la cantidad de ramas, `size` para el largo de la hoja mayor, `wind` para el balanceo, `push` para cuánto las aparta el puntero y `alpha`/`lineWidth` para la tinta. Por defecto hereda el color de la página (`currentColor`); puedes fijarlo con `color` o definiendo `--leaves-color` y `--leaves-opacity` en CSS.

```tsx
<LeavesBackground near={4} far={3} size={80} wind={1} push={1} alpha={0.3} />
```
