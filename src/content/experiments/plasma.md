---
title: Plasma
description: Rayos eléctricos que salen del puntero, zigzaguean, se ramifican y parpadean hacia el borde.
category: pendiente
component: PlasmaBackground
props:
  - name: lines
    label: Rayos
    type: number
    default: 26
    min: 4
    max: 60
    step: 1
  - name: poles
    label: Polos
    type: number
    default: 48
    min: 4
    max: 120
    step: 1
  - name: points
    label: Puntos invisibles
    type: number
    default: 8
    min: 0
    max: 20
    step: 1
  - name: strength
    label: Fuerza de desvío
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: dropout
    label: Parpadeo
    type: number
    default: 0.35
    min: 0
    max: 0.9
    step: 0.05
  - name: jag
    label: Zigzag (px)
    type: number
    default: 8
    min: 0
    max: 30
    step: 1
  - name: branch
    label: Ramificación
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.05
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: spin
    label: Giro
    type: number
    default: 0.00006
    min: 0
    max: 0.0005
    step: 0.00001
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

Cada rayo se integra sobre el campo de una carga +1 en el puntero y `poles` cargas negativas repartidas por el perímetro; después se le añade zigzag con ruido, ramificaciones y tres pasadas de trazo (halo y núcleo). `dropout` apaga y enciende rayos, y `points` introduce puntos invisibles que desvían el campo.

```tsx
<PlasmaBackground lines={26} jag={8} branch={0.5} dropout={0.35} speed={1} alpha={0.5} />
```
