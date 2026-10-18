---
title: Dot Spring
description: "Malla de puntos con muelles: el puntero los repele y vuelven a su sitio con rebote."
category: backgrounds
component: DotBackground
props:
  - name: size
    label: Separación (px)
    type: number
    default: 18
    min: 12
    max: 80
    step: 1
  - name: radius
    label: Radio base (px)
    type: number
    default: 1
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
    default: 30
    min: 0
    max: 80
    step: 1
  - name: stiffness
    label: Rigidez
    type: number
    default: 0.05
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
  - name: alpha
    label: Opacidad
    type: number
    default: 0.2
    min: 0
    max: 1
    step: 0.02
---

## Uso

`stiffness` controla la velocidad de retorno y `damping` el rebote: cerca de 0.99 rebota mucho.

```tsx
<DotBackground size={18} radius={1} proximity={160} push={30} stiffness={0.05} damping={0.85} alpha={0.2} />
```
