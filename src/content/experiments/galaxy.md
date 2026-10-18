---
title: Galaxia
description: Espiral de estrellas giratoria con brazos definidos, dispersión y parpadeo individual.
category: backgrounds
component: GalaxyBackground
props:
  - name: arms
    label: Brazos
    type: number
    default: 6
    min: 2
    max: 8
    step: 1
  - name: stars
    label: Estrellas
    type: number
    default: 10000
    min: 100
    max: 10000
    step: 50
  - name: radius
    label: Radio
    type: number
    default: 1.2
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
    default: 1.05
    min: 0
    max: 1.5
    step: 0.05
  - name: size
    label: Tamaño (px)
    type: number
    default: 0.5
    min: 0.5
    max: 4
    step: 0.1
  - name: mouse
    label: Parallax
    type: number
    default: 0.1
    min: 0
    max: 0.3
    step: 0.01
  - name: easing
    label: Easing
    type: number
    default: 0.03
    min: 0.01
    max: 1
    step: 0.01
  - name: glow
    label: Opacidad del resplandor
    type: number
    default: 0.2
    min: 0
    max: 1
    step: 0.05
  - name: color
    label: Color
    type: color
---

## Uso

Las estrellas se distribuyen en `arms` brazos logarítmicos con `spread` de dispersión y giran a `spin`; `twinkle` regula cuánto varía el brillo de cada una. El resplandor radial del núcleo se atenúa con `glow` (0 lo hace desaparecer). El puntero desplaza las estrellas con parallax cuya intensidad regula `mouse` y cuyo suavizado da `easing` (0.01 = muy rezagado, 1 = instantáneo).

```tsx
<GalaxyBackground arms={4} stars={900} spin={0.06} />
```
