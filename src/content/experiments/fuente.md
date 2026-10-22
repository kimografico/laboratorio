---
title: "Fuente"
description: "Chorros de agua con gravedad. El puntero mueve la fuente de lado a lado."
category: pendiente
component: "FuenteBackground"
props:
  - name: "jets"
    label: "Chorros"
    type: "number"
    default: 5
    min: 1
    max: 15
    step: 1
  - name: "rate"
    label: "Gotas por segundo"
    type: "number"
    default: 900
    min: 50
    max: 3000
    step: 50
  - name: "pw"
    label: "Potencia"
    type: "number"
    default: 720
    min: 100
    max: 2000
    step: 10
  - name: "gr"
    label: "Gravedad (px/s²)"
    type: "number"
    default: 1000
    min: 100
    max: 3000
    step: 50
  - name: "spr"
    label: "Dispersión"
    type: "number"
    default: 0.12
    min: 0
    max: 0.6
    step: 0.01
  - name: "size"
    label: "Tamaño de gota"
    type: "number"
    default: 2.2
    min: 0.5
    max: 8
    step: 0.1
---

## Uso

Los chorros de agua caen con gravedad y el puntero mueve la fuente de lado a lado.

```tsx
<FuenteBackground jets={5} rate={900} />
```
