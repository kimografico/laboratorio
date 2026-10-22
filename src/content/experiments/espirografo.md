---
title: "Espirógrafo"
description: "Dos fasores girando: el puntero cambia la proporción entre ellos (X) y la velocidad (Y)."
category: pendiente
component: "EspirografoBackground"
props:
  - name: "n"
    label: "Frecuencia A"
    type: "number"
    default: 5
    min: 1
    max: 20
    step: 1
  - name: "m"
    label: "Frecuencia B"
    type: "number"
    default: -7
    min: -20
    max: 20
    step: 1
  - name: "layers"
    label: "Capas"
    type: "number"
    default: 10
    min: 1
    max: 40
    step: 1
  - name: "r"
    label: "Radio"
    type: "number"
    default: 0.3
    min: 0.05
    max: 0.5
    step: 0.01
  - name: "d"
    label: "Proporción B"
    type: "number"
    default: 0.55
    min: 0
    max: 1.5
    step: 0.01
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 0.5
    min: 0
    max: 3
    step: 0.05
  - name: "lw"
    label: "Grosor (px)"
    type: "number"
    default: 1.2
    min: 0.2
    max: 5
    step: 0.1
---

## Uso

Dos fasores girando; el puntero cambia la proporción entre ellos y la velocidad.

```tsx
<EspirografoBackground n={5} m={-7} layers={10} />
```
