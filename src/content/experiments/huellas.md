---
title: "Huellas"
description: "Un animal camina siguiendo al puntero y deja huellas que se desvanecen."
category: pendiente
component: "HuellasBackground"
props:
  - name: "step"
    label: "Paso (px)"
    type: "number"
    default: 48
    min: 10
    max: 150
    step: 1
  - name: "life"
    label: "Duración (s)"
    type: "number"
    default: 6
    min: 1
    max: 30
    step: 0.5
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 14
    min: 4
    max: 50
    step: 1
  - name: "spread"
    label: "Separación"
    type: "number"
    default: 0.9
    min: 0
    max: 3
    step: 0.05
---

## Uso

Un animal camina siguiendo al puntero y deja huellas que se desvanecen.

```tsx
<HuellasBackground step={48} life={6} />
```
