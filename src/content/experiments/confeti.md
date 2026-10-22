---
title: "Confeti"
description: "Clic = estallido. Con \"Automático\" cae confeti solo."
category: pendiente
component: "ConfetiBackground"
props:
  - name: "n"
    label: "Piezas"
    type: "number"
    default: 120
    min: 10
    max: 600
    step: 10
  - name: "gr"
    label: "Gravedad (px/s²)"
    type: "number"
    default: 380
    min: 50
    max: 1500
    step: 10
  - name: "pw"
    label: "Fuerza del clic"
    type: "number"
    default: 800
    min: 100
    max: 2000
    step: 50
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 7
    min: 1
    max: 20
    step: 0.5
  - name: "auto"
    label: "Automático por segundo"
    type: "number"
    default: 2
    min: 0
    max: 10
    step: 0.1
---

## Uso

El clic provoca un estallido de confeti; con `auto` cae confeti solo.

```tsx
<ConfetiBackground n={120} auto={2} />
```
