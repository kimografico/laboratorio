---
title: Caleidoscopio
description: Trazos simétricos que se replican en cuñas giratorias alrededor del centro formando un caleidoscopio.
category: geometria
component: KaleidoscopeBackground
props:
  - name: slices
    label: Cuñas
    type: number
    default: 10
    min: 3
    max: 16
    step: 1
  - name: rotation
    label: Rotación
    type: number
    default: 0.1
    min: 0
    max: 1
    step: 0.02
  - name: life
    label: Duración (s)
    type: number
    default: 3.5
    min: 0.5
    max: 8
    step: 0.1
  - name: width
    label: Grosor (px)
    type: number
    default: 0.5
    min: 0.5
    max: 6
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.5
    min: 0.05
    max: 1
    step: 0.05
  - name: mirror
    label: Espejo
    type: boolean
    default: true
---

## Uso

Los trazos nacen cerca del centro y se repiten en `slices` cuñas que giran a `rotation`; `mirror` añade la reflexión especular de cada cuña. Hereda el color de la página o se fija con `--kaleidoscope-color` y `--kaleidoscope-opacity` en CSS.

```tsx
<KaleidoscopeBackground slices={10} rotation={0.1} mirror />
```
