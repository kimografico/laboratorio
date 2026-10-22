---
title: "Péndulo doble 2"
description: "Varios péndulos casi idénticos que se separan por caos. El puntero los atrae hacia su ángulo."
category: pendiente
component: "PenduloDoble2Background"
props:
  - name: "n"
    label: "Péndulos"
    type: "number"
    default: 12
    min: 1
    max: 60
    step: 1
  - name: "trail"
    label: "Estela"
    type: "number"
    default: 160
    min: 10
    max: 600
    step: 10
  - name: "spd"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0.1
    max: 3
    step: 0.05
  - name: "damp"
    label: "Amortiguación"
    type: "number"
    default: 0.02
    min: 0
    max: 0.2
    step: 0.005
  - name: "push"
    label: "Atracción del puntero"
    type: "number"
    default: 3
    min: 0
    max: 15
    step: 0.5
  - name: "rod"
    label: "Mostrar varillas"
    type: "number"
    default: 1
    min: 0
    max: 1
    step: 1
---

## Uso

Péndulos casi idénticos que se separan por caos; el puntero los atrae hacia su ángulo.

```tsx
<PenduloDoble2Background n={12} trail={160} />
```
