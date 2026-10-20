---
title: "Anillos de árbol"
description: "Anillos concéntricos irregulares, como la corteza de un árbol, que ondulan y se apartan al pasar el puntero."
category: naturaleza
component: "AnillosDeArbolBackground"
props:
  - name: "gap"
    label: "Separación (px)"
    type: "number"
    default: 12
    min: 8
    max: 40
    step: 1
  - name: "wob"
    label: "Ondulación"
    type: "number"
    default: 1.45
    min: 0
    max: 3
    step: 0.05
  - name: "push"
    label: "Empuje (px)"
    type: "number"
    default: 30
    min: 0
    max: 80
    step: 1
  - name: "reach"
    label: "Alcance (px)"
    type: "number"
    default: 225
    min: 50
    max: 300
    step: 5
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 0.8
    min: 0.5
    max: 3
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.25
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--anillos-de-arbol-opacity` en CSS.

```tsx
<AnillosDeArbolBackground gap={16} wob={1} push={35} reach={150} />
```
