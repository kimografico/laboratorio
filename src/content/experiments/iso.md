---
title: Terreno isométrico
description: Relieve de columnas isométricas que ondula y se levanta bajo el puntero como una colina.
category: backgrounds
component: IsoBackground
props:
  - name: size
    label: Ancho de columna (px)
    type: number
    default: 80
    min: 20
    max: 200
    step: 5
  - name: height
    label: Altura máxima (px)
    type: number
    default: 90
    min: 10
    max: 300
    step: 5
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0
    max: 4
    step: 0.1
  - name: lift
    label: Levante del puntero (px)
    type: number
    default: 120
    min: 0
    max: 400
    step: 10
  - name: radius
    label: Radio de la colina (px)
    type: number
    default: 220
    min: 40
    max: 600
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.06
    min: 0.02
    max: 1
    step: 0.02
---

## Uso

`size` fija el ancho de cada columna (más pequeño = terreno más fino y más coste), `height` la altura máxima del relieve, `speed` el ritmo de las ondas y `lift`/`radius` cuánto y hasta dónde levanta el puntero el terreno. Cada cara tiene una opacidad propia derivada de `alpha` (superior 1x, laterales 1.8x y 2.6x).

Por defecto no dibuja fondo y hereda el color de la página. Opcionalmente fija `color` o define `--iso-color`, `--iso-opacity` y los tonos por cara `--iso-tone-1`, `--iso-tone-2` y `--iso-tone-3` en CSS.

```tsx
<IsoBackground size={80} height={90} speed={1} lift={120} radius={220} alpha={0.1} />
```
