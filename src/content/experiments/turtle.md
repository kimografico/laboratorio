---
title: Tortugas
description: Tortugas que nadan en dos planos de profundidad, huyen del puntero y salen a romper la superficie.
category: pendiente
component: TurtleBackground
props:
  - name: near
    label: Tortugas primer plano
    type: number
    default: 3
    min: 0
    max: 10
    step: 1
  - name: far
    label: Tortugas fondo
    type: number
    default: 3
    min: 0
    max: 10
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 210
    min: 50
    max: 500
    step: 10
  - name: speed
    label: Velocidad
    type: number
    default: 0.55
    min: 0.05
    max: 2
    step: 0.05
  - name: avoid
    label: Miedo al puntero (px)
    type: number
    default: 230
    min: 0
    max: 600
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0
    max: 1
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Cada tortuga nada con aleteo sinusoidal, persigue su rumbo con inercia y esquiva al puntero dentro de `avoid`; las del fondo son más lentas y tenues. De vez en cuando asciende a romper la superficie. Hereda el color de la página o se fija con `--turtle-color` y `--turtle-opacity` en CSS.

```tsx
<TurtleBackground near={3} far={3} size={210} speed={0.55} avoid={230} />
```
