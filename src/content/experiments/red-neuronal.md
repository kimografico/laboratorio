---
title: "Red neuronal"
description: "Neuronas que se disparan y propagan impulsos por las conexiones. El puntero las excita."
category: pendiente
component: "RedNeuronalBackground"
props:
  - name: "n"
    label: "Neuronas"
    type: "number"
    default: 60
    min: 5
    max: 300
    step: 1
  - name: "k"
    label: "Conexiones"
    type: "number"
    default: 3
    min: 1
    max: 10
    step: 1
  - name: "sp"
    label: "Velocidad del impulso"
    type: "number"
    default: 200
    min: 20
    max: 800
    step: 10
  - name: "rad"
    label: "Alcance del puntero (px)"
    type: "number"
    default: 100
    min: 0
    max: 300
    step: 10
  - name: "rnd"
    label: "Disparo espontáneo"
    type: "number"
    default: 0.1
    min: 0
    max: 1
    step: 0.01
---

## Uso

Las neuronas se disparan y propagan impulsos; el puntero las excita.

```tsx
<RedNeuronalBackground n={60} k={3} />
```
