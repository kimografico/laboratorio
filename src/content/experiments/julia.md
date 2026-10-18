---
title: "Julia"
description: "Conjunto de Julia que muta siguiendo al puntero, con líneas de nivel."
category: pendiente
component: "JuliaBackground"
props:
  - name: "iterations"
    label: "Iteraciones"
    type: "number"
    default: 48
    min: 8
    max: 128
    step: 1
  - name: "scale"
    label: "Muestra (px)"
    type: "number"
    default: 4
    min: 1
    max: 16
    step: 1
  - name: "zoom"
    label: "Zoom"
    type: "number"
    default: 1
    min: 0.2
    max: 8
    step: 0.1
  - name: "lines"
    label: "Líneas de nivel"
    type: "number"
    default: 0.8
    min: 0
    max: 4
    step: 0.05
  - name: "sharpness"
    label: "Finura de líneas"
    type: "number"
    default: 6
    min: 1
    max: 12
    step: 0.5
  - name: "fill"
    label: "Relleno del conjunto"
    type: "number"
    default: 0.1
    min: 0
    max: 1
    step: 0.02
  - name: "ease"
    label: "Suavizado"
    type: "number"
    default: 0.06
    min: 0.005
    max: 0.3
    step: 0.005
  - name: "opacity"
    label: "Opacidad"
    type: "number"
    default: 0.7
    min: 0
    max: 1
    step: 0.02
  - name: "color"
    label: "Color"
    type: "color"
---

## Uso

El puntero recorre el plano de parámetros del conjunto de Julia z → z² + c; el parámetro se mueve con `ease` y, en reposo, gira por una circunferencia donde el fractal cambia de forma sin romperse. `lines`/`sharpness` dibujan curvas de igual velocidad de escape y `fill` tiñe el interior.

```tsx
<JuliaBackground iterations={48} zoom={1} lines={0.8} opacity={0.7} />
```
