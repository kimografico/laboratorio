---
title: Tile Spin
description: Baldosas que se encogen y giran al paso del puntero, cada una con su propio sentido e intensidad.
category: backgrounds
component: TileSpinBackground
props:
  - name: size
    label: Celda (px)
    type: number
    default: 28
    min: 8
    max: 80
    step: 1
  - name: gap
    label: Espacio (px)
    type: number
    default: 4
    min: 0
    max: 20
    step: 1
  - name: proximity
    label: Influencia (px)
    type: number
    default: 220
    min: 20
    max: 500
    step: 5
  - name: shrink
    label: Encogimiento
    type: number
    default: 0.85
    min: 0
    max: 1
    step: 0.05
  - name: rotation
    label: Giro máx. (º)
    type: number
    default: 35
    min: 0
    max: 180
    step: 5
  - name: decay
    label: Persistencia
    type: number
    default: 0.97
    min: 0.8
    max: 0.999
    step: 0.005
  - name: randomness
    label: Irregularidad
    type: number
    default: 0.6
    min: 0
    max: 1
    step: 0.05
  - name: alpha
    label: Opacidad
    type: number
    default: 0.08
    min: 0.01
    max: 0.6
    step: 0.01
  - name: alphaJitter
    label: Jitter de opacidad
    type: number
    default: 0.04
    min: 0
    max: 0.2
    step: 0.01
  - name: color
    label: Color
    type: color
    default: "#000000"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`shrink` es cuánto se encoge en el máximo (0.65 = queda al 35%). Cada baldosa tiene un giro, `dir`, propio.

```tsx
<TileSpinBackground size={28} shrink={0.85} rotation={35} alpha={0.08} />
```
