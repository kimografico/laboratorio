---
title: Juego de la Vida
description: Autómata celular de Conway que evoluciona y crece bajo la estela del puntero.
category: backgrounds
component: LifeBackground
props:
  - name: cell
    label: Tamaño de celda (px)
    type: number
    default: 10
    min: 4
    max: 40
    step: 1
  - name: tick
    label: Cadencia (ms)
    type: number
    default: 140
    min: 40
    max: 500
    step: 10
  - name: brush
    label: Pincel (celdas)
    type: number
    default: 2
    min: 1
    max: 8
    step: 1
  - name: seed
    label: Semilla
    type: number
    default: 0.05
    min: 0
    max: 0.5
    step: 0.01
  - name: spark
    label: Chispa
    type: number
    default: 0.01
    min: 0
    max: 0.1
    step: 0.005
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.3)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

El universo se siembra al azar (`seed`) y evoluciona cada `tick` milisegundos; `cell` controla el tamaño de la cuadrícula y `brush` el radio con el que el puntero pinta celdas vivas. De vez en cuando aparece un pentaminó R según la probabilidad `spark`, y `color`/`background` fijan la tinta y el lienzo.

```tsx
<LifeBackground cell={10} tick={140} brush={2} seed={0.05} spark={0.01} />
```
