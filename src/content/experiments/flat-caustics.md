---
title: Cáusticas planas
description: Teselas de Voronoi en tres tonos planos que se separan alrededor del puntero.
category: geometria
component: FlatCausticsBackground
props:
  - name: scale
    label: Celda (px)
    type: number
    default: 60
    min: 30
    max: 220
    step: 5
  - name: speed
    label: Velocidad
    type: number
    default: 0.3
    min: 0
    max: 4
    step: 0.1
  - name: gap
    label: Canal (px)
    type: number
    default: 8
    min: 0
    max: 40
    step: 1
  - name: smooth
    label: Suavizado
    type: number
    default: 4
    min: 0
    max: 4
    step: 1
  - name: push
    label: Empuje (px)
    type: number
    default: 60
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
    default: 0.15
    min: 0.03
    max: 1
    step: 0.01
---

## Uso

Cada celda es el recinto de Voronoi de una semilla que orbita despacio; el puntero separa las semillas cercanas dentro de `radius` según `push`. `smooth` redondea las esquinas y `gap` deja el canal por el que se ve el fondo.

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`), con tres niveles de opacidad derivados de `alpha`. Opcionalmente fija `color` o define `--flat-caustics-color`, `--flat-caustics-opacity` y una paleta `--flat-caustics-tone-1/2/3` en CSS.

```tsx
<FlatCausticsBackground scale={60} speed={0.3} gap={8} smooth={4} push={60} radius={200} alpha={0.15} />
```
