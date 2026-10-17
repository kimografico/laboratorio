---
title: Rayos de luz
description: Haces de luz inclinados cuelgan del borde superior, se balancean y se inclinan hacia el puntero.
category: backgrounds
component: RaysBackground
props:
  - name: beams
    label: Haces
    type: number
    default: 7
    min: 1
    max: 20
    step: 1
  - name: width
    label: Anchura (px)
    type: number
    default: 120
    min: 20
    max: 400
    step: 10
  - name: tilt
    label: Inclinación
    type: number
    default: 0.24
    min: 0
    max: 1
    step: 0.02
  - name: sway
    label: Balanceo
    type: number
    default: 1
    min: 0
    max: 2
    step: 0.1
  - name: follow
    label: Seguimiento
    type: number
    default: 1
    min: 0
    max: 2
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.09
    min: 0.01
    max: 0.5
    step: 0.01
---

## Uso

Cada haz cuelga del borde superior y se dibuja como un degradado con núcleo tenue; `sway` lo mece, `follow` lo inclina hacia el puntero y `tilt` fija su inclinación base. Hereda el color de la página o se fija con `--rays-color` y `--rays-opacity` en CSS.

```tsx
<RaysBackground beams={7} width={120} tilt={0.24} sway={1} follow={1} alpha={0.09} />
```
