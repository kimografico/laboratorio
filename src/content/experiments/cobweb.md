---
title: "Telaraña"
description: "Telaraña que se teje desde una esquina con hilos vibrantes, gotas de rocío y reacción al puntero."
category: naturaleza
component: "CobwebBackground"
props:
  - name: "corner"
    label: "Esquina"
    type: "select"
    default: "tl"
    options: ["tl", "tr", "bl", "br"]
  - name: "spokes"
    label: "Hilos radiales"
    type: "number"
    default: 11
    min: 3
    max: 30
    step: 1
  - name: "links"
    label: "Uniones por par"
    type: "number"
    default: 30
    min: 1
    max: 30
    step: 1
  - name: "build"
    label: "Tiempo de construcción (s)"
    type: "number"
    default: 0
    min: 0
    max: 120
    step: 1
  - name: "sag"
    label: "Hundimiento"
    type: "number"
    default: 0.1
    min: 0
    max: 0.3
    step: 0.01
  - name: "dew"
    label: "Probabilidad rocío"
    type: "number"
    default: 0.25
    min: 0
    max: 1
    step: 0.05
  - name: "kick"
    label: "Empuje puntero"
    type: "number"
    default: 0.5
    min: 0
    max: 1
    step: 0.01
  - name: "tension"
    label: "Tensión"
    type: "number"
    default: 0.25
    min: 0
    max: 0.4
    step: 0.01
  - name: "damping"
    label: "Amortiguación"
    type: "number"
    default: 0.85
    min: 0.5
    max: 0.99
    step: 0.01
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 150
    min: 20
    max: 300
    step: 10
  - name: "breeze"
    label: "Brisa (px)"
    type: "number"
    default: 30
    min: 0
    max: 50
    step: 1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.02
  - name: "lineWidth"
    label: "Grosor línea"
    type: "number"
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: "color"
    label: "Color"
    type: "color"
---

## Uso

Telaraña procedimental que se teje desde una esquina. Los hilos vibran con brisa ambiental y reaccionan al puntero transmitiendo la vibración. Algunas uniones llevan gotas de rocío.

```tsx
<CobwebBackground
  corner="tl"
  spokes={11}
  links={30}
  build={0}
  sag={0.1}
  dew={0.25}
  kick={0.5}
  tension={0.25}
  damping={0.85}
  radius={150}
  breeze={30}
  alpha={0.3}
  lineWidth={1}
  color={""} />
```
