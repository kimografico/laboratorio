---
title: "Filotaxis"
description: "Espiral de Filotaxis (ángulo áureo) con puntos que reaccionan al puntero hinchándose y desplazándose."
category: backgrounds
component: "PhyllotaxisBackground"
props:
  - name: "count"
    label: "Puntos"
    type: "number"
    default: 1500
    min: 100
    max: 5000
    step: 50
  - name: "size"
    label: "Radio base (px)"
    type: "number"
    default: 6
    min: 2
    max: 20
    step: 1
  - name: "drift"
    label: "Deriva ángulo (°)"
    type: "number"
    default: 0.15
    min: 0
    max: 1
    step: 0.01
  - name: "spin"
    label: "Giro (rpm)"
    type: "number"
    default: 0.5
    min: 0
    max: 5
    step: 0.1
  - name: "swell"
    label: "Hinchazón"
    type: "number"
    default: 3
    min: 0
    max: 3
    step: 0.1
  - name: "push"
    label: "Empuje (px)"
    type: "number"
    default: 20
    min: 0
    max: 100
    step: 1
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 350
    min: 30
    max: 500
    step: 10
  - name: "decay"
    label: "Persistencia"
    type: "number"
    default: 0.92
    min: 0.8
    max: 0.999
    step: 0.001
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.22
    min: 0
    max: 1
    step: 0.02
  - name: "color"
    label: "Color"
    type: "color"
---

## Uso

Puntos en espiral con ángulo áureo (137.5°). El puntero los hincha y empuja; una onda ambiental viaja hacia fuera. Sprites por cubo de tamaño para rendimiento.

```tsx
<PhyllotaxisBackground
  count={1500}
  size={6}
  drift={0.15}
  spin={0.5}
  swell={3}
  push={20}
  radius={350}
  decay={0.92}
  alpha={0.22}
  color={""} />
```
