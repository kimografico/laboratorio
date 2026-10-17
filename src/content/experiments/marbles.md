---
title: Canicas
description: Canicas que caen, chocan entre sí y rebotan contra las paredes, y huyen del puntero.
category: backgrounds
component: MarblesBackground
props:
  - name: count
    label: Canicas
    type: number
    default: 51
    min: 4
    max: 60
    step: 1
  - name: gravity
    label: Gravedad
    type: number
    default: 600
    min: 0
    max: 900
    step: 10
  - name: bounce
    label: Rebote
    type: number
    default: 0.86
    min: 0.5
    max: 1
    step: 0.01
  - name: size
    label: Radio (px)
    type: number
    default: 16
    min: 5
    max: 40
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: width
    label: Grosor (px)
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0.05
    max: 1
    step: 0.05
---

## Uso

Simulación con gravedad y colisiones elásticas (`size` fija el radio base y cada canica varía un ±20%). `bounce` regula cuánta energía conservan al chocar, `speed` su impulso inicial y el puntero las empuja suavemente al acercarse. Hereda el color de la página o se fija con `--marbles-color` y `--marbles-opacity` en CSS.

```tsx
<MarblesBackground count={51} gravity={600} bounce={0.86} />
```
