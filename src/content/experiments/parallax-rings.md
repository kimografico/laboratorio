---
title: Parallax Rings
description: Anillos a distintas profundidades que se desplazan con el puntero creando paralaje.
category: backgrounds
component: RingsBackground
props:
  - name: count
    label: Anillos
    type: number
    default: 14
    min: 2
    max: 60
    step: 1
  - name: strength
    label: Fuerza paralaje
    type: number
    default: 80
    min: 0
    max: 300
    step: 10
  - name: ease
    label: Suavizado
    type: number
    default: 0.03
    min: 0.005
    max: 0.2
    step: 0.005
  - name: alpha
    label: Opacidad
    type: number
    default: 0.2
    min: 0
    max: 1
    step: 0.02
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

Los anillos grandes se sienten más cercanos y se mueven más. `strength` acentúa ese desplazamiento.

```tsx
<RingsBackground count={14} strength={80} alpha={0.2} />
```
