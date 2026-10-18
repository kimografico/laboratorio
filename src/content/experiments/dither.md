---
title: Tramado
description: Retícula de píxeles tramados con una matriz de Bayer que se enciende alrededor del puntero.
category: backgrounds
component: DitherBackground
props:
  - name: cell
    label: Tamaño de celda (px)
    type: number
    default: 6
    min: 2
    max: 24
    step: 1
  - name: gap
    label: Separación (px)
    type: number
    default: 1
    min: 0
    max: 6
    step: 1
  - name: radius
    label: Radio del halo (px)
    type: number
    default: 240
    min: 40
    max: 600
    step: 10
  - name: intensity
    label: Intensidad
    type: number
    default: 0.55
    min: 0
    max: 1
    step: 0.05
  - name: ambient
    label: Ambiente
    type: number
    default: 0.18
    min: 0
    max: 1
    step: 0.01
  - name: speed
    label: Velocidad
    type: number
    default: 0.0003
    min: 0
    max: 0.002
    step: 0.0001
  - name: ease
    label: Suavizado
    type: number
    default: 0.1
    min: 0.01
    max: 0.5
    step: 0.01
  - name: color
    label: Color
    type: color
  - name: alpha
    label: Opacidad
    type: number
    default: 0.28
    min: 0
    max: 1
    step: 0.02
---

## Uso

El tramado se dibuja con una matriz de Bayer de 8×8: `cell` y `gap` controlan el tamaño y la separación de los píxeles, `radius` e `intensity` el halo que sigue al puntero, y `ambient`/`speed` las nubes que flotan solas. `ease` regula con qué suavidad el halo alcanza al cursor.

```tsx
<DitherBackground cell={6} radius={240} intensity={0.55} ambient={0.18} alpha={0.28} />
```
