---
title: Agua
description: Red de canales que ondula, se ensancha con las olas y reacciona a la estela del puntero.
category: naturaleza
component: WaterBackground
props:
  - name: scale
    label: Escala (px)
    type: number
    default: 110
    min: 60
    max: 180
    step: 5
  - name: gap
    label: Ancho de canal (px)
    type: number
    default: 6.5
    min: 2
    max: 14
    step: 0.5
  - name: roughness
    label: Rugosidad
    type: number
    default: 3.5
    min: 0
    max: 8
    step: 0.5
  - name: grain
    label: Grano
    type: number
    default: 6
    min: 2
    max: 12
    step: 1
  - name: round
    label: Redondeo (px)
    type: number
    default: 14
    min: 0
    max: 30
    step: 1
  - name: wave
    label: Altura de olas
    type: number
    default: 1
    min: 0
    max: 2
    step: 0.1
  - name: speed
    label: Velocidad
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: pulse
    label: Pulso
    type: number
    default: 0.6
    min: 0
    max: 1
    step: 0.05
  - name: ripple
    label: Onda del puntero
    type: number
    default: 1
    min: 0
    max: 2
    step: 0.1
  - name: radius
    label: Alcance (px)
    type: number
    default: 220
    min: 60
    max: 400
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.8
    min: 0.1
    max: 1
    step: 0.05
  - name: secondary
    label: Capa secundaria
    type: number
    default: 0.4
    min: 0
    max: 1
    step: 0.05
---

## Uso

Por defecto hereda el color de la página mediante `currentColor`. También puede definir `--water-color`, `--water-opacity` y `--water-tone-1/2` en CSS para ajustar los tonos de cada capa. Los canales ondulan y se abren con las olas; mover el puntero genera una onda circular (`ripple`, `radius`) que distorsiona la malla.

```tsx
<WaterBackground scale={110} gap={6.5} ripple={1} />
```