---
title: "Atractor de Clifford"
description: "Atractor extraño de Clifford dibujado punto a punto, con deriva temporal y parámetros que responden al puntero."
category: pendiente
component: "AtractorDeCliffordBackground"
props:
  - name: "a"
    label: "a"
    type: "number"
    default: -1.4
    min: -2
    max: 2
    step: 0.05
  - name: "b"
    label: "b"
    type: "number"
    default: 1.6
    min: -2
    max: 2
    step: 0.05
  - name: "cc"
    label: "c"
    type: "number"
    default: 1
    min: -2
    max: 2
    step: 0.05
  - name: "d"
    label: "d"
    type: "number"
    default: 0.7
    min: -2
    max: 2
    step: 0.05
  - name: "mouse"
    label: "Efecto puntero"
    type: "number"
    default: 0.75
    min: 0
    max: 1
    step: 0.01
  - name: "drift"
    label: "Deriva"
    type: "number"
    default: 2
    min: 0
    max: 2
    step: 0.05
  - name: "n"
    label: "Puntos"
    type: "number"
    default: 20000
    min: 2000
    max: 40000
    step: 500
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.35
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--atractor-de-clifford-opacity` en CSS.

```tsx
<AtractorDeCliffordBackground a={-1.4} b={1.6} cc={1} d={0.7} />
```
