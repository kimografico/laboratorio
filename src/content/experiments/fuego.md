---
title: "Fuego"
description: "Fuego celular clásico con paleta de llama; el puntero es una antorcha y el clic provoca una llamarada."
category: simulacion
component: "FuegoBackground"
props:
  - name: "b"
    label: "Tamaño de píxel"
    type: "number"
    default: 5
    min: 1
    max: 10
    step: 1
  - name: "decay"
    label: "Enfriamiento"
    type: "number"
    default: 3
    min: 1.1
    max: 6
    step: 0.1
  - name: "wind"
    label: "Viento"
    type: "number"
    default: 0.4
    min: -2
    max: 2
    step: 0.05
  - name: "base"
    label: "Base encendida"
    type: "number"
    default: 1
    min: 0
    max: 1
    step: 0.05
  - name: "bsize"
    label: "Llamarada (px)"
    type: "number"
    default: 50
    min: 10
    max: 200
    step: 1
  - name: "torch"
    label: "Radio de la antorcha (px)"
    type: "number"
    default: 25
    min: 0
    max: 120
    step: 1
  - name: "color"
    label: "Color de llama"
    type: "color"
    default: "#ffc800"
    themed: false
---

## Uso

Fuego celular con antorcha bajo el puntero. El clic lanza una llamarada.

```tsx
<FuegoBackground b={5} decay={3} torch={15} />
```
