---
title: Flip Text
description: Texto que se voltea carácter a carácter con un efecto de cubo 3D, sin JavaScript en cliente.
category: texts
component: FlipText
props:
  - name: children
    label: Texto
    type: text
    default: "Your amazing text here"
  - name: duration
    label: Duración (s)
    type: number
    default: 4.5
    min: 0.5
    max: 12
    step: 0.5
  - name: delay
    label: Retraso (s)
    type: number
    default: 0
    min: 0
    max: 3
    step: 0.1
  - name: loop
    label: Bucle
    type: boolean
    default: true
  - name: separator
    label: Separador
    type: text
    default: " "
  - name: together
    label: Todo a la vez
    type: boolean
    default: false
---

## Uso

El texto se divide en caracteres y anima con CSS puro (`@property --flip-p`). `together` elimina el stagger.

```tsx
<FlipText duration={4.5} loop>Your amazing text here</FlipText>
<FlipText duration={1.6} loop={false} together>Todo a la vez</FlipText>
```
