---
title: "Doble péndulo (2-3 brazos)"
description: "Simulación caótica de un péndulo doble o triple con estela; el puntero y los clics lo desestabilizan."
category: pendiente
component: "DoublePendulumBackground"
props:
  - name: "size"
    label: "Alcance (px)"
    type: "number"
    default: 620
    min: 200
    max: 1000
    step: 10
  - name: "arms"
    label: "Brazos"
    type: "number"
    default: 2
    min: 2
    max: 3
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 0.7
    min: 0.1
    max: 2
    step: 0.05
  - name: "trail"
    label: "Estela"
    type: "number"
    default: 260
    min: 20
    max: 1200
    step: 10
  - name: "push"
    label: "Empuje puntero"
    type: "number"
    default: 0.6
    min: 0
    max: 1
    step: 0.05
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 110
    min: 20
    max: 300
    step: 5
  - name: "pivot"
    label: "Pivote (0-1)"
    type: "number"
    default: 0.5
    min: 0
    max: 1
    step: 0.01
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.4
    min: 0
    max: 1
    step: 0.01
  - name: "lineWidth"
    label: "Grosor línea"
    type: "number"
    default: 1.1
    min: 0.5
    max: 3
    step: 0.1
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--double-pendulum-opacity` en CSS.

```tsx
<DoublePendulumBackground arms={2} speed={0.7} trail={260} />
```
