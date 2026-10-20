---
title: "Túnel"
description: "Anillos poligonales que se alejan hacia el centro y se tuercen con el puntero."
category: pendiente
component: "TunelBackground"
props:
  - name: "rings"
    label: "Anillos"
    type: "number"
    default: 22
    min: 6
    max: 40
    step: 1
  - name: "sides"
    label: "Lados"
    type: "number"
    default: 4
    min: 3
    max: 8
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: -2
    max: 3
    step: 0.05
  - name: "twist"
    label: "Torsión"
    type: "number"
    default: 0.8
    min: 0
    max: 3
    step: 0.05
  - name: "spin"
    label: "Giro"
    type: "number"
    default: 0.3
    min: -2
    max: 2
    step: 0.05
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1
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

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--tunel-opacity` en CSS.

```tsx
<TunelBackground rings={22} sides={4} twist={0.8} />
```
