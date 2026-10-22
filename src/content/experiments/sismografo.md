---
title: "Sismógrafo"
description: "Papel que avanza trazando vibraciones. Mover el ratón o hacer clic provoca terremotos."
category: pendiente
component: "SismografoBackground"
props:
  - name: "ch"
    label: "Canales"
    type: "number"
    default: 3
    min: 1
    max: 8
    step: 1
  - name: "sp"
    label: "Velocidad del papel"
    type: "number"
    default: 120
    min: 10
    max: 400
    step: 5
  - name: "noise"
    label: "Ruido base"
    type: "number"
    default: 4
    min: 0
    max: 30
    step: 1
  - name: "gain"
    label: "Sensibilidad"
    type: "number"
    default: 1
    min: 0
    max: 5
    step: 0.1
  - name: "dec"
    label: "Amortiguación"
    type: "number"
    default: 0.95
    min: 0.8
    max: 0.999
    step: 0.001
---

## Uso

El papel avanza trazando vibraciones; mover el ratón o hacer clic provoca terremotos.

```tsx
<SismografoBackground ch={3} sp={120} />
```
