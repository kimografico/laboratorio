---
title: "Curva de Hilbert"
description: "Curva fractal que llena el plano; el puntero la repele y una cola luminosa la recorre."
category: pendiente
component: "CurvaDeHilbertBackground"
props:
  - name: "lv"
    label: "Nivel"
    type: "number"
    default: 5
    min: 3
    max: 6
    step: 1
  - name: "push"
    label: "Repulsión (px)"
    type: "number"
    default: 40
    min: 0
    max: 80
    step: 1
  - name: "reach"
    label: "Alcance (px)"
    type: "number"
    default: 150
    min: 50
    max: 300
    step: 5
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "tail"
    label: "Cola"
    type: "number"
    default: 0.15
    min: 0.02
    max: 0.5
    step: 0.01
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.3
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--curva-de-hilbert-opacity` en CSS.

```tsx
<CurvaDeHilbertBackground lv={5} push={40} speed={1} />
```
