---
title: Lluvia y ondas
description: Gotas que caen con estela y generan ondas circulares concéntricas al impactar.
category: pendiente
component: RainRipplesBackground
props:
  - name: rain
    label: Intensidad
    type: number
    default: 7
    min: 1
    max: 30
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0.2
    max: 3
    step: 0.1
  - name: length
    label: Estela (px)
    type: number
    default: 16
    min: 4
    max: 60
    step: 1
  - name: life
    label: Duración (s)
    type: number
    default: 1.6
    min: 0.4
    max: 4
    step: 0.1
  - name: width
    label: Grosor (px)
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.6
    min: 0.05
    max: 1
    step: 0.05
---

## Uso

Cada gota cae a `speed` con una estela de `length` y, al tocar el suelo, abre ondas que se expanden y se apagan en `life` segundos; `rain` controla cuántas caen a la vez. Hereda el color de la página o se fija con `--rain-color` y `--rain-opacity` en CSS.

```tsx
<RainRipplesBackground rain={7} speed={1} length={16} />
```
