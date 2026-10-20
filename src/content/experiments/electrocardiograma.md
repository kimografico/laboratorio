---
title: "Electrocardiograma"
description: "Trazas de ECG que avanzan en horizontal y se amplifican al acercar el puntero."
category: pendiente
component: "ElectrocardiogramaBackground"
props:
  - name: "rows"
    label: "Trazas"
    type: "number"
    default: 6
    min: 2
    max: 14
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 0.5
    min: 0.2
    max: 3
    step: 0.05
  - name: "amp"
    label: "Amplitud"
    type: "number"
    default: 1
    min: 0.1
    max: 1.5
    step: 0.05
  - name: "boost"
    label: "Efecto puntero"
    type: "number"
    default: 1.5
    min: 0
    max: 3
    step: 0.1
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1.2
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

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--electrocardiograma-opacity` en CSS.

```tsx
<ElectrocardiogramaBackground rows={7} speed={1} boost={1.2} />
```
