---
title: "Timidez de copas"
description: "Vista cenital del dosel: las copas crecen hasta casi tocarse y dejan canales de cielo entre ellas; el puntero es una brisa y el clic planta un árbol."
category: pendiente
component: "TimidezDeCopasBackground"
props:
  - name: "n"
    label: "Árboles"
    type: "number"
    default: 70
    min: 10
    max: 200
    step: 1
  - name: "gap"
    label: "Separación entre copas"
    type: "number"
    default: 9
    min: 0
    max: 40
    step: 1
  - name: "grow"
    label: "Crecimiento"
    type: "number"
    default: 40
    min: 5
    max: 150
    step: 1
  - name: "rays"
    label: "Resolución de copa"
    type: "number"
    default: 160
    min: 40
    max: 360
    step: 5
  - name: "maxr"
    label: "Radio máximo"
    type: "number"
    default: 160
    min: 40
    max: 400
    step: 5
  - name: "sway"
    label: "Balanceo (px)"
    type: "number"
    default: 8
    min: 0
    max: 40
    step: 0.5
  - name: "gust"
    label: "Fuerza de la brisa"
    type: "number"
    default: 1
    min: 0
    max: 4
    step: 0.05
  - name: "rad"
    label: "Radio de la brisa"
    type: "number"
    default: 220
    min: 20
    max: 600
    step: 10
  - name: "amb"
    label: "Brisa ambiental"
    type: "number"
    default: 0.35
    min: 0
    max: 2
    step: 0.05
---

## Uso

Copas que crecen sin tocarse. El puntero genera una brisa y el clic planta un árbol.

```tsx
<TimidezDeCopasBackground n={70} gap={9} grow={40} />
```
