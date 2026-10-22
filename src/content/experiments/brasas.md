---
title: "Brasas"
description: "Ascuas que suben y se enfrían. El puntero sopla sobre ellas; clic = chispazo."
category: pendiente
component: "BrasasBackground"
props:
  - name: "rate"
    label: "Ascuas por segundo"
    type: "number"
    default: 140
    min: 10
    max: 400
    step: 5
  - name: "rise"
    label: "Velocidad de subida (px/s)"
    type: "number"
    default: 90
    min: 10
    max: 300
    step: 5
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 2.5
    min: 0.5
    max: 8
    step: 0.5
  - name: "blow"
    label: "Soplido del puntero"
    type: "number"
    default: 1.2
    min: 0
    max: 4
    step: 0.1
---

## Uso

Ascuas que suben desde la base; el puntero sopla sobre ellas y el clic provoca un chispazo.

```tsx
<BrasasBackground rate={140} rise={90} size={2.5} />
```
