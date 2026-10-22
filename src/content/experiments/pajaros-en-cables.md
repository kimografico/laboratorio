---
title: "Pájaros en cables"
description: "Pájaros posados en cables. Si te acercas echan a volar y aterrizan en otro sitio."
category: pendiente
component: "PajarosEnCablesBackground"
props:
  - name: "n"
    label: "Pájaros"
    type: "number"
    default: 22
    min: 1
    max: 100
    step: 1
  - name: "wires"
    label: "Cables"
    type: "number"
    default: 4
    min: 1
    max: 10
    step: 1
  - name: "scare"
    label: "Distancia de susto (px)"
    type: "number"
    default: 110
    min: 0
    max: 400
    step: 10
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 9
    min: 3
    max: 30
    step: 1
---

## Uso

Si te acercas, los pájaros echan a volar y aterrizan en otro sitio.

```tsx
<PajarosEnCablesBackground n={22} wires={4} />
```
