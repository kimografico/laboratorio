---
title: "Rejilla synthwave"
description: "Rejilla en perspectiva con horizonte y sol que se desplaza con el puntero."
category: simulacion
component: "RejillaSynthwaveBackground"
props:
  - name: "cols"
    label: "Columnas"
    type: "number"
    default: 12
    min: 4
    max: 24
    step: 1
  - name: "rows"
    label: "Filas"
    type: "number"
    default: 14
    min: 4
    max: 30
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: -2
    max: 3
    step: 0.05
  - name: "hor"
    label: "Horizonte"
    type: "number"
    default: 0.55
    min: 0.3
    max: 0.8
    step: 0.01
  - name: "sun"
    label: "Sol (px)"
    type: "number"
    default: 120
    min: 0
    max: 300
    step: 5
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--rejilla-synthwave-opacity` en CSS.

```tsx
<RejillaSynthwaveBackground cols={12} rows={14} sun={120} />
```
