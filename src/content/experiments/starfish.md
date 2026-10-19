---
title: Estrellas de mar
description: Estrellas de mar enrolladas que se estiran y desenroscan hacia el puntero antes de relajarse.
category: naturaleza
component: StarfishBackground
props:
  - name: count
    label: Estrellas
    type: number
    default: 9
    min: 0
    max: 24
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 70
    min: 20
    max: 160
    step: 5
  - name: curl
    label: Rizo
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: reach
    label: Alcance (px)
    type: number
    default: 120
    min: 0
    max: 400
    step: 10
  - name: relax
    label: Relajación
    type: number
    default: 0.965
    min: 0.9
    max: 0.999
    step: 0.005
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
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Cada brazo se dibuja como una espiral paramétrica cuyo rizo crece con la distancia al puntero (`curl`, `reach`); al alejarse, `relax` devuelve el rizo a cero con amortiguación. Hereda el color de la página o se fija con `--starfish-color` y `--starfish-opacity` en CSS.

```tsx
<StarfishBackground count={9} size={70} curl={1} reach={120} relax={0.965} />
```
