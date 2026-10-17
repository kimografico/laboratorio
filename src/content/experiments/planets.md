---
title: Planetas
description: Planetas en órbita kepleriana alrededor del cursor, perturbados por su gravedad y asidos a su elipse preferida.
category: pendiente
component: PlanetsBackground
props:
  - name: orbits
    label: Planetas
    type: number
    default: 7
    min: 1
    max: 20
    step: 1
  - name: gap
    label: Separación (px)
    type: number
    default: 42
    min: 10
    max: 120
    step: 2
  - name: eccentricity
    label: Excentricidad
    type: number
    default: 0.35
    min: 0
    max: 0.7
    step: 0.05
  - name: gravity
    label: Gravedad
    type: number
    default: 300
    min: 50
    max: 1000
    step: 10
  - name: grip
    label: Agarre
    type: number
    default: 0.06
    min: 0
    max: 0.3
    step: 0.01
  - name: speed
    label: Velocidad del tiempo
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: planet
    label: Radio (px)
    type: number
    default: 3.5
    min: 1
    max: 12
    step: 0.5
  - name: color
    label: Órbitas
    type: color
    default: "rgba(0, 0, 0, 0.18)"
  - name: planetColor
    label: Planetas
    type: color
    default: "rgba(0, 0, 0, 0.7)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

El cursor actúa como el Sol: los planetas se integran con la gravedad que ejerce sobre ellos (`gravity`) y dibujan la elipse osculadora que seguirían ahora mismo. `grip` devuelve cada uno a la energía y el momento angular de su órbita preferida y, si se aleja demasiado, una correa elástica lo trae de vuelta.

```tsx
<PlanetsBackground orbits={7} gravity={300} grip={0.06} speed={1} planet={3.5} />
```
