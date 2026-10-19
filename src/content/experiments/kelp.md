---
title: Bosque de algas
description: Algas que se mecen con la corriente y se apartan suavemente al paso del puntero.
category: naturaleza
component: KelpBackground
props:
  - name: near
    label: Algas cercanas
    type: number
    default: 16
    min: 0
    max: 40
    step: 1
  - name: far
    label: Algas lejanas
    type: number
    default: 27
    min: 0
    max: 40
    step: 1
  - name: length
    label: Longitud
    type: number
    default: 0.85
    min: 0.1
    max: 1
    step: 0.05
  - name: width
    label: Grosor base (px)
    type: number
    default: 25
    min: 4
    max: 48
    step: 1
  - name: segments
    label: Segmentos
    type: number
    default: 45
    min: 8
    max: 48
    step: 1
  - name: current
    label: Corriente
    type: number
    default: 1.3
    min: 0
    max: 3
    step: 0.1
  - name: avoid
    label: Esquiva puntero (px)
    type: number
    default: 180
    min: 0
    max: 400
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.28
    min: 0.03
    max: 1
    step: 0.01
  - name: lineWidth
    label: Grosor línea
    type: number
    default: 1.1
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Se mezclan algas cercanas (con contorno y nervadura) y lejanas (silueta tenue) que se dibujan de atrás hacia delante. Cada una se dobla con la corriente compartida y el puntero las aparta dentro de `avoid`, como un nadador que pasa.

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`). Opcionalmente fija `color` o define `--kelp-color` y `--kelp-opacity` en CSS.

```tsx
<KelpBackground near={16} far={27} length={0.85} current={1.3} color="#ffffff" />
```
