---
title: Animated Dots
description: Rejilla de círculos que crecen bajo el puntero y revelan una imagen (o quedan en color sólido).
category: backgrounds
component: AnimatedBackground
props:
  - name: image
    label: Imagen (URL)
    type: text
    default: ""
  - name: size
    label: Separación (px)
    type: number
    default: 30
    min: 10
    max: 80
    step: 1
  - name: radius
    label: Radio base (px)
    type: number
    default: 1
    min: 0
    max: 10
    step: 0.5
  - name: proximity
    label: Influencia (px)
    type: number
    default: 125
    min: 20
    max: 400
    step: 5
  - name: growth
    label: Crecimiento (px)
    type: number
    default: 60
    min: 0
    max: 200
    step: 5
  - name: ease
    label: Suavizado
    type: number
    default: 0.075
    min: 0.02
    max: 0.2
    step: 0.005
  - name: fill
    label: Color de relleno
    type: color
    default: "#000000"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

Pasa una `image` para revelarla a través de los círculos, o deja `fill` para que se rellenen de color sólido.

```tsx
import AnimatedBackground from "@/components/backgrounds/AnimatedBackground";

<AnimatedBackground image="/hero.jpg" size={30} growth={60} fill="#000" background="#e0dad5" />
```
