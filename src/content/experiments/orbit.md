---
title: Órbitas
description: Partículas que orbitan un centro de gravedad que sigue al puntero, con estelas que se desvanecen.
category: backgrounds
component: OrbitBackground
props:
  - name: count
    label: Partículas
    type: number
    default: 110
    min: 20
    max: 400
    step: 10
  - name: speed
    label: Velocidad
    type: number
    default: 1.1
    min: 0.2
    max: 4
    step: 0.1
  - name: tail
    label: Estela
    type: number
    default: 28
    min: 4
    max: 80
    step: 1
  - name: ease
    label: Suavizado
    type: number
    default: 0.04
    min: 0.005
    max: 0.2
    step: 0.005
  - name: soft
    label: Núcleo blando (px)
    type: number
    default: 60
    min: 0
    max: 300
    step: 5
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
    default: "rgba(0, 0, 0, 0.5)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

Cada partícula es atraída por un centro de gravedad suavizado que sigue al puntero (o que orbita solo si no hay puntero). `soft` evita que las partículas salgan disparadas al pasar muy cerca y `tail` controla la longitud de su estela.

```tsx
<OrbitBackground count={110} speed={1.1} tail={28} ease={0.04} soft={60} />
```
