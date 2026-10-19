---
title: "Jardín de anguilas"
description: "Anguilas de jardín que se esconden en sus madrigueras al acercar el ratón y vuelven a salir con suavidad. Dos planos de profundidad: cercanas (con ojo y contorno) y lejanas (silueta)."
category: naturaleza
component: "GardenEelBackground"
props:
  - name: "near"
    label: "Cercanas"
    type: "number"
    default: 30
    min: 0
    max: 30
    step: 1
  - name: "far"
    label: "Lejanas"
    type: "number"
    default: 30
    min: 0
    max: 30
    step: 1
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 320
    min: 60
    max: 400
    step: 5
  - name: "reach"
    label: "Dist. huida (px)"
    type: "number"
    default: 200
    min: 50
    max: 400
    step: 10
  - name: "retract"
    label: "Retracción (0-1)"
    type: "number"
    default: 0.05
    min: 0
    max: 0.5
    step: 0.01
  - name: "heal"
    label: "Recuperación"
    type: "number"
    default: 0.97
    min: 0.9
    max: 0.999
    step: 0.001
  - name: "current"
    label: "Corriente (rad)"
    type: "number"
    default: 0.05
    min: 0
    max: 1.5
    step: 0.05
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.3
    min: 0.05
    max: 1
    step: 0.05
  - name: "lineWidth"
    label: "Grosor (px)"
    type: "number"
    default: 1.1
    min: 0.5
    max: 3
    step: 0.1
---

## Uso

Anguilas que ondulan con la corriente y se esconden al detectar el puntero cerca de su cabeza. `near` tienen ojo y madriguera; `far` son solo silueta para dar profundidad.

```tsx
<GardenEelBackground near={30} far={30} size={320} reach={200} retract={0.05} heal={0.97} current={0.05} />
```
