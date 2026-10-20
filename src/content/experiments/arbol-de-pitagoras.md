---
title: "Árbol de Pitágoras"
description: "Fractal de cuadrados y triángulos que crece desde la base y se mece con el viento y el puntero."
category: pendiente
component: "ArbolDePitagorasBackground"
props:
  - name: "depth"
    label: "Profundidad"
    type: "number"
    default: 10
    min: 3
    max: 11
    step: 1
  - name: "angle"
    label: "Ángulo (°)"
    type: "number"
    default: 60
    min: 20
    max: 70
    step: 1
  - name: "mouse"
    label: "Efecto puntero (°)"
    type: "number"
    default: 20
    min: 0
    max: 30
    step: 1
  - name: "sway"
    label: "Viento"
    type: "number"
    default: 9
    min: 0
    max: 12
    step: 0.5
  - name: "size"
    label: "Base (px)"
    type: "number"
    default: 75
    min: 30
    max: 200
    step: 5
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.55
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--arbol-de-pitagoras-opacity` en CSS.

```tsx
<ArbolDePitagorasBackground depth={9} angle={42} sway={4} />
```
