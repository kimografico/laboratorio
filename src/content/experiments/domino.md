---
title: "Dominó"
description: "Filas de fichas: tocar una desencadena la caída en cadena. Después se vuelven a levantar."
category: pendiente
component: "DominoBackground"
props:
  - name: "h"
    label: "Altura de ficha (px)"
    type: "number"
    default: 30
    min: 10
    max: 80
    step: 1
  - name: "gap"
    label: "Separación (px)"
    type: "number"
    default: 14
    min: 6
    max: 40
    step: 1
  - name: "sp"
    label: "Velocidad de caída"
    type: "number"
    default: 3.5
    min: 0.5
    max: 10
    step: 0.5
  - name: "up"
    label: "Levantar tras (s)"
    type: "number"
    default: 4
    min: 0.5
    max: 20
    step: 0.5
---

## Uso

Tocar una ficha desencadena la caída en cadena; después se vuelven a levantar.

```tsx
<DominoBackground h={30} gap={14} />
```
