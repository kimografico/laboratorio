---
title: Arena
description: Líneas de arena onduladas que el puntero rastrera y que se curvan alrededor de piedras.
category: backgrounds
component: SandBackground
props:
  - name: spacing
    label: Separación (px)
    type: number
    default: 10
    min: 6
    max: 40
    step: 1
  - name: ripples
    label: Ondulación (px)
    type: number
    default: 15
    min: 0
    max: 20
    step: 1
  - name: rake
    label: Rastrillo
    type: number
    default: 0.5
    min: 0
    max: 2
    step: 0.1
  - name: radius
    label: Huella (px)
    type: number
    default: 110
    min: 20
    max: 300
    step: 10
  - name: heal
    label: Cicatrización
    type: number
    default: 0.985
    min: 0.9
    max: 0.999
    step: 0.005
  - name: stones
    label: Piedras
    type: number
    default: 2
    min: 0
    max: 12
    step: 1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0
    max: 1
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

`spacing` y `ripples` dibujan las líneas base; `rake`, `radius` y `heal` gobiernan el surco que deja el puntero (fuerza, anchura y velocidad de cicatrización), mientras `stones` reparte las piedras que las líneas rodean. No lleva `background`: hereda el color del CSS de la página y se puede ajustar con `--sand-color` y `--sand-opacity` (o con la prop `color`).

```tsx
<SandBackground spacing={10} ripples={15} rake={0.5} heal={0.985} stones={2} />
```
