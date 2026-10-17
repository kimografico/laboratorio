---
title: Lissajous
description: Curvas de Lissajous superpuestas que giran lentamente y se deforman siguiendo al puntero.
category: backgrounds
component: LissajousBackground
props:
  - name: layers
    label: Capas
    type: number
    default: 4
    min: 1
    max: 10
    step: 1
  - name: size
    label: Tamaño
    type: number
    default: 0.38
    min: 0.1
    max: 0.5
    step: 0.01
  - name: points
    label: Puntos
    type: number
    default: 1800
    min: 200
    max: 4000
    step: 100
  - name: turns
    label: Vueltas
    type: number
    default: 3
    min: 1
    max: 12
    step: 1
  - name: ease
    label: Suavizado
    type: number
    default: 0.04
    min: 0.01
    max: 0.3
    step: 0.01
  - name: spin
    label: Giro
    type: number
    default: 0.00006
    min: 0
    max: 0.0003
    step: 0.00001
  - name: lineWidth
    label: Grosor
    type: number
    default: 0.8
    min: 0.1
    max: 4
    step: 0.1
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.22)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`layers` apila copias desfasadas de la curva y `turns` densifica la malla; `size` fija el radio como fracción de la dimensión menor y `points` controla la calidad (y el coste) del trazo. La figura gira a la velocidad de `spin`, sigue al puntero con el suavizado de `ease` y se dibuja con `color` sobre `background`.

```tsx
<LissajousBackground layers={4} size={0.38} turns={3} ease={0.04} spin={0.00006} />
```
