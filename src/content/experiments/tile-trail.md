---
title: Tile Trail
description: Rejilla de baldosas que se iluminan al paso del puntero y se apagan dejando estela.
category: backgrounds
component: TileBackground
accent: "#000000"
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
    default: 140
    min: 20
    max: 400
    step: 5
  - name: baseAlpha
    label: Opacidad base
    type: number
    default: 0.04
    min: 0
    max: 0.5
    step: 0.01
  - name: maxAlpha
    label: Opacidad máx.
    type: number
    default: 0.22
    min: 0
    max: 1
    step: 0.02
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

`decay` más alto = estela más larga. `randomness` hace que cada baldosa tenga intensidad, alcance y duración propios.

```tsx
<TileBackground size={28} gap={4} decay={0.97} randomness={0.6} />
```
