---
title: Plancton
description: Partículas a la deriva que brillan y reaccionan a la estela del puntero.
category: backgrounds
component: PlanktonBackground
props:
  - name: density
    label: Densidad
    type: number
    default: 1.2
    min: 0.2
    max: 5
    step: 0.1
  - name: size
    label: Tamaño (px)
    type: number
    default: 1.8
    min: 0.5
    max: 6
    step: 0.1
  - name: drift
    label: Deriva
    type: number
    default: 0.14
    min: 0
    max: 1
    step: 0.02
  - name: wake
    label: Estela
    type: number
    default: 1
    min: 0
    max: 4
    step: 0.1
  - name: radius
    label: Radio (px)
    type: number
    default: 150
    min: 40
    max: 400
    step: 10
  - name: glow
    label: Brillo
    type: number
    default: 0.7
    min: 0
    max: 2
    step: 0.05
  - name: alpha
    label: Opacidad
    type: number
    default: 0.35
    min: 0.05
    max: 1
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

Cada partícula deriva y parpadea; cerca del puntero acumula brillo y es arrastrada por la estela del ratón (`wake`).

```tsx
<PlanktonBackground density={1.2} drift={0.14} wake={1} glow={0.7} />
```
