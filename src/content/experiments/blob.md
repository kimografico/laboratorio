---
title: Gotas líquidas
description: Gotas que flotan y se funden entre sí con un efecto de metal líquido que el puntero atrae.
category: simulacion
component: BlobBackground
props:
  - name: large
    label: Gotas grandes
    type: number
    default: 12
    min: 0
    max: 40
    step: 1
  - name: small
    label: Gotas pequeñas
    type: number
    default: 25
    min: 0
    max: 60
    step: 1
  - name: size
    label: Tamaño base (px)
    type: number
    default: 120
    min: 20
    max: 200
    step: 5
  - name: goo
    label: Desenfoque líquido (px)
    type: number
    default: 15
    min: 0
    max: 40
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 0.5
    min: 0
    max: 4
    step: 0.1
  - name: attract
    label: Atracción
    type: number
    default: 0.6
    min: -2
    max: 2
    step: 0.1
  - name: radius
    label: Radio del puntero (px)
    type: number
    default: 300
    min: 60
    max: 600
    step: 20
  - name: alpha
    label: Opacidad
    type: number
    default: 0.16
    min: 0.02
    max: 1
    step: 0.02
---

## Uso

Las gotas grandes dibujan una capa de fondo más tenue y las pequeñas la capa principal; `size` fija el radio base, `goo` controla cuánto se funden entre sí y `attract` (negativo = repele) cuánto las arrastra el puntero dentro de `radius`.

Por defecto no dibuja fondo y hereda el color de la página. Opcionalmente fija `color` o define `--blob-color` y `--blob-opacity` en CSS.

```tsx
<BlobBackground large={8} small={14} size={95} goo={11} speed={1} attract={0.6} radius={260} alpha={0.16} />
```
