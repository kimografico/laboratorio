---
title: Matrix Rain
description: Lluvia de caracteres estilo terminal que también cae alrededor del puntero.
category: backgrounds
component: MatrixBackground
props:
  - name: size
    label: Celda (px)
    type: number
    default: 18
    min: 8
    max: 40
    step: 1
  - name: chars
    label: Caracteres
    type: text
    default: "01"
  - name: speed
    label: Velocidad
    type: number
    default: 0.22
    min: 0.05
    max: 1
    step: 0.01
  - name: length
    label: Estela (chars)
    type: number
    default: 12
    min: 2
    max: 40
    step: 1
  - name: spread
    label: Columnas del puntero
    type: number
    default: 1
    min: 0
    max: 6
    step: 1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0
    max: 1
    step: 0.05
  - name: color
    label: Color texto
    type: color
    default: "#ffffff"
  - name: background
    label: Fondo
    type: color
    default: "#1b1917"
---

## Uso

`chars` puede ser cualquier cadena; los caracteres se eligen al azar de ella. `spread` añade columnas al pasar el puntero.

```tsx
<MatrixBackground chars="01アイウ" speed={0.22} length={12} color="#ffffff" background="#1b1917" />
```
