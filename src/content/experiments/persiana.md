---
title: "Persiana"
description: "Lamas horizontales que se abren y giran como una persiana al pasar el puntero."
category: pendiente
component: "PersianaBackground"
props:
  - name: "gap"
    label: "Lama (px)"
    type: "number"
    default: 8
    min: 8
    max: 30
    step: 1
  - name: "seg"
    label: "Segmento (px)"
    type: "number"
    default: 23
    min: 4
    max: 24
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 0.8
    min: 0
    max: 3
    step: 0.05
  - name: "reach"
    label: "Alcance (px)"
    type: "number"
    default: 170
    min: 50
    max: 400
    step: 5
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.35
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--persiana-opacity` en CSS.

```tsx
<PersianaBackground gap={8} seg={23} reach={170} />
```
