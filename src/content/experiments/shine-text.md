---
title: Shine Text
description: Una luz cruza el texto de forma continua usando un degradado recortado sobre las letras. Acento sutil para titulares.
category: texts
component: ShineText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración del barrido (s)
    type: number
    default: 3
    min: 0.5
    max: 10
    step: 0.1
  - name: delay
    label: Retraso (s)
    type: number
    default: 0
    min: 0
    max: 5
    step: 0.1
  - name: angle
    label: Ángulo (°)
    type: number
    default: 100
    min: 0
    max: 360
    step: 5
  - name: loop
    label: Bucle
    type: boolean
    default: true
---

## Uso

El brillo se construye con `background-clip: text` y un degradado en `currentColor`, así que sigue el color del tema.

```tsx
<ShineText>Un titular con brillo</ShineText>
<ShineText duration={5} angle={120}>Brillo diagonal lento</ShineText>
```
