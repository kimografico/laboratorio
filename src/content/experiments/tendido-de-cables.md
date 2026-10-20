---
title: "Tendido de cables"
description: "Cables horizontales con gravedad y muelles que se hunden y vibran al pasar el puntero."
category: pendiente
component: "TendidoDeCablesBackground"
props:
  - name: "rows"
    label: "Cables"
    type: "number"
    default: 16
    min: 2
    max: 16
    step: 1
  - name: "slack"
    label: "Holgura"
    type: "number"
    default: 0.03
    min: 0.02
    max: 0.4
    step: 0.005
  - name: "g"
    label: "Gravedad"
    type: "number"
    default: 0.35
    min: 0.05
    max: 1
    step: 0.05
  - name: "reach"
    label: "Alcance (px)"
    type: "number"
    default: 110
    min: 30
    max: 250
    step: 5
  - name: "push"
    label: "Empuje"
    type: "number"
    default: 10
    min: 0
    max: 30
    step: 1
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
    default: 0.55
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--tendido-de-cables-opacity` en CSS.

```tsx
<TendidoDeCablesBackground rows={16} slack={0.03} g={0.35} />
```
