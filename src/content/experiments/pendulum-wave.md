---
title: Onda de péndulos
description: Filas de puntos que oscilan con frecuencias distintas y forman ondas que viajan hasta realinearse.
category: backgrounds
component: PendulumWaveBackground
props:
  - name: count
    label: Péndulos por fila
    type: number
    default: 44
    min: 8
    max: 120
    step: 1
  - name: rows
    label: Filas
    type: number
    default: 6
    min: 1
    max: 16
    step: 1
  - name: amplitude
    label: Amplitud
    type: number
    default: 0.42
    min: 0
    max: 1
    step: 0.02
  - name: period
    label: Periodo (s)
    type: number
    default: 90
    min: 20
    max: 300
    step: 5
  - name: dot
    label: Radio (px)
    type: number
    default: 3
    min: 1
    max: 10
    step: 0.5
  - name: excite
    label: Excitación
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.42
    min: 0
    max: 1
    step: 0.02
  - name: line
    label: Línea
    type: number
    default: 0.14
    min: 0
    max: 1
    step: 0.01
---

## Uso

Cada punto es un péndulo con su propia frecuencia: al pasar el puntero los cercanos se excitan y oscilan más antes de calmarse. Las filas de arriba son más pequeñas y tenues por profundidad. Por defecto hereda el color de la página; se puede fijar con la prop `color` o con `--pendulum-color` y `--pendulum-opacity` en CSS.

```tsx
<PendulumWaveBackground count={44} rows={6} amplitude={0.42} period={90} dot={3} />
```
