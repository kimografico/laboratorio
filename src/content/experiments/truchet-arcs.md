---
title: "Truchet Arcs"
description: "Azulejos Truchet con bandas anchas que giran al paso del puntero y vuelven solas."
category: pendiente
component: "TruchetArcsBackground"
props:
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 56
    min: 12
    max: 160
    step: 2
  - name: "band"
    label: "Banda"
    type: "number"
    default: 0.15
    min: 0.05
    max: 0.5
    step: 0.01
  - name: "radius"
    label: "Radio de giro (px)"
    type: "number"
    default: 130
    min: 0
    max: 400
    step: 10
  - name: "heal"
    label: "Reversión"
    type: "number"
    default: 0.96
    min: 0.8
    max: 0.999
    step: 0.005
  - name: "idle"
    label: "Giros en reposo/s"
    type: "number"
    default: 3
    min: 0
    max: 30
    step: 1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.26
    min: 0
    max: 1
    step: 0.01
  - name: "color"
    label: "Color"
    type: "color"
---

## Uso

Copia de revisión de Azulejos Truchet con valores más suaves (`size=56`, `heal=0.96`, `idle=3`). El puntero gira los azulejos que toca según la trayectoria recorrida, la petición de giro decae sola con `heal` y el dibujo va con easing a 30 fps. Hereda el color de la página o se fija con `--truchet-color` y `--truchet-opacity` en CSS.

```tsx
<TruchetArcsBackground size={56} band={0.15} radius={130} heal={0.96} idle={3} />
```
