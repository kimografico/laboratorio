---
title: Flow Field
description: Cientos de partículas que siguen un campo de corrientes y dejan estela, repelidas por el puntero.
category: backgrounds
component: FlowBackground
accent: "#000000"
props:
  - name: count
    label: Partículas
    type: number
    default: 800
    min: 50
    max: 2000
    step: 50
  - name: speed
    label: Velocidad
    type: number
    default: 1.1
    min: 0.2
    max: 4
    step: 0.1
  - name: scale
    label: Escala del campo
    type: number
    default: 0.0035
    min: 0.0005
    max: 0.01
    step: 0.0005
  - name: radius
    label: Radio de repulsión
    type: number
    default: 140
    min: 20
    max: 400
    step: 10
  - name: push
    label: Fuerza de repulsión
    type: number
    default: 3
    min: 0
    max: 12
    step: 0.5
  - name: fade
    label: Estela (borrado)
    type: number
    default: 0.07
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
    default: "rgba(0, 0, 0, 0.45)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`fade` define la longitud de la estela (0.02 larga, 0.15 corta). `scale` más bajo = corrientes más amplias.

```tsx
<FlowBackground count={800} fade={0.07} scale={0.0035} push={3} />
```
