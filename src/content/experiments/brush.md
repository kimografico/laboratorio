---
title: "Pincel"
description: "Ensō y trazos sueltos de pincel seco que se dibujan y se desvanecen; un clic añade un trazo."
category: pendiente
component: "BrushBackground"
props:
  - name: "size"
    label: "Radio (px)"
    type: "number"
    default: 120
    min: 20
    max: 400
    step: 5
  - name: "width"
    label: "Grosor (px)"
    type: "number"
    default: 16
    min: 2
    max: 80
    step: 1
  - name: "bristles"
    label: "Cerdas"
    type: "number"
    default: 18
    min: 4
    max: 40
    step: 1
  - name: "dry"
    label: "Sequedad"
    type: "number"
    default: 0.6
    min: 0
    max: 1
    step: 0.01
  - name: "draw"
    label: "Dibujo (s)"
    type: "number"
    default: 1.3
    min: 0.2
    max: 5
    step: 0.1
  - name: "life"
    label: "Vida (s)"
    type: "number"
    default: 12
    min: 2
    max: 60
    step: 1
  - name: "intro"
    label: "Ensō inicial"
    type: "boolean"
    default: true
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.01
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--brush-opacity` en CSS.

```tsx
<BrushBackground size={120} width={16} dry={0.6} />
```
