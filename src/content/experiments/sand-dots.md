---
title: Arena (puntos)
description: Retícula de puntos de arena que el puntero barre con un rastrillo, con piedras que se cruzan y cicatrizan despacio.
category: backgrounds
component: SandDotsBackground
props:
  - name: spacing
    label: Separación (px)
    type: number
    default: 8
    min: 6
    max: 40
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 0.7
    min: 0.5
    max: 4
    step: 0.1
  - name: ripples
    label: Ondas
    type: number
    default: 18
    min: 0
    max: 20
    step: 1
  - name: rake
    label: Rastrillo
    type: number
    default: 1
    min: 0
    max: 2
    step: 0.1
  - name: radius
    label: Radio de influencia (px)
    type: number
    default: 80
    min: 20
    max: 300
    step: 10
  - name: heal
    label: Cicatrización
    type: number
    default: 0.98
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
    default: 0.4
    min: 0
    max: 1
    step: 0.01
---

## Uso

Cada punto guarda un desplazamiento que el puntero empuja hacia fuera con su rastrillo y que `heal` devuelve lentamente a cero. Las piedras ondulan el campo en su contorno y desplazan las piedras vecinas. Hereda el color de la página o se fija con `--sand-color` y `--sand-opacity` en CSS.

```tsx
<SandDotsBackground spacing={8} size={0.7} ripples={18} rake={1} radius={80} />
```
