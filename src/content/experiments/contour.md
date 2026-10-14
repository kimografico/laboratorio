---
title: Isolíneas
description: Curvas de nivel (marching squares) sobre un campo de ruido que se abomba bajo el puntero.
category: backgrounds
component: ContourBackground
props:
  - name: cell
    label: Celda (px)
    type: number
    default: 14
    min: 6
    max: 40
    step: 1
  - name: spacing
    label: Separación
    type: number
    default: 0.22
    min: 0.05
    max: 1
    step: 0.01
  - name: indexEvery
    label: Línea índice cada
    type: number
    default: 5
    min: 1
    max: 10
    step: 1
  - name: lift
    label: Abultamiento
    type: number
    default: 1.1
    min: 0
    max: 3
    step: 0.1
  - name: radius
    label: Radio (px)
    type: number
    default: 220
    min: 60
    max: 500
    step: 10
  - name: flow
    label: Flujo
    type: number
    default: 1
    min: 0
    max: 4
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.16
    min: 0.03
    max: 1
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
    default: "#000000"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

El campo se calcula como suma de senos y se dibuja con *marching squares*. Cada `indexEvery` líneas se traza una curva más marcada (de índice). El puntero eleva el campo con un decaimiento gaussiano de radio `radius`.

```tsx
<ContourBackground cell={14} spacing={0.22} indexEvery={5} lift={1.1} />
```
