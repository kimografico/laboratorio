---
title: Dandelion
description: Semillas de diente de león que flotan con el viento y se apartan al pasar el puntero.
category: backgrounds
component: DandelionBackground
props:
  - name: near
    label: Cercanas
    type: number
    default: 22
    min: 0
    max: 50
    step: 1
  - name: far
    label: Lejanas
    type: number
    default: 16
    min: 0
    max: 50
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 30
    min: 5
    max: 100
    step: 1
  - name: wind
    label: Viento
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: gust
    label: Rachas del puntero
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.34
    min: 0
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor línea
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`). `near`/`far` reparten las semillas en dos capas de profundidad, `size` escala el paracaídas de las cercanas, `wind` controla la deriva constante y `gust` cuánto las sopla el puntero al pasar cerca; `alpha` y `lineWidth` ajustan el trazo de las cercanas. Opcionalmente fija `color` o define `--dandelion-color` y `--dandelion-opacity` en CSS.

```tsx
<DandelionBackground near={35} far={29} size={30} wind={1} gust={0.5} alpha={0.34} />
```
