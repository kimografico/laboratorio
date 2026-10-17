---
title: Coral
description: Colonias de coral que crecen con una reacción-difusión de Gray-Scott y se abren a su paso por el puntero.
category: backgrounds
component: CoralBackground
props:
  - name: res
    label: Resolución de celda (px)
    type: number
    default: 7
    min: 3
    max: 16
    step: 1
  - name: steps
    label: Pasos por fotograma
    type: number
    default: 5
    min: 1
    max: 20
    step: 1
  - name: feed
    label: Alimentación (feed)
    type: number
    default: 0.0545
    min: 0.02
    max: 0.09
    step: 0.0005
  - name: kill
    label: Mortandad (kill)
    type: number
    default: 0.062
    min: 0.03
    max: 0.09
    step: 0.0005
  - name: erode
    label: Erosión
    type: number
    default: 0.0006
    min: 0
    max: 0.002
    step: 0.0001
  - name: brush
    label: Pincel del puntero (celdas)
    type: number
    default: 4
    min: 1
    max: 20
    step: 1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.24
    min: 0.02
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor de línea
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

El patrón crece con los parámetros de Gray-Scott: `feed` y `kill` cambian la forma del coral, `steps` su velocidad de crecimiento, `erode` su densidad y `res` el detalle (más alto = más ligero). El puntero abre un claro con el radio de `brush` por el que el coral vuelve a crecer.

Por defecto no dibuja fondo y hereda el color de la página. Opcionalmente fija `color` o define `--coral-color` y `--coral-opacity` en CSS.

```tsx
<CoralBackground res={7} steps={5} feed={0.0545} kill={0.062} erode={0.0006} brush={4} alpha={0.24} lineWidth={1.2} />
```
