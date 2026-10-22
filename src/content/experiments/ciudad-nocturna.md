---
title: "Ciudad nocturna"
description: "Edificios con ventanas que se encienden y apagan. El puntero enciende las cercanas."
category: pendiente
component: "CiudadNocturnaBackground"
props:
  - name: "on"
    label: "Ventanas encendidas"
    type: "number"
    default: 0.35
    min: 0
    max: 1
    step: 0.05
  - name: "rate"
    label: "Parpadeo por segundo"
    type: "number"
    default: 0.4
    min: 0
    max: 3
    step: 0.05
  - name: "rad"
    label: "Alcance del puntero (px)"
    type: "number"
    default: 120
    min: 20
    max: 400
    step: 10
  - name: "h"
    label: "Altura de los edificios"
    type: "number"
    default: 0.55
    min: 0.1
    max: 0.95
    step: 0.05
---

## Uso

Edificios con ventanas que se encienden y apagan; el puntero ilumina las cercanas.

```tsx
<CiudadNocturnaBackground rad={120} h={0.55} />
```
