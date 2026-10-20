---
title: "Interferencia de puntos"
description: "Patrón de puntos regido por la interferencia de tres focos, uno de ellos el puntero."
category: geometria
component: "InterferenciaDePuntosBackground"
props:
  - name: "step"
    label: "Paso (px)"
    type: "number"
    default: 12
    min: 8
    max: 28
    step: 1
  - name: "wave"
    label: "Longitud de onda"
    type: "number"
    default: 110
    min: 30
    max: 300
    step: 5
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1.9
    min: 0
    max: 3
    step: 0.05
  - name: "ease"
    label: "Easing"
    type: "number"
    default: 0.04
    min: 0.01
    max: 1
    step: 0.01
  - name: "size"
    label: "Tamaño"
    type: "number"
    default: 1.05
    min: 0.3
    max: 1.5
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--interferencia-de-puntos-opacity` en CSS.

```tsx
<InterferenciaDePuntosBackground step={14} wave={110} size={1} />
```
