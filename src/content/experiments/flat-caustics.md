---
title: Cáusticas planas
description: Teselas de Voronoi en tres tonos planos que se separan alrededor del puntero.
category: backgrounds
component: FlatCausticsBackground
props:
  - name: scale
    label: Celda (px)
    type: number
    default: 100
    min: 30
    max: 220
    step: 5
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0
    max: 4
    step: 0.1
  - name: gap
    label: Canal (px)
    type: number
    default: 9
    min: 0
    max: 40
    step: 1
  - name: smooth
    label: Suavizado
    type: number
    default: 3
    min: 0
    max: 4
    step: 1
  - name: push
    label: Empuje (px)
    type: number
    default: 45
    min: 0
    max: 150
    step: 5
  - name: radius
    label: Radio puntero (px)
    type: number
    default: 200
    min: 40
    max: 500
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.2
    min: 0.03
    max: 1
    step: 0.01
---

## Uso

Cada celda es el recinto de Voronoi de una semilla que orbita despacio; el puntero separa las semillas cercanas dentro de `radius` según `push`. `smooth` redondea las esquinas y `gap` deja el canal por el que se ve el fondo.

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`), con tres niveles de opacidad derivados de `alpha`. Opcionalmente fija `color` o define `--flat-caustics-color`, `--flat-caustics-opacity` y una paleta `--flat-caustics-tone-1/2/3` en CSS.

```tsx
<FlatCausticsBackground scale={100} speed={1} gap={9} push={45} alpha={0.2} />
```
