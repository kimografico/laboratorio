---
title: Scale In Text
description: Los caracteres crecen desde un tamaño menor hasta su tamaño final con un fundido. Un "pop" contenido para titulares.
category: texts
component: ScaleInText
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
  - name: from
    label: Escala inicial
    type: number
    default: 0.6
    min: 0
    max: 1
    step: 0.05
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

Escala y opacidad animadas por carácter. Mantén `from` cerca de `1` para un resultado sobrio.

```tsx
<ScaleInText from={0.7}>Aparece sin exagerar</ScaleInText>
<ScaleInText duration={0.4} stagger={0.03}>Título rápido</ScaleInText>
```
