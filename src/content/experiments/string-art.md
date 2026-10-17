---
title: Arte con hilos
description: Miles de hilos tensados entre puntos circulares se entrecruzan y siguen al puntero.
category: backgrounds
component: StringArtBackground
props:
  - name: points
    label: Puntos
    type: number
    default: 250
    min: 40
    max: 600
    step: 10
  - name: circles
    label: Círculos
    type: number
    default: 3
    min: 1
    max: 6
    step: 1
  - name: radius
    label: Radio
    type: number
    default: 0.9
    min: 0.1
    max: 1
    step: 0.02
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: follow
    label: Seguimiento
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.05
  - name: alpha
    label: Opacidad
    type: number
    default: 0.07
    min: 0.01
    max: 0.5
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Los puntos se reparten en `circles` anillos concéntricos y cada hilo une dos puntos separados por un salto constante; el anillo gira con `speed` y el puntero atrae los puntos con `follow`, deformando toda la malla. Hereda el color de la página o se fija con `--string-color` y `--string-opacity` en CSS.

```tsx
<StringArtBackground points={250} circles={3} radius={0.9} speed={1} follow={0.5} />
```
