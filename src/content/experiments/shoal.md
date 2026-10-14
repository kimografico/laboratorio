---
title: Cardumen
description: Banco de peces que forma un cardumen y huye del puntero, con profundidad simulada.
category: backgrounds
component: ShoalBackground
accent: "#000000"
props:
  - name: count
    label: Peces
    type: number
    default: 70
    min: 10
    max: 200
    step: 1
  - name: size
    label: Tamaño (px)
    type: number
    default: 14
    min: 6
    max: 32
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1.3
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
    default: 1
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
    default: "#000000"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

Simula un cardumen con reglas de separación, alineación y cohesión. El puntero actúa como depredador: cada pez lo evita dentro de `avoid`.

```tsx
<ShoalBackground count={70} size={14} speed={1.3} avoid={150} />
```
