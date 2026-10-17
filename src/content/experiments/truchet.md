---
title: Azulejos Truchet
description: Azulejos con arcos que el puntero gira sobre la marcha y forman laberintos serpenteantes.
category: backgrounds
component: TruchetBackground
props:
  - name: size
    label: Tamaño (px)
    type: number
    default: 56
    min: 12
    max: 160
    step: 2
  - name: band
    label: Banda
    type: number
    default: 0.15
    min: 0.05
    max: 0.5
    step: 0.01
  - name: radius
    label: Radio de giro (px)
    type: number
    default: 130
    min: 0
    max: 400
    step: 10
  - name: heal
    label: Reversión
    type: number
    default: 0.96
    min: 0.8
    max: 0.999
    step: 0.01
  - name: idle
    label: Giro en reposo
    type: number
    default: 3
    min: 0
    max: 20
    step: 1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.26
    min: 0
    max: 1
    step: 0.01
---

## Uso

Cada azulejo guarda dos arcos; el puntero invierte la orientación de los que tiene cerca (`radius`) y `heal` los va devolviendo a su estado original. `idle` gira azulejos al azar para que el patrón nunca se repita. Hereda el color de la página o se fija con `--truchet-color` y `--truchet-opacity` en CSS.

```tsx
<TruchetBackground size={56} band={0.15} radius={130} heal={0.96} idle={3} />
```
