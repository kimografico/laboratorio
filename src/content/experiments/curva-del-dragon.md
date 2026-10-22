---
title: "Curva del dragón"
description: "Curva fractal que se despliega progresivamente y gira con el puntero."
category: matematica
component: "CurvaDelDragonBackground"
props:
  - name: "lv"
    label: "Iteraciones"
    type: "number"
    default: 13
    min: 6
    max: 15
    step: 1
  - name: "speed"
    label: "Despliegue"
    type: "number"
    default: 0.6
    min: 0
    max: 3
    step: 0.05
  - name: "mouse"
    label: "Giro puntero"
    type: "number"
    default: 1
    min: 0
    max: 2
    step: 0.05
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 0.8
    min: 0.4
    max: 2.5
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.55
    min: 0.05
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--curva-del-dragon-opacity` en CSS.

```tsx
<CurvaDelDragonBackground lv={13} speed={0.6} mouse={1} />
```
