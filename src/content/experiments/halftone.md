---
title: "Halftone"
description: "Retícula de puntos de semitono cuyo tamaño dibuja ondas y una lupa bajo el puntero."
category: pendiente
component: "HalftoneBackground"
props:
  - name: "step"
    label: "Paso (px)"
    type: "number"
    default: 14
    min: 8
    max: 30
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "contrast"
    label: "Contraste"
    type: "number"
    default: 1.4
    min: 0.5
    max: 3
    step: 0.05
  - name: "lens"
    label: "Radio lupa (px)"
    type: "number"
    default: 160
    min: 40
    max: 400
    step: 5
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.4
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--halftone-opacity` en CSS.

```tsx
<HalftoneBackground step={14} contrast={1.4} lens={160} />
```
