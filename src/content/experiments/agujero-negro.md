---
title: "Agujero negro"
description: "Horizonte de sucesos, lente gravitacional sobre las estrellas y disco de acreción; el puntero lo mueve y el clic lanza una sonda."
category: naturaleza
component: "AgujeroNegroBackground"
props:
  - name: "rs"
    label: "Radio del horizonte"
    type: "number"
    default: 50
    min: 10
    max: 80
    step: 1
  - name: "ein"
    label: "Lente (× horizonte)"
    type: "number"
    default: 1
    min: 0
    max: 5
    step: 0.1
  - name: "tilt"
    label: "Inclinación del disco"
    type: "number"
    default: 0.15
    min: 0
    max: 1
    step: 0.01
  - name: "stars"
    label: "Estrellas"
    type: "number"
    default: 2500
    min: 100
    max: 3000
    step: 50
  - name: "disc"
    label: "Partículas del disco"
    type: "number"
    default: 4000
    min: 200
    max: 8000
    step: 100
  - name: "sp"
    label: "Rotación"
    type: "number"
    default: 2.5
    min: 0
    max: 3
    step: 0.05
  - name: "glow"
    label: "Brillo"
    type: "number"
    default: 1
    min: 0
    max: 1.5
    step: 0.05
  - name: "follow"
    label: "Seguimiento del ratón"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.01
  - name: "ease"
    label: "Easing del seguimiento"
    type: "number"
    default: 0.01
    min: 0.01
    max: 0.4
    step: 0.01
---

## Uso

Agujero negro con disco de acreción y lente gravitacional. El puntero lo desplaza y el clic lanza una sonda.

```tsx
<AgujeroNegroBackground rs={38} stars={900} disc={2500} />
```
