---
title: Tracking Text
description: El texto se abre y se cierra ajustando el espaciado entre letras mientras aparece. Elegante para cabeceras y kickers.
category: texts
component: TrackingInText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración (s)
    type: number
    default: 1.2
    min: 0.2
    max: 4
    step: 0.1
  - name: delay
    label: Retraso (s)
    type: number
    default: 0
    min: 0
    max: 3
    step: 0.1
  - name: spread
    label: Espaciado inicial (em)
    type: number
    default: 0.4
    min: 0
    max: 1.5
    step: 0.05
  - name: loop
    label: Bucle
    type: boolean
    default: false
---

## Uso

Anima `letter-spacing` y la opacidad sobre el bloque completo. Muy usado en subtítulos de sección.

```tsx
<TrackingInText spread={0.5}>NUEVA COLECCIÓN</TrackingInText>
<TrackingInText duration={2} spread={0.8}>Espaciado amplio</TrackingInText>
```
