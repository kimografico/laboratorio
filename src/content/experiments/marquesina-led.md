---
title: "Marquesina LED"
description: "Letrero de puntos con texto que se desplaza. El puntero ilumina los puntos cercanos."
category: pendiente
component: "MarquesinaLEDBackground"
props:
  - name: "cell"
    label: "Tamaño del punto (px)"
    type: "number"
    default: 12
    min: 5
    max: 30
    step: 1
  - name: "rows"
    label: "Filas"
    type: "number"
    default: 9
    min: 3
    max: 20
    step: 1
  - name: "sp"
    label: "Velocidad"
    type: "number"
    default: 14
    min: 1
    max: 100
    step: 1
  - name: "rad"
    label: "Brillo del puntero (px)"
    type: "number"
    default: 90
    min: 0
    max: 300
    step: 10
---

## Uso

Un letrero de puntos con texto desplazándose; el puntero ilumina los puntos cercanos.

```tsx
<MarquesinaLEDBackground cell={12} rows={9} />
```
