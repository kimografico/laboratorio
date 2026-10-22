---
title: "Espiral de Ulam"
description: "Los primos sobre una espiral cuadrada forman diagonales. El puntero hace crecer los puntos cercanos."
category: pendiente
component: "EspiralDeUlamBackground"
props:
  - name: "step"
    label: "Separación (px)"
    type: "number"
    default: 10
    min: 3
    max: 40
    step: 1
  - name: "size"
    label: "Tamaño del punto (px)"
    type: "number"
    default: 3
    min: 0.5
    max: 10
    step: 0.5
  - name: "comp"
    label: "Mostrar compuestos"
    type: "number"
    default: 0
    min: 0
    max: 1
    step: 1
  - name: "rad"
    label: "Alcance del puntero (px)"
    type: "number"
    default: 160
    min: 0
    max: 400
    step: 10
  - name: "gain"
    label: "Crecimiento"
    type: "number"
    default: 2
    min: 0
    max: 8
    step: 0.1
---

## Uso

Los primos dibujan diagonales sobre una espiral cuadrada; el puntero hace crecer los puntos cercanos.

```tsx
<EspiralDeUlamBackground step={10} size={3} />
```
