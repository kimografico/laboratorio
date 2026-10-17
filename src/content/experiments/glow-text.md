---
title: Glow Text
description: El texto respira con un resplandor suave del mismo color. Un halo tenue para títulos sobre fondos oscuros.
category: texts
component: GlowText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración del pulso (s)
    type: number
    default: 2.5
    min: 0.5
    max: 8
    step: 0.1
  - name: delay
    label: Retraso (s)
    type: number
    default: 0
    min: 0
    max: 5
    step: 0.1
  - name: intensity
    label: Intensidad
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: loop
    label: Bucle
    type: boolean
    default: true
---

## Uso

El halo usa `text-shadow` con `currentColor`, por lo que hereda el color del texto.

```tsx
<GlowText>Neón sereno</GlowText>
<GlowText intensity={1.6} duration={3.5}>Halo amplio</GlowText>
```
