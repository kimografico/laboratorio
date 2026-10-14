---
title: Dot Spring
description: "Malla de puntos con muelles: el puntero los repele y vuelven a su sitio con rebote."
category: backgrounds
component: DotBackground
accent: "#000000"
props:
  - name: size
    label: Separación (px)
    type: number
    default: 28
    min: 12
    max: 80
    step: 1
  - name: radius
    label: Radio base (px)
    type: number
    default: 1.5
    min: 0.5
    max: 8
    step: 0.5
  - name: proximity
    label: Influencia (px)
    type: number
    default: 160
    min: 40
    max: 400
    step: 5
  - name: push
    label: Empuje (px)
    type: number
    default: 22
    min: 0
    max: 80
    step: 1
  - name: stiffness
    label: Rigidez
    type: number
    default: 0.04
    min: 0.005
    max: 0.2
    step: 0.005
  - name: damping
    label: Amortiguación
    type: number
    default: 0.85
    min: 0.5
    max: 0.99
    step: 0.01
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.2)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`stiffness` controla la velocidad de retorno y `damping` el rebote: cerca de 0.99 rebota mucho.

```tsx
<DotBackground size={28} push={22} stiffness={0.04} damping={0.85} />
```
