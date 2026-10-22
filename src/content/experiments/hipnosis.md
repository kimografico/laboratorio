---
title: "Hipnosis"
description: "Espiral de puntos que gira. El puntero la centra y su posición horizontal cambia la torsión."
category: pendiente
component: "HipnosisBackground"
props:
  - name: "arms"
    label: "Brazos"
    type: "number"
    default: 5
    min: 1
    max: 16
    step: 1
  - name: "tw"
    label: "Torsión"
    type: "number"
    default: 0.012
    min: 0
    max: 0.1
    step: 0.001
  - name: "sp"
    label: "Velocidad"
    type: "number"
    default: 0.8
    min: 0
    max: 5
    step: 0.1
  - name: "gap"
    label: "Separación (px)"
    type: "number"
    default: 12
    min: 3
    max: 40
    step: 1
  - name: "size"
    label: "Tamaño del punto (px)"
    type: "number"
    default: 3
    min: 0.5
    max: 8
    step: 0.5
---

## Uso

La espiral de puntos gira; el puntero la centra y su posición horizontal cambia la torsión.

```tsx
<HipnosisBackground arms={5} tw={0.012} />
```
