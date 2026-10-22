---
title: "Lombrices"
description: "Lombrices que reptan y se apartan del puntero (miedo negativo = lo persiguen)."
category: pendiente
component: "LombricesBackground"
props:
  - name: "n"
    label: "Lombrices"
    type: "number"
    default: 10
    min: 1
    max: 40
    step: 1
  - name: "len"
    label: "Segmentos"
    type: "number"
    default: 26
    min: 4
    max: 80
    step: 1
  - name: "w"
    label: "Grosor (px)"
    type: "number"
    default: 6
    min: 1
    max: 20
    step: 0.5
  - name: "sp"
    label: "Velocidad (px/s)"
    type: "number"
    default: 70
    min: 10
    max: 300
    step: 5
  - name: "fear"
    label: "Miedo"
    type: "number"
    default: 0.6
    min: -1
    max: 2
    step: 0.1
---

## Uso

Las lombrices reptan y se apartan del puntero; con `fear` negativo lo persiguen.

```tsx
<LombricesBackground n={10} fear={0.6} />
```
