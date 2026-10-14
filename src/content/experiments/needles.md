---
title: Needles
description: Agujas que apuntan hacia el puntero y se alargan al acercarse, con giro suave.
category: backgrounds
component: NeedleBackground
props:
  - name: size
    label: Separación (px)
    type: number
    default: 32
    min: 12
    max: 80
    step: 1
  - name: length
    label: Longitud (px)
    type: number
    default: 10
    min: 2
    max: 40
    step: 1
  - name: growth
    label: Alargamiento (px)
    type: number
    default: 8
    min: 0
    max: 40
    step: 1
  - name: proximity
    label: Influencia (px)
    type: number
    default: 220
    min: 40
    max: 500
    step: 5
  - name: ease
    label: Suavizado
    type: number
    default: 0.06
    min: 0.01
    max: 0.2
    step: 0.005
  - name: restAngle
    label: Ángulo de reposo (º)
    type: number
    default: 45
    min: 0
    max: 180
    step: 5
  - name: lineWidth
    label: Grosor
    type: number
    default: 1.5
    min: 0.5
    max: 5
    step: 0.5
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.18)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`restAngle` es la orientación en reposo; cerca del puntero cada aguja rota hacia él mezclando el ángulo.

```tsx
<NeedleBackground size={32} length={10} restAngle={45} proximity={220} />
```
