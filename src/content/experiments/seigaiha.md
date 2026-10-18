---
title: Seigaiha
description: El patrón japonés de olas concéntricas que se hinchan al pasar el puntero.
category: backgrounds
component: SeigaihaBackground
props:
  - name: size
    label: Radio (px)
    type: number
    default: 40
    min: 12
    max: 120
    step: 2
  - name: rings
    label: Arcos por ola
    type: number
    default: 4
    min: 1
    max: 10
    step: 1
  - name: swell
    label: Hinchazón
    type: number
    default: 1
    min: 0
    max: 1
    step: 0.05
  - name: radius
    label: Radio puntero (px)
    type: number
    default: 50
    min: 40
    max: 500
    step: 10
  - name: wave
    label: Respiración
    type: number
    default: 0.05
    min: 0
    max: 0.3
    step: 0.01
  - name: decay
    label: Persistencia
    type: number
    default: 0.98
    min: 0.8
    max: 0.995
    step: 0.005
  - name: alpha
    label: Opacidad
    type: number
    default: 0.25
    min: 0.03
    max: 1
    step: 0.01
  - name: lineWidth
    label: Grosor línea
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.5
---

## Uso

Las olas se disponen en filas solapadas y cada una tapa a las anteriores. El puntero las hincha dentro de `radius` y la hinchazón decae según `decay`; `wave` añade una respiración ambiental que recorre el patrón.

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`). Opcionalmente fija `color` o define `--seigaiha-color` y `--seigaiha-opacity` en CSS.

```tsx
<SeigaihaBackground size={38} rings={4} swell={0.3} radius={180} color="#ffffff" />
```
