---
title: "Estrellas fugaces"
description: "Cielo con estrellas parpadeantes. Clic = lanzas una; el ratón también las provoca."
category: pendiente
component: "EstrellasFugacesBackground"
props:
  - name: "rate"
    label: "Frecuencia"
    type: "number"
    default: 1.2
    min: 0
    max: 10
    step: 0.1
  - name: "sp"
    label: "Velocidad (px/s)"
    type: "number"
    default: 700
    min: 100
    max: 2000
    step: 10
  - name: "tail"
    label: "Cola (px)"
    type: "number"
    default: 180
    min: 20
    max: 600
    step: 10
  - name: "ang"
    label: "Ángulo"
    type: "number"
    default: 0.5
    min: 0
    max: 1.5
    step: 0.01
  - name: "st"
    label: "Estrellas fijas"
    type: "number"
    default: 150
    min: 0
    max: 600
    step: 10
---

## Uso

El clic lanza una estrella fugaz; mover el ratón también las provoca.

```tsx
<EstrellasFugacesBackground rate={1.2} st={150} />
```
