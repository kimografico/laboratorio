---
title: Tentacles
description: Tentáculos que cuelgan y siguen al puntero con ventosas, profundidad y ondulación.
category: naturaleza
component: TentacleBackground
props:
  - name: near
    label: Cercanos
    type: number
    default: 8
    min: 0
    max: 20
    step: 1
  - name: far
    label: Lejanos
    type: number
    default: 4
    min: 0
    max: 20
    step: 1
  - name: length
    label: Longitud
    type: number
    default: 0.9
    min: 0.1
    max: 1
    step: 0.05
  - name: width
    label: Grosor base (px)
    type: number
    default: 38
    min: 6
    max: 120
    step: 2
  - name: segments
    label: Segmentos
    type: number
    default: 50
    min: 8
    max: 80
    step: 1
  - name: chase
    label: Persecución
    type: number
    default: 0.02
    min: 0.002
    max: 0.06
    step: 0.002
  - name: reach
    label: Alcance
    type: number
    default: 2
    min: 0.5
    max: 5
    step: 0.1
  - name: curl
    label: Enroscado
    type: number
    default: 0.3
    min: 0
    max: 0.5
    step: 0.02
  - name: wave
    label: Ondulación
    type: number
    default: 0.08
    min: 0
    max: 0.3
    step: 0.01
  - name: tip
    label: Grosor de punta
    type: number
    default: 0.25
    min: 0
    max: 1
    step: 0.05
  - name: alpha
    label: Opacidad
    type: number
    default: 0.28
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

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`). Opcionalmente fija `color` o define `--tentacle-color` y `--tentacle-opacity` en CSS.

```tsx
<TentacleBackground near={8} far={4} length={0.45} width={38} color="#ffffff" />
```
