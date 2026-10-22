---
title: "La ola"
description: "Gradas llenas de público haciendo la ola. Clic = lanza una ola desde ese punto."
category: pendiente
component: "LaOlaBackground"
props:
  - name: "rows"
    label: "Filas"
    type: "number"
    default: 5
    min: 1
    max: 12
    step: 1
  - name: "cols"
    label: "Personas por fila"
    type: "number"
    default: 30
    min: 5
    max: 80
    step: 1
  - name: "sp"
    label: "Velocidad (px/s)"
    type: "number"
    default: 420
    min: 50
    max: 1500
    step: 10
  - name: "wid"
    label: "Anchura de la ola (px)"
    type: "number"
    default: 160
    min: 20
    max: 600
    step: 10
  - name: "auto"
    label: "Olas automáticas (s)"
    type: "number"
    default: 6
    min: 0
    max: 30
    step: 1
---

## Uso

Las gradas hacen la ola; el clic la lanza desde ese punto.

```tsx
<LaOlaBackground rows={5} cols={30} />
```
