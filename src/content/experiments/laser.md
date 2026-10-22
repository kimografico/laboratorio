---
title: "Láser"
description: "Un rayo láser sale del centro hacia el puntero y rebota en espejos. Clic = nuevos espejos."
category: pendiente
component: "LaserBackground"
props:
  - name: "n"
    label: "Espejos"
    type: "number"
    default: 6
    min: 0
    max: 20
    step: 1
  - name: "b"
    label: "Rebotes"
    type: "number"
    default: 12
    min: 1
    max: 40
    step: 1
  - name: "w"
    label: "Grosor del haz (px)"
    type: "number"
    default: 2
    min: 0.5
    max: 8
    step: 0.1
  - name: "len"
    label: "Longitud del espejo (px)"
    type: "number"
    default: 140
    min: 20
    max: 400
    step: 10
---

## Uso

El haz sale del centro hacia el puntero y rebota en los espejos; el clic los renueva.

```tsx
<LaserBackground n={6} len={140} />
```
