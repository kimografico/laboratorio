---
title: "Fuego"
description: "Autómata de fuego en celdas que arde desde la base y prende bajo el puntero."
category: simulacion
component: "FuegoBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 2
    min: 1
    max: 10
    step: 1
  - name: "base"
    label: "Base de brasas"
    type: "number"
    default: 1
    min: 0
    max: 1
    step: 0.01
  - name: "bwidth"
    label: "Ancho brasas"
    type: "number"
    default: 1.5
    min: 0.1
    max: 1.5
    step: 0.01
  - name: "decay"
    label: "Enfriamiento"
    type: "number"
    default: 0.03
    min: 0.01
    max: 0.20
    step: 0.005
  - name: "pdecay"
    label: "Enfriamiento puntero"
    type: "number"
    default: 0.15
    min: 0.01
    max: 0.20
    step: 0.005
  - name: "wind"
    label: "Viento"
    type: "number"
    default: 0.45
    min: -1
    max: 1
    step: 0.05
  - name: "rad"
    label: "Radio puntero (px)"
    type: "number"
    default: 20
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
  - name: "color"
    label: "Color"
    type: "color"
    default: "#ff7300"
    themed: false
---

## Uso

Usa `#ff7300` por defecto; el color se cambia con `color` y la opacidad global se ajusta con `--fuego-opacity` en CSS.

```tsx
<FuegoBackground cell={5} base={0.6} decay={0.04} />
```
