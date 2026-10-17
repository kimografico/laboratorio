---
title: Blur In Text
description: Cada carácter entra desde un desenfoque hasta quedar nítido. Un efecto de foco suave para títulos y subtítulos.
category: texts
component: BlurInText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración (s)
    type: number
    default: 0.8
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
    default: 0.045
    min: 0
    max: 0.3
    step: 0.005
  - name: blur
    label: Desenfoque (px)
    type: number
    default: 10
    min: 1
    max: 30
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

Cada carácter anima `filter: blur()` y la opacidad. Con un `blur` alto el efecto es más marcado.

```tsx
<BlurInText blur={12}>Enfoca el mensaje</BlurInText>
<BlurInText duration={1.1} stagger={0.06}>Un subtítulo legible</BlurInText>
```
