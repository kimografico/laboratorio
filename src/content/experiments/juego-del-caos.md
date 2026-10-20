---
title: "Juego del caos"
description: "Miles de puntos generados por el juego del caos que forman un fractal y se desvían hacia el puntero."
category: pendiente
component: "JuegoDelCaosBackground"
props:
  - name: "n"
    label: "Vértices"
    type: "number"
    default: 3
    min: 3
    max: 8
    step: 1
  - name: "ratio"
    label: "Razón"
    type: "number"
    default: 0.5
    min: 0.3
    max: 0.8
    step: 0.01
  - name: "pf"
    label: "Puntos/fotograma"
    type: "number"
    default: 400
    min: 50
    max: 1500
    step: 10
  - name: "mouse"
    label: "Peso puntero"
    type: "number"
    default: 0.12
    min: 0
    max: 0.5
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

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--juego-del-caos-opacity` en CSS.

```tsx
<JuegoDelCaosBackground n={3} ratio={0.5} pf={400} />
```
