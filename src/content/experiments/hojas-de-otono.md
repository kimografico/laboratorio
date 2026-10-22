---
title: "Hojas de otoño"
description: "Hojas que caen balanceándose. El movimiento del puntero genera viento."
category: pendiente
component: "HojasDeOtonoBackground"
props:
  - name: "n"
    label: "Hojas"
    type: "number"
    default: 60
    min: 5
    max: 300
    step: 5
  - name: "gr"
    label: "Caída"
    type: "number"
    default: 60
    min: 5
    max: 300
    step: 5
  - name: "sway"
    label: "Balanceo"
    type: "number"
    default: 1.2
    min: 0
    max: 5
    step: 0.1
  - name: "wind"
    label: "Viento del ratón"
    type: "number"
    default: 1.2
    min: 0
    max: 5
    step: 0.1
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 14
    min: 4
    max: 40
    step: 1
---

## Uso

Las hojas caen balanceándose y el movimiento del puntero genera viento.

```tsx
<HojasDeOtonoBackground n={60} wind={1.2} />
```
