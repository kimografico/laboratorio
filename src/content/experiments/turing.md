---
title: Coral de Turing I
description: Manchas que reaccionan a su vecindad según un modelo de reactividad-difusión y generan patrones vivos.
category: backgrounds
component: TuringBackground
props:
  - name: cell
    label: Celda (px)
    type: number
    default: 2
    min: 1
    max: 2
    step: 1
  - name: steps
    label: Pasos por fotograma
    type: number
    default: 6
    min: 1
    max: 20
    step: 1
  - name: feed
    label: Alimento
    type: number
    default: 0.0545
    min: 0.01
    max: 0.1
    step: 0.0005
  - name: kill
    label: Muerte
    type: number
    default: 0.062
    min: 0.03
    max: 0.075
    step: 0.001
  - name: brush
    label: Pincel (px)
    type: number
    default: 5
    min: 0
    max: 12
    step: 1
  - name: spark
    label: Chispa
    type: number
    default: 0.15
    min: 0
    max: 3
    step: 0.05
  - name: opacity
    label: Opacidad
    type: number
    default: 0.8
    min: 0
    max: 1
    step: 0.02
  - name: color
    label: Color
    type: color
---

## Uso

Dos campos (activador e inhibidor) se difunden y se alimentan a distinta velocidad; `feed` y `kill` deciden qué patrón sobrevive (manchas, laberintos, coral). El puntero siembra activador con su pincel (`brush`, `spark`) y las semillas iniciales se generan solas.

```tsx
<TuringBackground cell={2} steps={6} feed={0.0545} kill={0.062} brush={5} />
```
