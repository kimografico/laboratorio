---
title: "Moscas"
description: "Moscas en vuelo errático que orbitan alrededor del puntero. Clic = manotazo: salen disparadas."
category: pendiente
component: "MoscasBackground"
props:
  - name: "n"
    label: "Moscas"
    type: "number"
    default: 22
    min: 1
    max: 120
    step: 1
  - name: "erra"
    label: "Erratismo"
    type: "number"
    default: 1.2
    min: 0
    max: 4
    step: 0.1
  - name: "att"
    label: "Atracción"
    type: "number"
    default: 0.8
    min: 0
    max: 3
    step: 0.05
  - name: "max"
    label: "Velocidad máx."
    type: "number"
    default: 320
    min: 50
    max: 1000
    step: 10
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 3.5
    min: 1
    max: 10
    step: 0.5
---

## Uso

Las moscas orbitan al puntero; el clic las espanta de un manotazo.

```tsx
<MoscasBackground n={22} att={0.8} />
```
