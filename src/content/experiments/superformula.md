---
title: "Superfórmula"
description: "Capas de curvas de la superfórmula que giran y se deforman con el puntero."
category: pendiente
component: "SuperformulaBackground"
props:
  - name: "layers"
    label: "Capas"
    type: "number"
    default: 14
    min: 1
    max: 14
    step: 1
  - name: "m"
    label: "Simetría m"
    type: "number"
    default: 16
    min: 1
    max: 16
    step: 1
  - name: "n1"
    label: "n1"
    type: "number"
    default: 1
    min: 0.2
    max: 4
    step: 0.05
  - name: "n2"
    label: "n2"
    type: "number"
    default: 1.7
    min: 0.2
    max: 6
    step: 0.05
  - name: "n3"
    label: "n3"
    type: "number"
    default: 1.7
    min: 0.2
    max: 6
    step: 0.05
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 150
    min: 40
    max: 400
    step: 5
  - name: "mouse"
    label: "Efecto puntero"
    type: "number"
    default: 0.5
    min: 0
    max: 1
    step: 0.01
  - name: "spin"
    label: "Giro"
    type: "number"
    default: 0.4
    min: 0
    max: 2
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--superformula-opacity` en CSS.

```tsx
<SuperformulaBackground layers={14} m={16} size={150} />
```
