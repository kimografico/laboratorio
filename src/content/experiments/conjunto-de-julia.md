---
title: "Conjunto de Julia"
description: "Fractal de Julia rasterizado en celdas que se deforma y deriva con el puntero."
category: matematica
component: "ConjuntoDeJuliaBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 1
    min: 1
    max: 12
    step: 1
  - name: "iter"
    label: "Iteraciones"
    type: "number"
    default: 32
    min: 10
    max: 80
    step: 1
  - name: "zoom"
    label: "Zoom"
    type: "number"
    default: 2
    min: 0.5
    max: 3
    step: 0.05
  - name: "mouse"
    label: "Efecto puntero"
    type: "number"
    default: 0.4
    min: 0
    max: 1.5
    step: 0.05
  - name: "drift"
    label: "Deriva"
    type: "number"
    default: 2
    min: 0
    max: 3
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.25
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--conjunto-de-julia-opacity` en CSS.

```tsx
<ConjuntoDeJuliaBackground cell={3} iter={32} zoom={0.9} />
```
