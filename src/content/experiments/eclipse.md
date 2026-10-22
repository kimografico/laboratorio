---
title: "Eclipse"
description: "Eclipse solar realista: el Sol brilla más por contraste al taparse, con glow blanco que vira a anaranjado en la totalidad; el limbo irregular de la Luna produce las perlas de Baily. La Luna es el puntero: pasa de azul casi blanco a negro al cubrir el Sol."
category: pendiente
component: "EclipseBackground"
props:
  - name: "sun"
    label: "Tamaño del Sol (px)"
    type: "number"
    default: 60
    min: 20
    max: 160
    step: 1
  - name: "mr"
    label: "Luna (× Sol)"
    type: "number"
    default: 1.04
    min: 0.8
    max: 1.5
    step: 0.01
  - name: "sp"
    label: "Movimiento automático"
    type: "number"
    default: 0.6
    min: 0
    max: 4
    step: 0.1
  - name: "cor"
    label: "Corona"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: "bead"
    label: "Perlas de Baily"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: "rough"
    label: "Rugosidad del limbo (%)"
    type: "number"
    default: 3
    min: 0
    max: 12
    step: 0.5
  - name: "stars"
    label: "Estrellas"
    type: "number"
    default: 120
    min: 0
    max: 600
    step: 10
---

## Uso

La Luna es el puntero: al cubrir el Sol aparecen la corona y las perlas de Baily.

```tsx
<EclipseBackground sun={60} cor={1} bead={1} />
```
