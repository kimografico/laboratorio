---
title: Aurora
description: Manchas de color que flotan en órbitas suaves y huyen del puntero como una aurora.
category: naturaleza
component: AuroraBackground
props:
  - name: colors
    label: Colores
    type: colors
    default: ["#ee3d3d", "#f5a623", "#2b4eff"]
  - name: size
    label: Tamaño de mancha
    type: number
    default: 0.75
    min: 0.1
    max: 1.5
    step: 0.05
  - name: opacity
    label: Opacidad
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.05
  - name: ease
    label: Suavizado
    type: number
    default: 0.05
    min: 0.002
    max: 0.08
    step: 0.002
  - name: avoid
    label: Huida del puntero
    type: number
    default: 1
    min: 0
    max: 2
    step: 0.1
---

## Uso

Cada color genera una mancha que sigue su propia órbita. Cuanto más bajo `ease`, más larga la estela entre manchas.

```tsx
<AuroraBackground colors={["#ee3d3d", "#f5a623", "#2b4eff"]} size={0.75} avoid={1} />
```
