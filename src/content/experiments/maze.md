---
title: "Laberinto"
description: "Laberinto que se excava solo y por el que corren ondas de luz."
category: pendiente
component: "MazeBackground"
props:
  - name: "cell"
    label: "Celda (px)"
    type: "number"
    default: 30
    min: 10
    max: 80
    step: 1
  - name: "genSpeed"
    label: "Velocidad de generación"
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
  - name: "waveSpeed"
    label: "Velocidad de la luz (celdas/s)"
    type: "number"
    default: 14
    min: 2
    max: 60
    step: 1
  - name: "waveWidth"
    label: "Anchura del frente (celdas)"
    type: "number"
    default: 2.5
    min: 0.5
    max: 10
    step: 0.5
  - name: "waveLife"
    label: "Duración de la onda (s)"
    type: "number"
    default: 4
    min: 0.5
    max: 20
    step: 0.5
  - name: "ambient"
    label: "Ondas ambientales/s"
    type: "number"
    default: 0.4
    min: 0
    max: 5
    step: 0.1
  - name: "lineWidth"
    label: "Grosor de línea"
    type: "number"
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
  - name: "color"
    label: "Muros"
    type: "color"
    default: "rgba(0, 0, 0, 0.45)"
  - name: "glow"
    label: "Color de la luz"
    type: "color"
    default: "#d9822b"
  - name: "glowOpacity"
    label: "Opacidad de la luz"
    type: "number"
    default: 0.55
    min: 0
    max: 1
    step: 0.05
  - name: "background"
    label: "Fondo"
    type: "color"
    default: "#e0dad5"
---

## Uso

Laberinto perfecto generado con excavación por retroceso (DFS); se excava a `genSpeed` celdas por fotograma, se mantiene `hold` segundos y se disuelve para generar otro. La luz del puntero (y las ondas ambientales) viaja por los pasillos según BFS a `waveSpeed`, con frente de `waveWidth` celdas.

```tsx
<MazeBackground cell={30} hold={14} waveSpeed={14} glow="#d9822b" />
```
