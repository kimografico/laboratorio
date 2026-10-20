---
title: "Schotter"
description: "Cuadrados que se desordenan y giran, con más caos bajo el puntero, inspirados en Schotter."
category: pendiente
component: "SchotterBackground"
props:
  - name: "s"
    label: "Tamaño (px)"
    type: "number"
    default: 32
    min: 16
    max: 60
    step: 1
  - name: "chaos"
    label: "Desorden"
    type: "number"
    default: 1
    min: 0
    max: 2
    step: 0.05
  - name: "mouse"
    label: "Desorden puntero"
    type: "number"
    default: 1.5
    min: 0
    max: 3
    step: 0.1
  - name: "reach"
    label: "Alcance (px)"
    type: "number"
    default: 130
    min: 50
    max: 300
    step: 5
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1
    min: 0.5
    max: 2.5
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

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--schotter-opacity` en CSS.

```tsx
<SchotterBackground s={32} chaos={1} mouse={1.5} />
```
