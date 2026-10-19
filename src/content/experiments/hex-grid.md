---
title: "Reticula hexagonal"
description: "Rejilla hexagonal solo linea sin relleno, con efecto hover que aumenta opacidad y grosor."
category: geometria
component: "HexGridBackground"
props:
  - name: "size"
    label: "Lado (px)"
    type: "number"
    default: 28
    min: 10
    max: 80
    step: 2
  - name: "lineWidth"
    label: "Grosor base (px)"
    type: "number"
    default: 0.5
    min: 0.5
    max: 4
    step: 0.1
  - name: "alpha"
    label: "Opacidad base"
    type: "number"
    default: 0.02
    min: 0.01
    max: 1
    step: 0.01
  - name: "hoverRadius"
    label: "Radio hover (px)"
    type: "number"
    default: 250
    min: 30
    max: 300
    step: 10
  - name: "hoverAlpha"
    label: "Factor opacidad hover"
    type: "number"
    default: 5
    min: 1
    max: 10
    step: 0.1
  - name: "hoverWidth"
    label: "Factor grosor hover"
    type: "number"
    default: 3.5
    min: 1
    max: 5
    step: 0.1
---

## Uso

Una rejilla de hexágonos de lado `size` dibujada solo con líneas (sin relleno). Al pasar el ratón, los hexágonos dentro del `hoverRadius` aumentan su opacidad (`hoverAlpha`) y grosor (`hoverWidth`). Hereda el color del tema (`--fg`) o se fija con la prop `color`.

```tsx
<HexGridBackground size={28} lineWidth={1} alpha={0.3} hoverRadius={120} hoverAlpha={2.5} hoverWidth={2.5} />
```
