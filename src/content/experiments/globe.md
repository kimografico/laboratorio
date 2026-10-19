---
title: Globo
description: Esfera de alambre en wireframe que gira sola y se abomba hacia el puntero.
category: geometria
component: GlobeBackground
props:
  - name: lat
    label: Paralelos
    type: number
    default: 12
    min: 4
    max: 40
    step: 1
  - name: lon
    label: Meridianos
    type: number
    default: 24
    min: 6
    max: 60
    step: 1
  - name: size
    label: Tamaño
    type: number
    default: 0.7
    min: 0.2
    max: 0.9
    step: 0.01
  - name: bump
    label: Bulto
    type: number
    default: 0.35
    min: 0
    max: 1
    step: 0.01
  - name: spread
    label: Anchura del bulto
    type: number
    default: 0.4
    min: 0.05
    max: 1.5
    step: 0.05
  - name: spin
    label: Giro
    type: number
    default: 0.00025
    min: 0
    max: 0.0005
    step: 0.00001
  - name: ease
    label: Suavizado
    type: number
    default: 0.2
    min: 0.01
    max: 0.4
    step: 0.01
  - name: lineWidth
    label: Grosor de línea
    type: number
    default: 0.5
    min: 0.2
    max: 5
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

La esfera se inclina siguiendo al puntero y, bajo el cursor, los segmentos se abomban hacia fuera (`bump`, con la anchura `spread`). Ajusta `lat`/`lon` para la densidad de la malla, `spin` para el giro continuo y `ease` para el suavizado del seguimiento.

```tsx
<GlobeBackground lat={14} lon={24} size={0.84} bump={0.35} spin={0.00008} alpha={0.5} />
```
