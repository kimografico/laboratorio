---
title: Capas de olas
description: Capas superpuestas de olas que se cruzan con oleaje lento y se hunden bajo el puntero.
category: naturaleza
component: WaveLayersBackground
props:
  - name: layers
    label: Capas
    type: number
    default: 8
    min: 1
    max: 12
    step: 1
  - name: height
    label: Altura (px)
    type: number
    default: 19
    min: 5
    max: 120
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1.4
    min: 0
    max: 3
    step: 0.1
  - name: swell
    label: Oleaje (px)
    type: number
    default: 115
    min: 0
    max: 200
    step: 5
  - name: radius
    label: Radio de hundimiento (px)
    type: number
    default: 80
    min: 40
    max: 500
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.02
    min: 0.01
    max: 0.1
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
  - name: boat
    label: Barquito de papel
    type: boolean
    default: true
---

## Uso

Cada capa combina dos senoides en direcciones opuestas (`swell` controla la onda lenta) y se dibuja como línea con relleno tenue. El puntero hunde la cresta dentro de `radius` suavemente. Hereda el color de la página o se fija con `--waves-color`, `--waves-opacity` y los tonos `--waves-tone-N` en CSS.

Con `boat` activado aparece un barquito de papel sobre la capa central que navega y se inclina siguiendo la ola (y el oleaje del puntero) en la que va montado (activado por defecto).

```tsx
<WaveLayersBackground layers={8} height={19} speed={1.4} swell={115} radius={80} boat />
```
