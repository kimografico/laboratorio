---
title: "Sistema planetario"
description: "Estrella y planetas con órbitas keplerianas; el puntero actúa como una segunda masa y el clic lanza un planeta."
category: pendiente
component: "SistemaPlanetarioBackground"
props:
  - name: "n"
    label: "Planetas iniciales"
    type: "number"
    default: 6
    min: 1
    max: 20
    step: 1
  - name: "gm"
    label: "Gravedad de la estrella"
    type: "number"
    default: 8
    min: 0.5
    max: 30
    step: 0.5
  - name: "pm"
    label: "Masa del puntero"
    type: "number"
    default: 0.12
    min: 0
    max: 2
    step: 0.01
  - name: "trail"
    label: "Estela"
    type: "number"
    default: 220
    min: 10
    max: 1000
    step: 10
  - name: "ecc"
    label: "Excentricidad"
    type: "number"
    default: 0.15
    min: 0
    max: 0.8
    step: 0.01
---

## Uso

Sistema planetario con gravedad newtoniana. El puntero perturba las órbitas y el clic añade un planeta.

```tsx
<SistemaPlanetarioBackground n={6} gm={8} pm={0.12} />
```
