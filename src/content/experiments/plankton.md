---
title: Plancton
description: Partículas a la deriva que brillan y reaccionan a la estela del puntero.
category: backgrounds
component: PlanktonBackground
props:
  - name: density
    label: Densidad
    type: number
    default: 8.5
    min: 0.2
    max: 25
    step: 0.1
  - name: size
    label: Tamaño (px)
    type: number
    default: 1.5
    min: 0.5
    max: 6
    step: 0.1
  - name: drift
    label: Deriva
    type: number
    default: 0.2
    min: 0
    max: 1
    step: 0.02
  - name: wake
    label: Estela
    type: number
    default: 0.5
    min: 0
    max: 4
    step: 0.1
  - name: radius
    label: Radio (px)
    type: number
    default: 100
    min: 40
    max: 400
    step: 10
  - name: glow
    label: Brillo
    type: number
    default: 1.25
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
---

## Uso

Cada partícula deriva y parpadea; cerca del puntero acumula brillo y es arrastrada por la estela del ratón (`wake`).

```tsx
<PlanktonBackground density={1.2} drift={0.14} wake={1} glow={0.7} />
```
