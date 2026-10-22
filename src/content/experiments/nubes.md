---
title: "Nubes"
description: "Nubes blandas que se funden al cruzarse. El puntero sopla viento."
category: pendiente
component: "NubesBackground"
props:
  - name: "n"
    label: "Nubes"
    type: "number"
    default: 8
    min: 1
    max: 40
    step: 1
  - name: "puff"
    label: "Esponjosidad"
    type: "number"
    default: 6
    min: 2
    max: 20
    step: 1
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 70
    min: 20
    max: 200
    step: 5
  - name: "wind"
    label: "Viento"
    type: "number"
    default: 1.2
    min: 0
    max: 5
    step: 0.1
---

## Uso

Las nubes se funden al cruzarse y el puntero sopla viento.

```tsx
<NubesBackground n={8} puff={6} />
```
