---
title: "Ojos"
description: "Retícula de ojos que parpadean a destiempo y siguen al puntero con la pupila."
category: pendiente
component: "OjosBackground"
props:
  - name: "step"
    label: "Paso (px)"
    type: "number"
    default: 64
    min: 30
    max: 120
    step: 2
  - name: "look"
    label: "Giro pupila"
    type: "number"
    default: 0.3
    min: 0
    max: 0.6
    step: 0.01
  - name: "blink"
    label: "Parpadeo"
    type: "number"
    default: 1
    min: 0.2
    max: 3
    step: 0.05
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1
    min: 0.5
    max: 2.5
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

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--ojos-opacity` en CSS.

```tsx
<OjosBackground step={64} look={0.3} blink={1} />
```
