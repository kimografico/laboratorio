---
title: Isolíneas 2
description: "Curvas de nivel (marching squares) sobre un campo de ruido con una colina bajo el puntero."
category: backgrounds
component: Contour2Background
props:
  - name: cell
    label: Celda (px)
    type: number
    default: 12
    min: 6
    max: 40
    step: 1
  - name: levels
    label: Niveles
    type: number
    default: 9
    min: 3
    max: 20
    step: 1
  - name: scale
    label: Escala
    type: number
    default: 0.005
    min: 0.001
    max: 0.02
    step: 0.0005
  - name: speed
    label: Velocidad
    type: number
    default: 0.0003
    min: 0
    max: 0.002
    step: 0.0001
  - name: bump
    label: Abultamiento
    type: number
    default: 1.2
    min: 0
    max: 3
    step: 0.1
  - name: radius
    label: Radio (px)
    type: number
    default: 170
    min: 60
    max: 500
    step: 10
  - name: ease
    label: Suavizado
    type: number
    default: 0.12
    min: 0.01
    max: 0.5
    step: 0.01
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.5
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.22)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

El relieve se genera como suma de senos sobre una malla y se dibujan curvas de nivel con *marching squares*. El puntero eleva el campo con un bulto gaussiano (`bump`, `radius`, `ease`), que le sigue con suavizado. Ajusta `cell` para la resolución de la malla y `levels` para el número de isolíneas.

```tsx
<Contour2Background cell={12} levels={9} scale={0.005} />
```
