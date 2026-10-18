---
title: Luciérnagas
description: Enjambre de luciérnagas que destellan sincronizadas según el modelo de Kuramoto y reaccionan al puntero.
category: backgrounds
component: FirefliesBackground
props:
  - name: count
    label: Luciérnagas
    type: number
    default: 200
    min: 10
    max: 250
    step: 5
  - name: coupling
    label: Sincronización
    type: number
    default: 0.5
    min: 0
    max: 3
    step: 0.05
  - name: call
    label: Llamada del puntero
    type: number
    default: 2.5
    min: 0
    max: 10
    step: 0.1
  - name: radius
    label: Radio (px)
    type: number
    default: 180
    min: 40
    max: 500
    step: 10
  - name: attract
    label: Atracción
    type: number
    default: 0.03
    min: 0
    max: 0.1
    step: 0.002
  - name: glow
    label: Resplandor (px)
    type: number
    default: 5
    min: 2
    max: 40
    step: 1
  - name: speed
    label: Velocidad
    type: number
    default: 1.3
    min: 0.1
    max: 3
    step: 0.1
  - name: color
    label: Color
    type: color
---

## Uso

Cada luciérnaga destella con su propio ritmo; `coupling` sincroniza al enjambre (modelo de Kuramoto, oleadas por encima de ~0.7) y el puntero actúa como una luciérnaga extra que atrae y sincroniza a las cercanas dentro de `radius` con fuerza `call`/`attract`.

```tsx
<FirefliesBackground count={70} coupling={0.7} call={2.5} radius={180} glow={12} />
```
