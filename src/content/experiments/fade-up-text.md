---
title: Fade Up Text
description: Los caracteres aparecen uno tras otro con un leve fundido y un pequeño desplazamiento vertical. Pensado para títulos de entrada.
category: texts
component: FadeUpText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración (s)
    type: number
    default: 0.7
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
  - name: distance
    label: Desplazamiento (em)
    type: number
    default: 0.6
    min: 0
    max: 2
    step: 0.1
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

Entrada suave carácter a carácter con CSS puro. `separator` agrupa el texto en palabras para evitar cortes dentro de una misma palabra.

```tsx
<FadeUpText stagger={0.045}>Construye héroes que reaccionan</FadeUpText>
<FadeUpText duration={0.5} distance={1}>Subtítulo discreto</FadeUpText>
```
