---
title: "Montón de arena"
description: "Montón de arena (modelo de ablación) con avalanchas bajo el puntero."
category: backgrounds
component: "SandpileBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 5
    min: 3
    max: 30
    step: 1
  - name: "rate"
    label: "Granos del puntero"
    type: "number"
    default: 12
    min: 0
    max: 40
    step: 1
  - name: "sweeps"
    label: "Pasadas de derrumbe"
    type: "number"
    default: 1
    min: 1
    max: 16
    step: 1
  - name: "ambient"
    label: "Granos solos/s"
    type: "number"
    default: 15
    min: 0
    max: 80
    step: 1
  - name: "erode"
    label: "Erosión (granos/s)"
    type: "number"
    default: 90
    min: 0
    max: 200
    step: 1
  - name: "flash"
    label: "Avalanchas"
    type: "color"
    default: "#96701d"
  - name: "color"
    label: "Arena"
    type: "color"
    default: "rgba(0, 0, 0, 0.5)"
  - name: "background"
    label: "Fondo"
    type: "color"
    default: "#e0dad5"
---

## Uso

Autómata de montón de arena: con 4 o más granos una celda se derrumba y reparte uno a cada vecino (`sweeps` pasadas por fotograma). El puntero deja caer granos a `rate` y `erode` mantiene el sistema vivo; las celdas que acaban de derrumbarse brillan en color `flash`.

```tsx
<SandpileBackground cell={8} rate={6} sweeps={4} erode={30} />
```
