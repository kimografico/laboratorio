---
title: "Strandbeest"
description: "Bestias de Theo Jansen que caminan con el viento del puntero y levantan partículas de aire."
category: pendiente
component: "StrandbeestBackground"
props:
  - name: "beasts"
    label: "Bestias"
    type: "number"
    default: 2
    min: 1
    max: 2
    step: 1
  - name: "legs"
    label: "Patas"
    type: "number"
    default: 6
    min: 2
    max: 10
    step: 1
  - name: "size"
    label: "Altura (px)"
    type: "number"
    default: 210
    min: 80
    max: 400
    step: 5
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "particles"
    label: "Partículas"
    type: "number"
    default: 150
    min: 0
    max: 500
    step: 10
  - name: "calm"
    label: "Zona de calma"
    type: "number"
    default: 0.08
    min: 0
    max: 0.5
    step: 0.01
  - name: "idleWind"
    label: "Viento en calma"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.34
    min: 0
    max: 1
    step: 0.01
  - name: "lineWidth"
    label: "Grosor línea"
    type: "number"
    default: 1
    min: 0.5
    max: 3
    step: 0.1
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--strandbeest-opacity` en CSS.

```tsx
<StrandbeestBackground beasts={2} legs={6} size={210} />
```
