---
title: "Teselado Penrose"
description: "Teselado de Penrose (P3) con rombos que se encogen bajo el puntero y respiran con onda ambiental."
category: backgrounds
component: "PenroseBackground"
props:
  - name: "size"
    label: "Tamaño rombo (px)"
    type: "number"
    default: 70
    min: 30
    max: 150
    step: 5
  - name: "spin"
    label: "Giro (rpm)"
    type: "number"
    default: 1
    min: 0
    max: 5
    step: 0.1
  - name: "shrink"
    label: "Encogimiento"
    type: "number"
    default: 1
    min: 0
    max: 1
    step: 0.05
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 200
    min: 50
    max: 500
    step: 10
  - name: "wave"
    label: "Onda ambiental"
    type: "number"
    default: 0.03
    min: 0
    max: 0.2
    step: 0.01
  - name: "decay"
    label: "Persistencia"
    type: "number"
    default: 0.975
    min: 0.8
    max: 0.999
    step: 0.001
  - name: "alpha"
    label: "Opacidad flacos"
    type: "number"
    default: 0.18
    min: 0
    max: 1
    step: 0.02
  - name: "secondary"
    label: "Opacidad gordos (fracción)"
    type: "number"
    default: 0.5
    min: 0
    max: 1
    step: 0.05
  - name: "color"
    label: "Color"
    type: "color"
---

## Uso

Teselado P3 de Penrose (subdivisión de Robinson). Rombos flacos y gordos con tonos opcionales (--penrose-tone-1/2). El puntero los encoge; una onda diagonal los hace respirar.

```tsx
<PenroseBackground
  size={70}
  spin={1}
  shrink={1}
  radius={200}
  wave={0.03}
  decay={0.975}
  alpha={0.18}
  secondary={0.5}
  color={""} />
```
