---
title: Fuga de estrellas
description: Un enjambre de estrellas huye del foco central y deja estelas que se estiran al alejarse.
category: backgrounds
component: VanishBackground
props:
  - name: count
    label: Estrellas
    type: number
    default: 600
    min: 50
    max: 2000
    step: 10
  - name: speed
    label: Velocidad
    type: number
    default: 0.0006
    min: 0.0001
    max: 0.002
    step: 0.0001
  - name: focal
    label: Punto focal
    type: number
    default: 0.25
    min: 0.1
    max: 1
    step: 0.05
  - name: streak
    label: Estela
    type: number
    default: 2
    min: 1
    max: 30
    step: 1
  - name: ease
    label: Suavizado
    type: number
    default: 0.05
    min: 0.005
    max: 0.3
    step: 0.005
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
    default: "rgba(0, 0, 0, 0.55)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

Cada estrella se mueve radialmente desde el punto focal con velocidad proporcional a su distancia; `streak` estira el trazo en dirección al movimiento y `ease` suaviza el retargeting cuando sigue al puntero. Al salir del lienzo reaparecen en el centro con `speed`.

```tsx
<VanishBackground count={600} speed={0.0006} focal={0.25} streak={2} ease={0.05} />
```
