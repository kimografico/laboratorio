---
title: Pulso hexagonal
description: Rejilla hexagonal donde varios focos emiten ondas que iluminan las celdas al expandirse.
category: pendiente
component: HexPulseBackground
props:
  - name: size
    label: Lado (px)
    type: number
    default: 34
    min: 12
    max: 90
    step: 2
  - name: sources
    label: Focos
    type: number
    default: 2
    min: 1
    max: 6
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0.1
    max: 3
    step: 0.1
  - name: width
    label: Grosor (px)
    type: number
    default: 1
    min: 0.5
    max: 3
    step: 0.1
  - name: glow
    label: Resplandor
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.05
  - name: alpha
    label: Opacidad
    type: number
    default: 0.35
    min: 0.05
    max: 1
    step: 0.05
---

## Uso

Una rejilla de hexágonos de lado `size`; cada foco lanza pulsos que recorren las celdas a `speed` y suben su brillo según `glow`. Hereda el color de la página o se fija con `--hex-color` y `--hex-opacity` en CSS.

```tsx
<HexPulseBackground size={34} sources={2} glow={0.5} />
```
