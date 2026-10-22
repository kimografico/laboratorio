---
title: "Tinta"
description: "Mueve el ratón para dejar tinta que se funde; clic = gota grande."
category: pendiente
component: "TintaBackground"
props:
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 22
    min: 4
    max: 80
    step: 1
  - name: "life"
    label: "Duración (s)"
    type: "number"
    default: 4
    min: 0.5
    max: 20
    step: 0.5
  - name: "emit"
    label: "Emisión"
    type: "number"
    default: 25
    min: 0
    max: 200
    step: 1
  - name: "drift"
    label: "Deriva"
    type: "number"
    default: 12
    min: 0
    max: 100
    step: 1
---

## Uso

Mover el ratón deja tinta que se funde; el clic suelta una gota grande.

```tsx
<TintaBackground size={22} life={4} />
```
