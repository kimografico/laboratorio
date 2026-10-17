---
title: Cuerdas
description: Cuerdas horizontales que el puntero pulsa y que vibran con ondas amortiguadas hasta quietarse.
category: backgrounds
component: StringsBackground
props:
  - name: strings
    label: Cuerdas
    type: number
    default: 36
    min: 4
    max: 100
    step: 1
  - name: tension
    label: Tensión
    type: number
    default: 0.18
    min: 0.05
    max: 0.25
    step: 0.01
  - name: decay
    label: Amortiguación
    type: number
    default: 0.985
    min: 0.9
    max: 0.999
    step: 0.005
  - name: pluck
    label: Pulsado
    type: number
    default: 14
    min: 0
    max: 60
    step: 1
  - name: ambient
    label: Vibración ambiente
    type: number
    default: 0.6
    min: 0
    max: 5
    step: 0.1
  - name: segment
    label: Segmentos
    type: number
    default: 10
    min: 4
    max: 40
    step: 1
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.3)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

Cada cuerda es una cadena de segmentos con tensión (`tension`), amortiguación (`decay`) y un lazo de afinación que la devuelve a su línea recta; el puntero la desplaza al pasar (`pluck`) y `ambient` mantiene una vibración mínima para que nunca queden totalmente quietas.

```tsx
<StringsBackground strings={36} tension={0.18} decay={0.985} pluck={14} segment={10} />
```
