---
title: "Radar"
description: "Barrido circular con anillos y ecos que se encienden al paso del haz; el puntero añade un eco."
category: pendiente
component: "RadarBackground"
props:
  - name: "n"
    label: "Ecos"
    type: "number"
    default: 40
    min: 5
    max: 120
    step: 1
  - name: "rings"
    label: "Anillos"
    type: "number"
    default: 5
    min: 2
    max: 10
    step: 1
  - name: "speed"
    label: "Giro"
    type: "number"
    default: 0.8
    min: 0.1
    max: 3
    step: 0.05
  - name: "decay"
    label: "Desvanecer"
    type: "number"
    default: 3
    min: 0.5
    max: 8
    step: 0.1
  - name: "tail"
    label: "Estela"
    type: "number"
    default: 0.9
    min: 0.2
    max: 2
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.6
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--radar-opacity` en CSS.

```tsx
<RadarBackground n={40} rings={5} speed={0.8} />
```
