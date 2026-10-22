---
title: "Churretes"
description: "Clic = salpicadura de pintura que gotea y se funde con las demás."
category: pendiente
component: "ChurretesBackground"
props:
  - name: "size"
    label: "Grosor (px)"
    type: "number"
    default: 24
    min: 4
    max: 80
    step: 1
  - name: "drips"
    label: "Gotas por salpicadura"
    type: "number"
    default: 3
    min: 1
    max: 10
    step: 1
  - name: "spd"
    label: "Velocidad de caída (px/s)"
    type: "number"
    default: 90
    min: 10
    max: 300
    step: 5
  - name: "len"
    label: "Longitud del reguero (px)"
    type: "number"
    default: 260
    min: 20
    max: 800
    step: 10
  - name: "life"
    label: "Vida (s)"
    type: "number"
    default: 14
    min: 1
    max: 40
    step: 1
---

## Uso

Cada clic suelta una salpicadura de pintura que gotea y se funde con las demás.

```tsx
<ChurretesBackground size={24} drips={3} />
```
