---
title: "Mapa de calor"
description: "El puntero deja calor que se difunde y se enfría. Paleta térmica."
category: pendiente
component: "MapaDeCalorBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 10
    min: 3
    max: 40
    step: 1
  - name: "dif"
    label: "Difusión"
    type: "number"
    default: 0.12
    min: 0
    max: 0.25
    step: 0.01
  - name: "dec"
    label: "Enfriamiento"
    type: "number"
    default: 0.985
    min: 0.9
    max: 1
    step: 0.001
  - name: "str"
    label: "Calor"
    type: "number"
    default: 0.15
    min: 0.01
    max: 1
    step: 0.01
  - name: "rad"
    label: "Radio del puntero"
    type: "number"
    default: 3.5
    min: 1
    max: 20
    step: 0.1
---

## Uso

El puntero deja calor que se difunde y se enfría con paleta térmica.

```tsx
<MapaDeCalorBackground cell={10} rad={3.5} />
```
