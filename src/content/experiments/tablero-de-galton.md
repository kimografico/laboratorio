---
title: "Tablero de Galton"
description: "Bolas que caen entre clavijas y forman una campana de Gauss. Clic = suelta una bola; el ratón las empuja."
category: pendiente
component: "TableroDeGaltonBackground"
props:
  - name: "rows"
    label: "Filas de clavijas"
    type: "number"
    default: 10
    min: 4
    max: 20
    step: 1
  - name: "rate"
    label: "Caída por segundo"
    type: "number"
    default: 8
    min: 0
    max: 60
    step: 1
  - name: "grav"
    label: "Gravedad (px/s²)"
    type: "number"
    default: 700
    min: 100
    max: 3000
    step: 50
  - name: "bounce"
    label: "Rebote"
    type: "number"
    default: 0.5
    min: 0
    max: 1
    step: 0.05
  - name: "ball"
    label: "Tamaño de bola (px)"
    type: "number"
    default: 3.5
    min: 1
    max: 10
    step: 0.5
---

## Uso

Las bolas caen entre clavijas y forman una campana; el clic suelta una y el ratón las empuja.

```tsx
<TableroDeGaltonBackground rows={10} rate={8} />
```
