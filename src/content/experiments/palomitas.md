---
title: "Palomitas"
description: "El puntero calienta los granos del suelo; al alcanzar la temperatura saltan y se hacen palomita. Clic = explosión."
category: pendiente
component: "PalomitasBackground"
props:
  - name: "n"
    label: "Granos"
    type: "number"
    default: 260
    min: 20
    max: 1000
    step: 10
  - name: "rad"
    label: "Radio de calor (px)"
    type: "number"
    default: 110
    min: 20
    max: 400
    step: 10
  - name: "rate"
    label: "Calor"
    type: "number"
    default: 1.2
    min: 0.05
    max: 5
    step: 0.05
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 6
    min: 2
    max: 20
    step: 0.5
  - name: "gr"
    label: "Gravedad (px/s²)"
    type: "number"
    default: 1000
    min: 100
    max: 3000
    step: 50
  - name: "life"
    label: "Vida de la palomita (s)"
    type: "number"
    default: 8
    min: 1
    max: 30
    step: 0.5
---

## Uso

El puntero calienta los granos hasta que saltan; el clic provoca una explosión.

```tsx
<PalomitasBackground n={260} rate={1.2} />
```
