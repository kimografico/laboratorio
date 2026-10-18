---
title: Líneas de campo
description: Líneas de campo eléctrico que salen del puntero y son atraídas por polos opuestos en órbita lenta.
category: backgrounds
component: FieldLinesBackground
props:
  - name: lines
    label: Líneas
    type: number
    default: 28
    min: 4
    max: 80
    step: 1
  - name: sinks
    label: Polos
    type: number
    default: 3
    min: 1
    max: 10
    step: 1
  - name: step
    label: Paso (px)
    type: number
    default: 6
    min: 1
    max: 20
    step: 1
  - name: length
    label: Longitud
    type: number
    default: 300
    min: 50
    max: 800
    step: 10
  - name: spin
    label: Giro
    type: number
    default: 0.00005
    min: 0
    max: 0.0005
    step: 0.00001
  - name: ease
    label: Suavizado
    type: number
    default: 0.1
    min: 0.01
    max: 1
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.5
  - name: color
    label: Color
    type: color
  - name: alpha
    label: Opacidad
    type: number
    default: 0.22
    min: 0
    max: 1
    step: 0.02
---

## Uso

Cada línea se integra numéricamente siguiendo el campo de una carga +1 en el puntero y `sinks` cargas negativas que orbitan. `length` limita cuántos pasos da cada línea, `spin` hace girar su origen y `ease` suaviza el seguimiento del puntero.

```tsx
<FieldLinesBackground lines={28} sinks={3} length={300} spin={0.00005} ease={0.1} alpha={0.22} />
```
