---
title: Galaxia
description: Espiral de estrellas giratoria con brazos definidos, dispersión y parpadeo individual.
category: pendiente
component: GalaxyBackground
props:
  - name: arms
    label: Brazos
    type: number
    default: 5
    min: 2
    max: 8
    step: 1
  - name: stars
    label: Estrellas
    type: number
    default: 5000
    min: 100
    max: 5000
    step: 50
  - name: radius
    label: Radio
    type: number
    default: 0.9
    min: 0.1
    max: 1.50
    step: 0.1
  - name: spin
    label: Giro
    type: number
    default: 0.03
    min: 0
    max: 0.5
    step: 0.01
  - name: spread
    label: Dispersión
    type: number
    default: 0.75
    min: 0.05
    max: 1.5
    step: 0.05
  - name: twinkle
    label: Parpadeo
    type: number
    default: 1.5
    min: 0
    max: 1.5
    step: 0.05
  - name: size
    label: Tamaño (px)
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: color
    label: Color
    type: color
    default: "#f4efe8"
  - name: background
    label: Fondo
    type: color
    default: "#1b1917"
---

## Uso

Las estrellas se distribuyen en `arms` brazos logarítmicos con `spread` de dispersión y giran a `spin`; `twinkle` regula cuánto varía el brillo de cada una.

```tsx
<GalaxyBackground arms={4} stars={900} spin={0.06} />
```
