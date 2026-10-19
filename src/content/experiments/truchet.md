---
title: Azulejos Truchet
description: Azulejos con arcos que el puntero gira permanentemente (90°) formando laberintos serpenteantes. El slider controla el radio de acción.
category: geometria
component: TruchetBackground
props:
  - name: size
    label: Tamaño (px)
    type: number
    default: 36
    min: 12
    max: 160
    step: 2
  - name: band
    label: Banda
    type: number
    default: 0.17
    min: 0.05
    max: 0.5
    step: 0.01
  - name: radius
    label: Radio de giro (px)
    type: number
    default: 20
    min: 0
    max: 400
    step: 10
  - name: idle
    label: Giro espontáneo/s
    type: number
    default: 12
    min: 0
    max: 25
    step: 1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.1
    min: 0
    max: 1
    step: 0.01
---

## Uso

Cada azulejo guarda dos arcos; el puntero invierte permanentemente la orientación de los que tiene cerca (`radius`). `idle` gira azulejos al azar de forma permanente para que el patrón evolucione solo. Hereda el color de la página o se fija con `--truchet-color` y `--truchet-opacity` en CSS.

```tsx
<TruchetBackground size={12} band={0.17} radius={130} idle={0} />
```