---
title: "Atractor de Lorenz"
description: "Estela tridimensional del atractor de Lorenz que gira con el puntero y se desvanece por tramos."
category: matematica
component: "AtractorDeLorenzBackground"
props:
  - name: "rho"
    label: "Rho"
    type: "number"
    default: 28
    min: 10
    max: 50
    step: 1
  - name: "steps"
    label: "Pasos/fotograma"
    type: "number"
    default: 4
    min: 1
    max: 12
    step: 1
  - name: "len"
    label: "Estela"
    type: "number"
    default: 1800
    min: 300
    max: 4000
    step: 50
  - name: "zoom"
    label: "Zoom"
    type: "number"
    default: 1
    min: 0.5
    max: 2.5
    step: 0.05
  - name: "tilt"
    label: "Giro puntero"
    type: "number"
    default: 1
    min: 0
    max: 2
    step: 0.05
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1
    min: 0.4
    max: 3
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.7
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--atractor-de-lorenz-opacity` en CSS.

```tsx
<AtractorDeLorenzBackground rho={28} steps={4} len={1800} />
```
