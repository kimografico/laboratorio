---
title: "Cortinas"
description: "Una cortina de telas que se abre al pasar el puntero y ondea."
category: pendiente
component: "CortinasBackground"
props:
  - name: "n"
    label: "Pliegues"
    type: "number"
    default: 50
    min: 5
    max: 200
    step: 5
  - name: "open"
    label: "Apertura (px)"
    type: "number"
    default: 140
    min: 0
    max: 500
    step: 10
  - name: "rad"
    label: "Alcance del puntero (px)"
    type: "number"
    default: 200
    min: 20
    max: 600
    step: 10
  - name: "sw"
    label: "Ondulación"
    type: "number"
    default: 8
    min: 0
    max: 40
    step: 1
---

## Uso

La cortina se abre al pasar el puntero y vuelve a cerrarse con una ondulación.

```tsx
<CortinasBackground n={50} open={140} />
```
