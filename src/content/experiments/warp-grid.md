---
title: Warp Grid
description: Rejilla que se deforma como un ojo de pez alrededor del puntero que la sigue con suavizado.
category: backgrounds
component: WarpGridBackground
accent: "#000000"
props:
  - name: size
    label: Rejilla (px)
    type: number
    default: 36
    min: 10
    max: 100
    step: 2
  - name: radius
    label: Radio lente (px)
    type: number
    default: 180
    min: 40
    max: 500
    step: 10
  - name: lens
    label: Intensidad
    type: number
    default: 0.6
    min: 0
    max: 2
    step: 0.1
  - name: ease
    label: Suavizado
    type: number
    default: 0.1
    min: 0.02
    max: 0.3
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.5
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.2)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`lens` controla cuánto se abre la rejilla bajo el puntero; `ease` la rapidez con la que la lente lo sigue.

```tsx
<WarpGridBackground size={36} radius={180} lens={0.6} ease={0.1} />
```
