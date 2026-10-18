---
title: Plasma
description: Rayos eléctricos que salen del puntero, zigzaguean y parpadean hacia el borde.
category: backgrounds
component: PlasmaBackground
props:
  - name: lines
    label: Rayos
    type: number
    default: 22
    min: 4
    max: 25
    step: 1
  - name: poles
    label: Polos
    type: number
    default: 90
    min: 4
    max: 120
    step: 1
  - name: points
    label: Puntos invisibles
    type: number
    default: 0
    min: 0
    max: 20
    step: 1
  - name: strength
    label: Fuerza de desvío
    type: number
    default: 2.5
    min: 0
    max: 3
    step: 0.1
  - name: dropout
    label: Parpadeo
    type: number
    default: 0.75
    min: 0
    max: 0.8
    step: 0.05
  - name: flicker
    label: Velocidad parpadeo
    type: number
    default: 4
    min: 0
    max: 5
    step: 0.1
  - name: jag
    label: Zigzag (px)
    type: number
    default: 12
    min: 0
    max: 30
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1.5
    min: 0
    max: 3
    step: 0.1
  - name: core
    label: Núcleo
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: spin
    label: Giro
    type: number
    default: 0.4
    min: 0
    max: 1
    step: 0.01
  - name: alpha
    label: Opacidad
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.02
  - name: color
    label: Color
    type: color
  - name: charged
    label: "Cristal cargado"
    type: boolean
    default: true
---

## Uso

Cada rayo se integra sobre el campo de una carga +1 en el puntero y `poles` cargas negativas repartidas por el perímetro; después se le añade zigzag con ruido y tres pasadas de trazo (halo y núcleo). `dropout` apaga y enciende rayos al instante, sin desvanecido, y `flicker` decide cuántas veces por segundo lo hacen; `points` introduce puntos invisibles que desvían el campo. `core` escala el núcleo luminoso del puntero, que late con el movimiento del ratón. Con "Cristal cargado" activo, cerca del borde aparecen hasta `lines` rayos, todo va más rápido y el núcleo crece; en el centro solo quedan 2, se ralentizan, se atenúan y el núcleo encoge.

```tsx
<PlasmaBackground lines={15} jag={12} dropout={0.9} speed={2.5} spin={0.06} alpha={0.7} charged />
```
