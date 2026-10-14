---
title: Triangle Spin
description: Rejilla de triángulos donde cada uno elige un giro aleatorio al entrar en la zona del puntero.
category: backgrounds
component: TriangleBackground2
props:
  - name: size
    label: Separación (px)
    type: number
    default: 30
    min: 12
    max: 80
    step: 1
  - name: radius
    label: Radio base (px)
    type: number
    default: 2
    min: 0.5
    max: 12
    step: 0.5
  - name: proximity
    label: Influencia (px)
    type: number
    default: 150
    min: 40
    max: 400
    step: 5
  - name: growth
    label: Crecimiento (px)
    type: number
    default: 12
    min: 0
    max: 60
    step: 1
  - name: ease
    label: Suavizado
    type: number
    default: 0.05
    min: 0.01
    max: 0.2
    step: 0.005
  - name: rotation
    label: Giro máx. (º)
    type: number
    default: 30
    min: 0
    max: 180
    step: 5
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.15)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

El giro va a la mitad de velocidad que el crecimiento. `rotation` fija el ángulo máximo (aleatorio en signo).

```tsx
<TriangleBackground2 size={30} growth={12} rotation={30} ease={0.05} />
```
