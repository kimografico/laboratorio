---
title: "Laberinto con Luz"
description: "Laberinto perfecto con iluminación por raycasting DDA desde el puntero; la luz choca contra muros y se corta en esquinas."
category: geometria
component: "MazeLightBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 30
    min: 10
    max: 80
    step: 1
  - name: "genSpeed"
    label: "Velocidad generación"
    type: "number"
    default: 8
    min: 1
    max: 40
    step: 1
  - name: "hold"
    label: "Espera antes de disolverse (s)"
    type: "number"
    default: 14
    min: 2
    max: 60
    step: 1
  - name: "alpha"
    label: "Opacidad muros"
    type: "number"
    default: 0.45
    min: 0
    max: 1
    step: 0.02
  - name: "color"
    label: "Color muros"
    type: "color"
    default: ""
  - name: "glow"
    label: "Color luz"
    type: "color"
    default: "#d9822b"
  - name: "glowOpacity"
    label: "Opacidad luz"
    type: "number"
    default: 0.55
    min: 0
    max: 1
    step: 0.05
  - name: "rays"
    label: "Rayos"
    type: "number"
    default: 180
    min: 8
    max: 360
    step: 8
  - name: "lightRange"
    label: "Alcance luz (celdas)"
    type: "number"
    default: 5
    min: 3
    max: 30
    step: 1
  - name: "lightSoftness"
    label: "Suavizado luz"
    type: "number"
    default: 1
    min: 0.05
    max: 1
    step: 0.05
---

## Uso

Laberinto DFS con raycasting DDA exacto desde la posición del puntero. La luz forma un polígono de visibilidad recortado por los muros.

```tsx
<MazeLightBackground cell={30} hold={14} glow="#d9822b" rays={180} lightRange={12} />
```
