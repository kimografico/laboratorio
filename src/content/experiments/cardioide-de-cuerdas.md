---
title: "Cardioide de cuerdas"
description: "Cuerdas tensadas entre puntos de una circunferencia que dibujan la envolvente de una cardioide y reaccionan al puntero."
category: matematica
component: "CardioideDeCuerdasBackground"
props:
  - name: "n"
    label: "Puntos"
    type: "number"
    default: 260
    min: 60
    max: 500
    step: 10
  - name: "k"
    label: "Factor"
    type: "number"
    default: 2
    min: 1.5
    max: 12
    step: 0.1
  - name: "mouse"
    label: "Efecto puntero"
    type: "number"
    default: 2
    min: 0
    max: 6
    step: 0.1
  - name: "drift"
    label: "Deriva"
    type: "number"
    default: 0.15
    min: 0
    max: 1
    step: 0.01
  - name: "size"
    label: "Radio (px)"
    type: "number"
    default: 300
    min: 100
    max: 500
    step: 10
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 0.6
    min: 0.3
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

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--cardioide-de-cuerdas-opacity` en CSS.

```tsx
<CardioideDeCuerdasBackground n={260} k={2} mouse={2} />
```
