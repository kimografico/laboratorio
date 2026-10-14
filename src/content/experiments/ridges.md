---
title: Ridges
description: Cordilleras de líneas que se elevan bajo el puntero; de colinas suaves a montañas con ruido.
category: backgrounds
component: RidgeBackground
props:
  - name: spacing
    label: Separación (px)
    type: number
    default: 18
    min: 6
    max: 60
    step: 1
  - name: lift
    label: Elevación (px)
    type: number
    default: 52
    min: 0
    max: 200
    step: 4
  - name: radius
    label: Radio (px)
    type: number
    default: 180
    min: 40
    max: 500
    step: 10
  - name: roughness
    label: Rugosidad
    type: number
    default: 0
    min: 0
    max: 1
    step: 0.05
  - name: variation
    label: Variación entre filas
    type: number
    default: 0.35
    min: 0
    max: 1
    step: 0.05
  - name: idle
    label: Ondulación ambiental
    type: number
    default: 4
    min: 0
    max: 30
    step: 1
  - name: ease
    label: Suavizado
    type: number
    default: 0.06
    min: 0.01
    max: 0.2
    step: 0.005
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.5
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.3)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`roughness={0}` da una colina suave y redonda; súbela hacia 1 para montañas aserradas. Deja `background` igual al color de fondo real para tapar las líneas de detrás.

```tsx
<RidgeBackground spacing={18} lift={52} roughness={0.6} variation={0.35} />
```
