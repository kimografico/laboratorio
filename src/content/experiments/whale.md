---
title: Ballenas
description: Ballenas que nadan lentas en dos planos de profundidad, se esquivan entre ellas y emergen a respirar.
category: backgrounds
component: WhaleBackground
props:
  - name: near
    label: Ballenas primer plano
    type: number
    default: 2
    min: 0
    max: 8
    step: 1
  - name: far
    label: Ballenas fondo
    type: number
    default: 3
    min: 0
    max: 10
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 540
    min: 100
    max: 1200
    step: 20
  - name: speed
    label: Velocidad
    type: number
    default: 0.3
    min: 0.02
    max: 1.5
    step: 0.02
  - name: dive
    label: Inmersión (px)
    type: number
    default: 260
    min: 0
    max: 800
    step: 10
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
    default: 1.3
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Cada ballena es una columna de segmentos con aleteo sinusoidal que persigue su rumbo, se desvía de sus compañeras y del puntero y asciende a romper la superficie según su reloj de inmersión (`dive`). Las del fondo son más lentas y están más desenfocadas. Hereda el color de la página o se fija con `--whale-color` y `--whale-opacity` en CSS.

```tsx
<WhaleBackground near={2} far={3} size={540} speed={0.3} dive={260} />
```
