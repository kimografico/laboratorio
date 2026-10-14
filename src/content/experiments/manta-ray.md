---
title: Manta Ray
description: Mantas que nadan de izquierda a derecha, con profundidad, aleteo y esquiva del puntero.
category: backgrounds
component: MantaBackground
accent: "#000000"
props:
  - name: count
    label: Mantas
    type: number
    default: 12
    min: 1
    max: 40
    step: 1
  - name: size
    label: Tamaño base (px)
    type: number
    default: 110
    min: 30
    max: 300
    step: 10
  - name: speed
    label: Velocidad
    type: number
    default: 0.9
    min: 0.1
    max: 4
    step: 0.1
  - name: avoid
    label: Esquiva (px)
    type: number
    default: 170
    min: 0
    max: 500
    step: 10
  - name: turn
    label: Giro
    type: number
    default: 0.015
    min: 0.005
    max: 0.05
    step: 0.005
  - name: alpha
    label: Opacidad
    type: number
    default: 0.28
    min: 0
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
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

`avoid` y `turn` controlan cuánto y con qué rapidez esquivan al puntero. `size` fija la escala; cada manta varía entre 0.3x y 1.4x.

```tsx
<MantaBackground count={12} size={110} avoid={170} alpha={0.28} />
```
