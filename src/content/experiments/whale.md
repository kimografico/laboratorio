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
    default: 1
    min: 0
    max: 10
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 300
    min: 100
    max: 1200
    step: 20
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0.02
    max: 1.5
    step: 0.02
  - name: dive
    label: Inmersión (px)
    type: number
    default: 250
    min: 0
    max: 800
    step: 10
  - name: sink
    label: Velocidad de inmersión
    type: number
    default: 0.012
    min: 0.002
    max: 0.06
    step: 0.002
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

Cada ballena es una columna de segmentos con aleteo sinusoidal que persigue su rumbo, se desvía de sus compañeras y del puntero y asciende a romper la superficie según su reloj de inmersión (`dive`). Al sumergirse se desvanece y encoge sobre su propio centro; `sink` regula la rapidez con la que se hunde y emerge. Las del fondo son más lentas y están más desenfocadas. Hereda el color de la página o se fija con `--whale-color` y `--whale-opacity` en CSS.

```tsx
<WhaleBackground near={2} far={1} size={300} speed={1} dive={250} sink={0.012} />
```
