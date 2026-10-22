---
title: "Péndulo doble"
description: "Péndulo doble con estela y amortiguación; el puntero mueve el pivote y lo desestabiliza."
category: pendiente
component: "PenduloDobleBackground"
props:
  - name: "size"
    label: "Escala (px)"
    type: "number"
    default: 150
    min: 60
    max: 260
    step: 5
  - name: "arms"
    label: "Brazos"
    type: "number"
    default: 2
    min: 1
    max: 3
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1.2
    min: 0.2
    max: 3
    step: 0.05
  - name: "trail"
    label: "Estela"
    type: "number"
    default: 500
    min: 50
    max: 1200
    step: 25
  - name: "kick"
    label: "Empuje puntero"
    type: "number"
    default: 3
    min: 0
    max: 10
    step: 0.5
  - name: "damp"
    label: "Fricción"
    type: "number"
    default: 0.002
    min: 0
    max: 0.05
    step: 0.001
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1.4
    min: 0.5
    max: 3
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.6
    min: 0.05
    max: 1
    step: 0.01
  - name: "fixed"
    label: "Fijar arriba"
    type: "boolean"
    default: false
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--pendulo-doble-opacity` en CSS.

```tsx
<PenduloDobleBackground size={150} speed={1.2} trail={500} />
```
