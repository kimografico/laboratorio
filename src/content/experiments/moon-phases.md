---
title: "Fases lunares"
description: "Retícula de lunas que recorren todas sus fases; el puntero y los clics propagan ondas."
category: pendiente
component: "MoonPhasesBackground"
props:
  - name: "size"
    label: "Celda (px)"
    type: "number"
    default: 52
    min: 20
    max: 120
    step: 2
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "spread"
    label: "Desfase"
    type: "number"
    default: 1
    min: 0
    max: 5
    step: 0.1
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 170
    min: 20
    max: 400
    step: 5
  - name: "decay"
    label: "Persistencia"
    type: "number"
    default: 0.97
    min: 0.8
    max: 0.999
    step: 0.001
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--moon-phases-opacity` en CSS.

```tsx
<MoonPhasesBackground size={52} speed={1} spread={1} />
```
