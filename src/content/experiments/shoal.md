---
title: Cardumen
description: Banco de peces que forma un cardumen y huye del puntero, con profundidad simulada.
category: backgrounds
component: ShoalBackground
props:
  - name: count
    label: Peces
    type: number
    default: 500
    min: 10
    max: 750
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 15
    min: 6
    max: 32
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1.5
    min: 0.4
    max: 4
    step: 0.1
  - name: avoid
    label: Evitación (px)
    type: number
    default: 150
    min: 0
    max: 400
    step: 10
  - name: cohesion
    label: Cohesión
    type: number
    default: 1.2
    min: 0
    max: 3
    step: 0.1
  - name: alpha
    label: Opacidad
    type: number
    default: 0.32
    min: 0.05
    max: 1
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.5
  - name: color
    label: Color
    type: color
---

## Uso

Simula un cardumen con reglas de separación, alineación y cohesión. El puntero actúa como depredador: cada pez lo evita dentro de `avoid`.

```tsx
<ShoalBackground count={500} size={15} speed={1.5} avoid={150} />
```
