---
title: "Truchet Tiles"
description: "Azulejos Truchet que giran 90° con easing al paso del puntero."
category: pendiente
component: "TruchetTilesBackground"
props:
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 40
    min: 8
    max: 120
    step: 1
  - name: "proximity"
    label: "Proximidad (px)"
    type: "number"
    default: 130
    min: 0
    max: 400
    step: 10
  - name: "ease"
    label: "Suavizado"
    type: "number"
    default: 0.12
    min: 0.01
    max: 0.5
    step: 0.01
  - name: "spin"
    label: "Velocidad de giro (°/s)"
    type: "number"
    default: 360
    min: 60
    max: 1800
    step: 30
  - name: "cooldown"
    label: "Enfriamiento (ms)"
    type: "number"
    default: 600
    min: 0
    max: 3000
    step: 50
  - name: "idle"
    label: "Giros en reposo/s"
    type: "number"
    default: 2
    min: 0
    max: 20
    step: 1
  - name: "lineWidth"
    label: "Grosor de línea"
    type: "number"
    default: 1.5
    min: 0.5
    max: 6
    step: 0.1
  - name: "color"
    label: "Color"
    type: "color"
    default: "rgba(0, 0, 0, 0.22)"
  - name: "background"
    label: "Fondo"
    type: "color"
    default: "#e0dad5"
---

## Uso

Cada baldosa dibuja dos arcos de esquinas opuestas y gira 90° con easing (`ease`) cuando el puntero pasa a menos de `proximity`; tras girar espera `cooldown` ms antes de poder girar otra vez. `idle` mantiene el patrón vivo sin ratón.

```tsx
<TruchetTilesBackground size={40} proximity={130} ease={0.12} idle={2} />
```
