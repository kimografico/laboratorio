---
title: "Ecualizador espejo"
description: "Barras verticales espejadas que ondulan como un ecualizador y se levantan bajo el puntero."
category: pendiente
component: "EcualizadorEspejoBackground"
props:
  - name: "gap"
    label: "Separación (px)"
    type: "number"
    default: 12
    min: 5
    max: 30
    step: 1
  - name: "ratio"
    label: "Grosor barra"
    type: "number"
    default: 0.35
    min: 0.1
    max: 0.9
    step: 0.01
  - name: "amp"
    label: "Amplitud"
    type: "number"
    default: 0.5
    min: 0.1
    max: 1
    step: 0.01
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "bump"
    label: "Joroba puntero"
    type: "number"
    default: 0.8
    min: 0
    max: 1.5
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.45
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--ecualizador-espejo-opacity` en CSS.

```tsx
<EcualizadorEspejoBackground gap={12} ratio={0.35} bump={0.8} />
```
