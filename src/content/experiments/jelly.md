---
title: Medusas
description: Medusas que ascienden a impulsos con la campana contrayéndose, tentáculos colgantes y profundidad.
category: backgrounds
component: JellyBackground
props:
  - name: near
    label: Cercanas
    type: number
    default: 4
    min: 0
    max: 12
    step: 1
  - name: far
    label: Lejanas
    type: number
    default: 4
    min: 0
    max: 12
    step: 1
  - name: size
    label: Radio de la campana (px)
    type: number
    default: 70
    min: 20
    max: 160
    step: 2
  - name: speed
    label: Velocidad
    type: number
    default: 0.5
    min: 0.1
    max: 2
    step: 0.05
  - name: avoid
    label: Distancia al puntero (px)
    type: number
    default: 220
    min: 0
    max: 500
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor línea
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Por defecto no dibuja fondo y hereda el color de la página (`currentColor`). Opcionalmente fija `color` o define `--jelly-color` y `--jelly-opacity` en CSS. `near`/`far` controlan cuántas medusas cercanas (con nervios y tentáculos) y lejanas (siluetas tenues) aparecen; `avoid` es la distancia a la que se apartan del puntero.

```tsx
<JellyBackground near={4} far={4} size={70} speed={0.5} color="#ffffff" />
```
