---
title: "Bisel"
description: "Baldosas biseladas iluminadas por una luz que sigue al puntero."
category: pendiente
component: "BevelBackground"
props:
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 56
    min: 8
    max: 160
    step: 1
  - name: "gap"
    label: "Separación (px)"
    type: "number"
    default: 6
    min: 0
    max: 40
    step: 1
  - name: "layout"
    label: "Disposición"
    type: "select"
    default: "grid"
    options: ["grid", "brick"]
  - name: "radius"
    label: "Alcance de la luz (px)"
    type: "number"
    default: 280
    min: 40
    max: 600
    step: 10
  - name: "lightHeight"
    label: "Altura de la luz"
    type: "number"
    default: 0.35
    min: 0
    max: 1
    step: 0.05
  - name: "intensity"
    label: "Intensidad"
    type: "number"
    default: 1
    min: 0
    max: 2
    step: 0.05
  - name: "ambient"
    label: "Brillo ambiente"
    type: "number"
    default: 0.07
    min: 0
    max: 0.5
    step: 0.01
  - name: "bevel"
    label: "Grosor del bisel (px)"
    type: "number"
    default: 2
    min: 0.5
    max: 8
    step: 0.5
  - name: "ease"
    label: "Suavizado"
    type: "number"
    default: 0.15
    min: 0.01
    max: 0.5
    step: 0.01
  - name: "color"
    label: "Color"
    type: "color"
    default: "rgba(255, 255, 255, 1)"
  - name: "background"
    label: "Fondo"
    type: "color"
    default: "#3a3633"
---

## Uso

Cada baldosa tiene cuatro aristas biseladas; una luz a `lightHeight` sobre el plano las alumbra según su normal, con atenuación dentro de `radius`. `layout="brick"` desplaza filas alternas medio ladrillo. Sin puntero, la luz recorre el lienzo sola.

```tsx
<BevelBackground size={56} gap={6} layout="grid" radius={280} intensity={1} />
```
