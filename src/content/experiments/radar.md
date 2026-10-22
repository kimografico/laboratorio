---
title: "Radar"
description: "Un barrido ilumina los objetivos al pasar. Clic = añade un objetivo."
category: pendiente
component: "RadarBackground"
props:
  - name: "n"
    label: "Objetivos"
    type: "number"
    default: 18
    min: 0
    max: 100
    step: 1
  - name: "sp"
    label: "Giro"
    type: "number"
    default: 1.2
    min: 0.1
    max: 5
    step: 0.1
  - name: "fade"
    label: "Desvanecer"
    type: "number"
    default: 0.7
    min: 0.1
    max: 5
    step: 0.1
  - name: "rings"
    label: "Anillos"
    type: "number"
    default: 5
    min: 1
    max: 12
    step: 1
---

## Uso

El barrido ilumina los objetivos al pasar; el clic añade uno.

```tsx
<RadarBackground n={18} rings={5} />
```
