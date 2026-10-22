---
title: "Huevos fritos"
description: "Clic = nuevo huevo. Las claras se funden, las yemas no. El ratón inclina la sartén."
category: pendiente
component: "HuevosFritosBackground"
props:
  - name: "tilt"
    label: "Inclinación"
    type: "number"
    default: 1.2
    min: 0
    max: 5
    step: 0.1
  - name: "fric"
    label: "Fricción"
    type: "number"
    default: 0.95
    min: 0.8
    max: 0.995
    step: 0.005
  - name: "yolk"
    label: "Tamaño de la yema"
    type: "number"
    default: 0.34
    min: 0.05
    max: 0.6
    step: 0.01
  - name: "size"
    label: "Radio de la clara (px)"
    type: "number"
    default: 65
    min: 20
    max: 160
    step: 5
  - name: "max"
    label: "Máx. huevos"
    type: "number"
    default: 25
    min: 1
    max: 80
    step: 1
---

## Uso

El clic añade un huevo; las claras se funden y el ratón inclina la sartén.

```tsx
<HuevosFritosBackground tilt={1.2} size={65} />
```
