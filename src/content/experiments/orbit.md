---
title: Órbitas
description: Partículas que orbitan un centro de gravedad que sigue al puntero, con estelas que se desvanecen.
category: simulacion
component: OrbitBackground
props:
  - name: count
    label: Partículas
    type: number
    default: 1000
    min: 20
    max: 1500
    step: 10
  - name: speed
    label: Velocidad
    type: number
    default: 2
    min: 0.2
    max: 4
    step: 0.1
  - name: tail
    label: Estela
    type: number
    default: 28
    min: 4
    max: 80
    step: 1
  - name: ease
    label: Suavizado
    type: number
    default: 0.02
    min: 0.005
    max: 0.2
    step: 0.005
  - name: soft
    label: Núcleo blando (px)
    type: number
    default: 60
    min: 0
    max: 300
    step: 5
  - name: attract
    label: Atracción
    type: number
    default: 1.25
    min: 0
    max: 3
    step: 0.05
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: color
    label: Color
    type: color
  - name: alpha
    label: Opacidad
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.02
---

## Uso

Cada partícula es atraída por un centro de gravedad que sigue al puntero (o que orbita solo si no hay puntero). `ease` marca qué tan pegado va ese centro: con valores bajos el centro va rezagado, arrastra con retardo y las partículas describen amplias órbitas en espiral; con valores altos casi no se separa del puntero y las órbitas se ciñen a su paso. `soft` evita que las partículas salgan disparadas al pasar muy cerca y `attract` regula la fuerza de atracción del centro.

```tsx
<OrbitBackground count={110} speed={1.1} tail={28} ease={0.04} soft={60} alpha={0.5} />
```
