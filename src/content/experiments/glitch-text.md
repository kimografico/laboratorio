---
title: Glitch Text
description: Un parpadeo ocasional desplaza dos copias del texto en rojo y cian. Un glitch contenido para títulos.
category: texts
component: GlitchText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración del ciclo (s)
    type: number
    default: 3
    min: 1
    max: 10
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

Dos pseudoelementos clonados se desplazan brevemente al final de cada ciclo. Mantén `intensity` baja para que no canse.

```tsx
<GlitchText>SEÑAL INESTABLE</GlitchText>
<GlitchText duration={5} intensity={0.6}>Glitch ocasional</GlitchText>
```
