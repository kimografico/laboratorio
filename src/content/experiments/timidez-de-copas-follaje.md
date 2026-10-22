---
title: "Timidez de copas · follaje"
description: "La misma simulación de copas que no se tocan, dibujada con ramas, bifurcaciones y follaje frondoso; el puntero es una brisa y el clic planta un árbol."
category: pendiente
component: "TimidezDeCopasFollajeBackground"
props:
  - name: "n"
    label: "Árboles"
    type: "number"
    default: 30
    min: 10
    max: 200
    step: 1
  - name: "gap"
    label: "Separación entre copas"
    type: "number"
    default: 10
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
    default: 120
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
  - name: "branches"
    label: "Ramas principales"
    type: "number"
    default: 16
    min: 4
    max: 40
    step: 1
  - name: "sub"
    label: "Ramas secundarias"
    type: "number"
    default: 6
    min: 0
    max: 16
    step: 1
  - name: "dens"
    label: "Densidad de follaje"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.05
  - name: "leaf"
    label: "Tamaño de hoja"
    type: "number"
    default: 1
    min: 0.2
    max: 3
    step: 0.05
  - name: "shade"
    label: "Sombra de copa"
    type: "number"
    default: 1
    min: 0
    max: 1
    step: 1
---

## Uso

Variante frondosa de Timidez de copas, con ramas y hojas. El puntero genera una brisa y el clic planta un árbol.

```tsx
<TimidezDeCopasFollajeBackground n={30} branches={16} dens={1} />
```
