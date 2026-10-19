---
title: Órbitas elásticas
description: Elipses que siguen al puntero con retardo progresivo; cada planeta se queda atrás cuanto más lejana es su órbita.
category: simulacion
component: PlanetsOrbitsBackground
props:
  - name: orbits
    label: Órbitas
    type: number
    default: 8
    min: 1
    max: 20
    step: 1
  - name: minRadius
    label: Radio inicial (px)
    type: number
    default: 75
    min: 10
    max: 200
    step: 5
  - name: gap
    label: Separación (px)
    type: number
    default: 80
    min: 10
    max: 120
    step: 2
  - name: eccentricity
    label: Excentricidad
    type: number
    default: 0.6
    min: 0
    max: 0.8
    step: 0.05
  - name: lag
    label: Retardo
    type: number
    default: 2
    min: 0
    max: 3
    step: 0.05
  - name: stiffness
    label: Rigidez
    type: number
    default: 0.01
    min: 0.005
    max: 0.2
    step: 0.005
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
  - name: alpha
    label: Opacidad
    type: number
    default: 0.18
    min: 0
    max: 1
    step: 0.02
  - name: planetColor
    label: Planetas
    type: color
    default: "rgba(0, 0, 0, 0.7)"
---

## Uso

Las órbitas son elipses rigidas que persiguen al Sol (el puntero) con muelle y amortiguación: `stiffness` fija la fuerza base y `lag` hace que las lejanas reaccionen tarde, así se estiran y ondulan al moverse. La posición del planeta en su elipse resuelve la ecuación de Kepler.

```tsx
<PlanetsOrbitsBackground orbits={7} lag={0.6} stiffness={0.03} speed={1} planet={3.5} alpha={0.18} />
```
