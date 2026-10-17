---
title: Hilos
description: Hilos que persiguen al puntero con retardo, grosor decreciente y ondulación lateral.
category: backgrounds
component: ThreadBackground
props:
  - name: threads
    label: Hilos
    type: number
    default: 3
    min: 1
    max: 10
    step: 1
  - name: length
    label: Puntos por hilo
    type: number
    default: 34
    min: 8
    max: 80
    step: 1
  - name: follow
    label: Seguimiento
    type: number
    default: 0.3
    min: 0.05
    max: 0.6
    step: 0.05
  - name: wobble
    label: Ondulación (px)
    type: number
    default: 7
    min: 0
    max: 30
    step: 1
  - name: lineWidth
    label: Grosor
    type: number
    default: 1.4
    min: 0.4
    max: 4
    step: 0.1
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.45)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`threads` y `length` fijan cuántos hilos hay y cuánto de largo; `follow` decide si se mueven rígidos o serpenteando y `wobble` añade la ondulación lateral. En reposo cada hilo recorre su propia órbita; al mover el puntero todos lo persiguen con distinto retardo.

```tsx
<ThreadBackground threads={3} length={34} follow={0.3} wobble={7} />
```
