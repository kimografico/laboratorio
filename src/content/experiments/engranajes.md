---
title: "Engranajes"
description: "Rejilla de engranajes alternos que giran y cambian de velocidad con el puntero."
category: pendiente
component: "EngranajesBackground"
props:
  - name: "step"
    label: "Tamaño (px)"
    type: "number"
    default: 44
    min: 40
    max: 140
    step: 2
  - name: "sep"
    label: "Separación (px)"
    type: "number"
    default: 0
    min: 0
    max: 60
    step: 1
  - name: "teeth"
    label: "Dientes"
    type: "number"
    default: 8
    min: 6
    max: 24
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "ctrl"
    label: "Control puntero"
    type: "number"
    default: 1.5
    min: 0
    max: 2
    step: 0.05
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 0.7
    min: 0.5
    max: 3
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--engranajes-opacity` en CSS.

```tsx
<EngranajesBackground step={76} teeth={12} ctrl={1.2} />
```
