---
title: "Molinillos"
description: "Molinillos de viento: el movimiento del puntero los hace girar."
category: pendiente
component: "MolinillosBackground"
props:
  - name: "cell"
    label: "Tamaño (px)"
    type: "number"
    default: 64
    min: 20
    max: 160
    step: 4
  - name: "rad"
    label: "Alcance del puntero (px)"
    type: "number"
    default: 170
    min: 0
    max: 500
    step: 10
  - name: "gain"
    label: "Viento"
    type: "number"
    default: 1
    min: 0
    max: 4
    step: 0.1
  - name: "fric"
    label: "Fricción"
    type: "number"
    default: 0.985
    min: 0.9
    max: 0.999
    step: 0.001
  - name: "blades"
    label: "Aspas"
    type: "number"
    default: 4
    min: 2
    max: 10
    step: 1
---

## Uso

El movimiento del puntero hace girar los molinillos de viento.

```tsx
<MolinillosBackground cell={64} blades={4} />
```
