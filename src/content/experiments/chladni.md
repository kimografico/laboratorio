---
title: Chladni
description: Arena que se asienta en las líneas nodales de una placa de Chladni animada, guiada por el puntero.
category: backgrounds
component: ChladniBackground
props:
  - name: density
    label: Densidad
    type: number
    default: 60
    min: 10
    max: 200
    step: 5
  - name: size
    label: Tamaño de partícula (px)
    type: number
    default: 1.8
    min: 0.5
    max: 5
    step: 0.1
  - name: speed
    label: Velocidad de modos
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: follow
    label: Reacción al puntero
    type: number
    default: 1
    min: 0
    max: 1
    step: 0.05
  - name: shake
    label: Vibración
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.55
    min: 0
    max: 1
    step: 0.02
---

## Uso

Por defecto la arena hereda el color de la página (`currentColor`). `density` controla cuántas partículas hay por cada 10.000 px², `speed` la velocidad a la que los modos de vibración evolucionan solos (0 = patrón fijo), `follow` cuánto los elige el puntero, `shake` la sacudida previa al asentamiento y `alpha` la opacidad final. Opcionalmente fija `color` o define `--chladni-color` y `--chladni-opacity` en CSS.

```tsx
<ChladniBackground density={60} size={1.8} speed={1} follow={1} shake={1} alpha={0.55} />
```
