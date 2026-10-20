---
title: "Toro de puntos"
description: "Toro de puntos en 3D que gira e inclina con el puntero."
category: pendiente
component: "ToroDePuntosBackground"
props:
  - name: "nu"
    label: "Puntos mayor"
    type: "number"
    default: 64
    min: 20
    max: 120
    step: 2
  - name: "nv"
    label: "Puntos menor"
    type: "number"
    default: 22
    min: 8
    max: 40
    step: 1
  - name: "r"
    label: "Radio tubo"
    type: "number"
    default: 0.35
    min: 0.15
    max: 0.6
    step: 0.01
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 230
    min: 80
    max: 400
    step: 5
  - name: "dot"
    label: "Punto (px)"
    type: "number"
    default: 1.3
    min: 0.5
    max: 3
    step: 0.1
  - name: "spin"
    label: "Giro"
    type: "number"
    default: 0.5
    min: 0
    max: 2
    step: 0.05
  - name: "tilt"
    label: "Inclinación"
    type: "number"
    default: 1
    min: 0
    max: 2
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.7
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--toro-de-puntos-opacity` en CSS.

```tsx
<ToroDePuntosBackground nu={64} nv={22} r={0.35} />
```
