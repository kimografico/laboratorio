---
title: "Día y noche"
description: "Ciclo de día y noche. Con el puntero encima, su posición horizontal elige la hora."
category: pendiente
component: "DiaYNocheBackground"
props:
  - name: "sp"
    label: "Velocidad del ciclo"
    type: "number"
    default: 0.03
    min: 0.001
    max: 0.2
    step: 0.001
  - name: "stars"
    label: "Estrellas"
    type: "number"
    default: 120
    min: 0
    max: 600
    step: 10
  - name: "hills"
    label: "Colinas"
    type: "number"
    default: 0.6
    min: 0
    max: 1.5
    step: 0.05
---

## Uso

El ciclo avanza solo; con el puntero encima, su posición horizontal elige la hora.

```tsx
<DiaYNocheBackground sp={0.03} stars={120} />
```
