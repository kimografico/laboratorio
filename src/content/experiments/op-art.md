---
title: "Op-art"
description: "Tablero de ajedrez ondulante; el puntero lo abomba como una lente."
category: pendiente
component: "OpArtBackground"
props:
  - name: "n"
    label: "Casillas"
    type: "number"
    default: 28
    min: 5
    max: 80
    step: 1
  - name: "amp"
    label: "Ondulación"
    type: "number"
    default: 14
    min: 0
    max: 50
    step: 1
  - name: "lens"
    label: "Lente"
    type: "number"
    default: 0.9
    min: 0
    max: 3
    step: 0.05
  - name: "rad"
    label: "Alcance del puntero (px)"
    type: "number"
    default: 220
    min: 20
    max: 600
    step: 10
---

## Uso

Tablero de ajedrez ondulante que el puntero abomba como una lente.

```tsx
<OpArtBackground n={28} amp={14} />
```
