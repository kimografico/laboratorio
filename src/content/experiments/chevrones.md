---
title: "Chevrones"
description: "Filas de chevrones en zigzag que ondulan y se abren bajo el puntero."
category: pendiente
component: "ChevronesBackground"
props:
  - name: "row"
    label: "Fila (px)"
    type: "number"
    default: 22
    min: 10
    max: 50
    step: 1
  - name: "wl"
    label: "Ancho pico (px)"
    type: "number"
    default: 44
    min: 16
    max: 100
    step: 1
  - name: "amp"
    label: "Amplitud"
    type: "number"
    default: 0.5
    min: 0.1
    max: 1.5
    step: 0.05
  - name: "mouse"
    label: "Efecto puntero"
    type: "number"
    default: 1.2
    min: 0
    max: 3
    step: 0.1
  - name: "reach"
    label: "Alcance (px)"
    type: "number"
    default: 180
    min: 50
    max: 400
    step: 5
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 0.4
    min: -2
    max: 2
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.4
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--chevrones-opacity` en CSS.

```tsx
<ChevronesBackground row={22} wl={44} amp={0.5} />
```
