---
title: Cross Grid
description: Rejilla de cruces que se alargan y giran hacia el puntero, convirtiendo la "+" en "×".
category: backgrounds
component: CrossBackground
props:
  - name: size
    label: Separación (px)
    type: number
    default: 32
    min: 12
    max: 80
    step: 1
  - name: arm
    label: Brazo (px)
    type: number
    default: 6
    min: 1
    max: 30
    step: 1
  - name: growth
    label: Alargamiento (px)
    type: number
    default: 8
    min: 0
    max: 40
    step: 1
  - name: proximity
    label: Influencia (px)
    type: number
    default: 180
    min: 40
    max: 500
    step: 5
  - name: rotation
    label: Giro máximo (º)
    type: number
    default: 90
    min: 0
    max: 180
    step: 5
  - name: ease
    label: Suavizado
    type: number
    default: 0.05
    min: 0.01
    max: 0.2
    step: 0.005
  - name: lineWidth
    label: Grosor
    type: number
    default: 1.5
    min: 0.5
    max: 5
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

`rotation={45}` convierte las cruces en aspas; `rotation={90}` da un cuarto de vuelta completo.

```tsx
<CrossBackground size={32} rotation={90} proximity={180} color="rgba(0,0,0,0.2)" />
```
