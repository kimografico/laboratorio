---
title: Wave Text
description: Los caracteres ondulan suavemente en vertical formando una ola continua. Movimiento discreto para logotipos y títulos.
category: texts
component: WaveText
props:
  - name: children
    label: Texto
    type: text
  - name: duration
    label: Duración del ciclo (s)
    type: number
    default: 2
    min: 0.5
    max: 8
    step: 0.1
  - name: stagger
    label: Desfase por carácter (s)
    type: number
    default: 0.08
    min: 0
    max: 0.5
    step: 0.01
  - name: amplitude
    label: Amplitud (em)
    type: number
    default: 0.35
    min: 0
    max: 1.5
    step: 0.05
  - name: loop
    label: Bucle
    type: boolean
    default: true
  - name: separator
    label: Separador
    type: text
    default: " "
---

## Uso

Onda continua por carácter con `translateY`. El `stagger` define la velocidad de la ola.

```tsx
<WaveText amplitude={0.3}>Ondula suavemente</WaveText>
<WaveText duration={3} stagger={0.12} amplitude={0.5}>Ola lenta</WaveText>
```
