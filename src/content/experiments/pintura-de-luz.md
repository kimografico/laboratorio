---
title: "Pintura de luz"
description: "El puntero pinta con luz que se desvanece. Clic = cambia de color."
category: pendiente
component: "PinturaDeLuzBackground"
props:
  - name: "life"
    label: "Duración (s)"
    type: "number"
    default: 2.5
    min: 0.2
    max: 10
    step: 0.1
  - name: "w"
    label: "Grosor"
    type: "number"
    default: 5
    min: 0.5
    max: 30
    step: 0.5
  - name: "glow"
    label: "Brillo"
    type: "number"
    default: 0.5
    min: 0
    max: 2
    step: 0.05
  - name: "hue"
    label: "Matiz inicial"
    type: "number"
    default: 200
    min: 0
    max: 360
    step: 1
  - name: "sp"
    label: "Cambio de matiz"
    type: "number"
    default: 60
    min: 0
    max: 360
    step: 5
---

## Uso

El puntero pinta con luz que se desvanece; el clic cambia de color.

```tsx
<PinturaDeLuzBackground life={2.5} glow={0.5} />
```
