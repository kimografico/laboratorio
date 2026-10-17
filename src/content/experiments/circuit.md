---
title: Circuito
description: Pistas de circuito impreso que avanzan por una cuadrícula y nacen bajo el puntero.
category: backgrounds
component: CircuitBackground
props:
  - name: grid
    label: Cuadrícula (px)
    type: number
    default: 18
    min: 6
    max: 60
    step: 2
  - name: speed
    label: Velocidad
    type: number
    default: 14
    min: 0
    max: 60
    step: 1
  - name: maxLen
    label: Longitud máx.
    type: number
    default: 45
    min: 5
    max: 150
    step: 5
  - name: ambient
    label: Pistas autónomas
    type: number
    default: 1.2
    min: 0
    max: 6
    step: 0.1
  - name: spawnDist
    label: Distancia del puntero (px)
    type: number
    default: 70
    min: 10
    max: 300
    step: 10
  - name: fade
    label: Fundido (s)
    type: number
    default: 4
    min: 0.2
    max: 15
    step: 0.2
  - name: maxTraces
    label: Pistas máx.
    type: number
    default: 80
    min: 10
    max: 300
    step: 10
  - name: lineWidth
    label: Grosor (px)
    type: number
    default: 1.2
    min: 0.5
    max: 6
    step: 0.1
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.4)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

Las pistas avanzan por una cuadrícula en 8 direcciones con giros de 45°, nacen solas (`ambient`) o bajo el puntero cada `spawnDist` px, y se desvanecen tras `fade` segundos. Ajusta `grid`, `speed` y `maxTraces` para controlar densidad y ritmo.

```tsx
<CircuitBackground grid={18} speed={14} ambient={1.2} maxTraces={80} />
```
