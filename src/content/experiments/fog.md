---
title: "Fog"
description: "Vaho interactivo que se disipa con el puntero y deja gotas que resbalan."
category: backgrounds
component: FogBackground
props:
  - name: cell
    label: "Celda"
    type: number
    default: 6
    min: 2
    max: 20
    step: 1
  - name: radius
    label: "Radio de limpieza"
    type: number
    default: 70
    min: 20
    max: 160
    step: 5
  - name: regrow
    label: "Regeneración"
    type: number
    default: 0.003
    min: 0
    max: 0.02
    step: 0.001
  - name: drips
    label: "Gotas/s"
    type: number
    default: 0.5
    min: 0
    max: 3
    step: 0.1
  - name: opacity
    label: "Opacidad"
    type: number
    default: 0.85
    min: 0.1
    max: 1
    step: 0.05
  - name: color
    label: "Color del vaho"
    type: color
    default: "#f4f1ee"
  - name: background
    label: "Fondo"
    type: color
    default: "#e0dad5"
---
## Uso

El vaho se disipa alrededor del puntero y vuelve a crecer con el tiempo. `cell` controla la resolución del campo (valores más altos lo hacen más rápido y menos definido). `radius` ajusta la zona de limpieza, `regrow` la velocidad con la que se regenera, `drips` la frecuencia de gotas que resbalan dejando un rastro y `opacity` la densidad del velo.

```tsx
<FogBackground
  cell={6}
  radius={70}
  regrow={0.003}
  drips={0.5}
  opacity={0.85}
  color="#f4f1ee"
  background="#e0dad5"
/>
```
