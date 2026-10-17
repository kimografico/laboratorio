---
title: Tilt In Text
description: Los caracteres se enderezan desde una ligera inclinación con un fundido. Un 3D sutil para títulos.
category: texts
component: TiltInText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración (s)
    type: number
    default: 0.6
    min: 0.1
    max: 3
    step: 0.1
  - name: delay
    label: Retraso (s)
    type: number
    default: 0
    min: 0
    max: 3
    step: 0.1
  - name: stagger
    label: Retraso por carácter (s)
    type: number
    default: 0.04
    min: 0
    max: 0.3
    step: 0.005
  - name: angle
    label: Ángulo inicial (°)
    type: number
    default: -12
    min: -45
    max: 45
    step: 1
  - name: loop
    label: Bucle
    type: boolean
    default: false
  - name: separator
    label: Separador
    type: text
    default: " "
---

## Uso

Cada carácter rota desde `angle` y sube ligeramente hasta quedar recto.

```tsx
<TiltInText angle={-10}>Un título con carácter</TiltInText>
<TiltInText angle={8} stagger={0.03}>Inclinación alterna</TiltInText>
```
