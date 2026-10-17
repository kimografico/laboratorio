---
title: Burbujas
description: Burbujas que ascienden con vaivén, se apartan del puntero y reventón al tocarlas.
category: pendiente
component: BubbleBackground
props:
  - name: count
    label: Número de burbujas
    type: number
    default: 70
    min: 0
    max: 80
    step: 1
  - name: size
    label: Radio medio (px)
    type: number
    default: 28
    min: 4
    max: 80
    step: 1
  - name: rise
    label: Ascenso
    type: number
    default: 0.75
    min: 0
    max: 2
    step: 0.05
  - name: reach
    label: Alcance del puntero (px)
    type: number
    default: 60
    min: 0
    max: 200
    step: 5
  - name: pop
    label: Reventar al tocar
    type: boolean
    default: true
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor de línea
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

`count` reparte las burbujas, `size` fija su radio medio (cada una varía entre 0.3x y 1.6x) y `rise` su velocidad de ascenso, siendo las grandes las que suben más rápido. El puntero las empuja dentro de `reach` y, con `pop` activado, las revienta al tocarlas dejando un aro con gotitas; `alpha` y `lineWidth` controlan el contorno.

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`). Opcionalmente fija `color` o define `--bubble-color` y `--bubble-opacity` en CSS.

```tsx
<BubbleBackground count={70} size={28} rise={0.75} reach={60} pop={true} alpha={0.3} lineWidth={1.2} />
```
