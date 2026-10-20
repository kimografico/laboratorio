---
title: "Tabla de Lissajous"
description: "Retícula de figuras de Lissajous que oscilan y crecen bajo el puntero."
category: pendiente
component: "TablaDeLissajousBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 80
    min: 40
    max: 140
    step: 2
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 0.5
    min: 0
    max: 2
    step: 0.05
  - name: "reach"
    label: "Alcance puntero (px)"
    type: "number"
    default: 200
    min: 50
    max: 400
    step: 5
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1
    min: 0.5
    max: 3
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--tabla-de-lissajous-opacity` en CSS.

```tsx
<TablaDeLissajousBackground cell={80} speed={0.5} reach={200} />
```
