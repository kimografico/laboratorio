---
title: "Cerradura de arcos"
description: "Anillos de arcos que giran a distinta velocidad y se aceleran al acercar el puntero."
category: pendiente
component: "CerraduraDeArcosBackground"
props:
  - name: "rings"
    label: "Anillos"
    type: "number"
    default: 16
    min: 4
    max: 30
    step: 1
  - name: "gap"
    label: "Separación (px)"
    type: "number"
    default: 22
    min: 8
    max: 40
    step: 1
  - name: "thick"
    label: "Grosor"
    type: "number"
    default: 0.45
    min: 0.1
    max: 0.9
    step: 0.01
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 0.5
    min: 0
    max: 2
    step: 0.05
  - name: "boost"
    label: "Impulso puntero"
    type: "number"
    default: 3
    min: 0
    max: 6
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.4
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--cerradura-de-arcos-opacity` en CSS.

```tsx
<CerraduraDeArcosBackground rings={16} gap={22} boost={3} />
```
