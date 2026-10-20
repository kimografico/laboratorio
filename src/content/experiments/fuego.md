---
title: "Fuego"
description: "Autómata de fuego en celdas que arde desde la base y prende bajo el puntero."
category: pendiente
component: "FuegoBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 5
    min: 3
    max: 10
    step: 1
  - name: "base"
    label: "Base de brasas"
    type: "number"
    default: 0.6
    min: 0
    max: 1
    step: 0.01
  - name: "decay"
    label: "Enfriamiento"
    type: "number"
    default: 0.04
    min: 0.01
    max: 0.12
    step: 0.005
  - name: "wind"
    label: "Viento"
    type: "number"
    default: 0
    min: -1
    max: 1
    step: 0.05
  - name: "rad"
    label: "Radio puntero (px)"
    type: "number"
    default: 40
    min: 10
    max: 120
    step: 1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.8
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--fuego-opacity` en CSS.

```tsx
<FuegoBackground cell={5} base={0.6} decay={0.04} />
```
