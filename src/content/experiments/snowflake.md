---
title: Copos de nieve
description: Cristales de hielo que crecen rama a rama, se sostienen, se desvanecen y vuelven a formarse.
category: naturaleza
component: SnowflakeBackground
props:
  - name: count
    label: Copos
    type: number
    default: 3
    min: 1
    max: 6
    step: 1
  - name: size
    label: Radio (px)
    type: number
    default: 200
    min: 20
    max: 300
    step: 5
  - name: growth
    label: Crecimiento
    type: number
    default: 2.5
    min: 0.1
    max: 3
    step: 0.05
  - name: branch
    label: Ramificación
    type: number
    default: 0.6
    min: 0.05
    max: 1
    step: 0.05
  - name: width
    label: Grosor (px)
    type: number
    default: 1.2
    min: 0.5
    max: 3
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.5
    min: 0.05
    max: 1
    step: 0.05
---

## Uso

Cada copo crece desde el centro extendiendo brazos con simetría hexagonal; `branch` decide cuántas ramas laterales aparecen, `growth` la velocidad (el puntero cerca la acelera) y tras sostenerse se desvanece para renacer en otro punto. Hereda el color de la página o se fija con `--snow-color` y `--snow-opacity` en CSS.

```tsx
<SnowflakeBackground count={3} size={200} growth={2.5} branch={0.6} width={1.2} alpha={0.5} />
```
