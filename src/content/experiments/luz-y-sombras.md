---
title: "Luz y sombras"
description: "Rayos que salen del puntero y dibujan la silueta de obstáculos aleatorios mediante intersección."
category: pendiente
component: "LuzYSombrasBackground"
props:
  - name: "n"
    label: "Obstáculos"
    type: "number"
    default: 12
    min: 2
    max: 30
    step: 1
  - name: "rays"
    label: "Rayos"
    type: "number"
    default: 360
    min: 90
    max: 720
    step: 10
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1.2
    min: 0.5
    max: 3
    step: 0.1
  - name: "beams"
    label: "Haces visibles"
    type: "number"
    default: 0.4
    min: 0
    max: 1
    step: 0.01
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--luz-y-sombras-opacity` en CSS.

```tsx
<LuzYSombrasBackground n={12} rays={360} beams={0.4} />
```
