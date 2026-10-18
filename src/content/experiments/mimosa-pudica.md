---
title: Mimosa Pudica
description: Helechos sensitivos que se cierran al tacto y se reabren lentamente, inspirados en la Mimosa pudica.
category: pendiente
component: MimosaPudicaBackground
props:
  - name: near
    label: Cercanas
    type: number
    default: 8
    min: 0
    max: 25
    step: 1
  - name: far
    label: Lejanas
    type: number
    default: 6
    min: 0
    max: 25
    step: 1
  - name: size
    label: Tamaño hoja (px)
    type: number
    default: 100
    min: 30
    max: 250
    step: 5
  - name: wind
    label: Viento
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: touchSensitivity
    label: Sensibilidad al tacto
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: reopenSpeed
    label: Velocidad reapertura (1-10)
    type: number
    default: 5
    min: 1
    max: 10
    step: 1
  - name: reopenDelay
    label: Retraso reapertura (ms)
    type: number
    default: 2000
    min: 0
    max: 5000
    step: 100
  - name: leavesPerBranch
    label: Pares de hojas / rama
    type: number
    default: 14
    min: 4
    max: 25
    step: 1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.4
    min: 0
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor línea
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Ramas con hojas estrechas y alargadas tipo helecho (Mimosa pudica). Las hojas cercanas son mayores que las lejanas. Al pasar el puntero, las hojas se cierran (máx. 60°) y se reabren tras el retraso configurado. La rama entera se inclina ligeramente desde la base. Controla `near`/`far` (hasta 25 ramas), `size` para el largo, `leavesPerBranch` para densidad de hojas, `wind` para el balanceo, `touchSensitivity` para la reacción al tacto, `reopenSpeed` (1-10) / `reopenDelay` para la reapertura, y `alpha`/`lineWidth` para la tinta. Hereda color de la página (`currentColor`); fíjalo con `color` o con `--leaves-color` / `--leaves-opacity` en CSS.

```tsx
<MimosaPudicaBackground near={8} far={6} size={100} leavesPerBranch={14} wind={1} touchSensitivity={1} reopenSpeed={5} reopenDelay={2000} alpha={0.4} />
```