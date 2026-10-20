---
title: "Guirnalda de luces"
description: "Guirnaldas de bombillas que cuelgan, se mecen y se encienden con el puntero o un clic."
category: pendiente
component: "LightsBackground"
props:
  - name: "strands"
    label: "Guirnaldas"
    type: "number"
    default: 3
    min: 1
    max: 10
    step: 1
  - name: "bulbs"
    label: "Bombillas"
    type: "number"
    default: 14
    min: 3
    max: 40
    step: 1
  - name: "sag"
    label: "Holgura"
    type: "number"
    default: 0.12
    min: 0
    max: 0.5
    step: 0.01
  - name: "size"
    label: "Radio bombilla (px)"
    type: "number"
    default: 7
    min: 2
    max: 20
    step: 0.5
  - name: "wind"
    label: "Brisa"
    type: "number"
    default: 0.4
    min: 0
    max: 2
    step: 0.05
  - name: "damping"
    label: "Amortiguación"
    type: "number"
    default: 0.93
    min: 0.85
    max: 0.99
    step: 0.005
  - name: "glow"
    label: "Alcance de luz (px)"
    type: "number"
    default: 170
    min: 40
    max: 400
    step: 5
  - name: "pulse"
    label: "Pulso (px/s)"
    type: "number"
    default: 600
    min: 100
    max: 2000
    step: 25
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 120
    min: 20
    max: 300
    step: 5
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.32
    min: 0
    max: 1
    step: 0.01
  - name: "lineWidth"
    label: "Grosor línea"
    type: "number"
    default: 1
    min: 0.5
    max: 3
    step: 0.1
---

## Uso

Hereda el color de la página o se fija con `color`; la opacidad global se ajusta con `--lights-opacity` en CSS.

```tsx
<LightsBackground strands={3} bulbs={14} wind={0.4} />
```
