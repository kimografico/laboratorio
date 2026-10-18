---
title: Voronoi
description: Celdas de Voronoi vivas cuyas semillas derivan y se apartan del puntero.
category: backgrounds
component: VoronoiBackground
props:
  - name: density
    label: Densidad
    type: number
    default: 3
    min: 0.5
    max: 10
    step: 0.5
  - name: speed
    label: Velocidad
    type: number
    default: 0.25
    min: 0
    max: 2
    step: 0.05
  - name: radius
    label: Radio (px)
    type: number
    default: 150
    min: 0
    max: 400
    step: 10
  - name: push
    label: Empuje
    type: number
    default: 1.2
    min: 0
    max: 5
    step: 0.1
  - name: dot
    label: Punto (px)
    type: number
    default: 1.6
    min: 0
    max: 6
    step: 0.2
  - name: highlight
    label: Realce
    type: number
    default: 0.07
    min: 0
    max: 0.5
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: color
    label: Color
    type: color
  - name: alpha
    label: Opacidad
    type: number
    default: 0.2
    min: 0
    max: 1
    step: 0.02
---

## Uso

`density` y `speed` gobiernan cuántas semillas hay y qué rápido derivan; `radius` y `push` definen la zona y la fuerza con la que el puntero las aparta. `dot` dibuja el punto de cada semilla y `highlight` realza la celda bajo el cursor.

```tsx
<VoronoiBackground density={3} speed={0.25} radius={150} push={1.2} highlight={0.07} alpha={0.2} />
```
