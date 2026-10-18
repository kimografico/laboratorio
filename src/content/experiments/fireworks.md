---
title: Fuegos artificiales
description: Cohetes que ascienden y estallan en lluvias de chispas con gravedad, estela y modo arcoíris.
category: backgrounds
component: FireworksBackground
props:
  - name: rate
    label: Cadencia
    type: number
    default: 1.3
    min: 0.05
    max: 3
    step: 0.05
  - name: burst
    label: Chispas
    type: number
    default: 150
    min: 10
    max: 300
    step: 5
  - name: gravity
    label: Gravedad
    type: number
    default: 90
    min: 0
    max: 500
    step: 10
  - name: drag
    label: Rozamiento
    type: number
    default: 0.99
    min: 0.9
    max: 0.999
    step: 0.001
  - name: size
    label: Tamaño (px)
    type: number
    default: 1.6
    min: 0.5
    max: 4
    step: 0.1
  - name: size
    label: Tamaño (px)
    type: number
    default: 1.6
    min: 0.5
    max: 4
    step: 0.1
  - name: rainbow
    label: Arcoíris
    type: boolean
    default: false
  - name: color
    label: Color
    type: color
---

## Uso

Cohetes que suben con estela y estallan en `burst` chispas; `gravity` y `drag` definen su caída y `life` su desvanecido. Con `rainbow` cada explosión usa un tonos suaves (rojo, naranja, amarillo, verde, azul, violeta).

```tsx
<FireworksBackground rate={1.5} burst={150} gravity={90} drag={0.999} size={1.5} color="#fff1dc" />
```
