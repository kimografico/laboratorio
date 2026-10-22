---
title: "Cuna de Newton"
description: "Bolas colgantes que se transmiten el impulso. Clic = levanta bolas desde el lado izquierdo o derecho."
category: pendiente
component: "CunaDeNewtonBackground"
props:
  - name: "n"
    label: "Bolas"
    type: "number"
    default: 5
    min: 2
    max: 12
    step: 1
  - name: "len"
    label: "Longitud del hilo"
    type: "number"
    default: 0.45
    min: 0.15
    max: 0.85
    step: 0.01
  - name: "gr"
    label: "Gravedad"
    type: "number"
    default: 18
    min: 1
    max: 60
    step: 1
  - name: "damp"
    label: "Rozamiento"
    type: "number"
    default: 0.01
    min: 0
    max: 0.2
    step: 0.005
  - name: "lift"
    label: "Bolas levantadas"
    type: "number"
    default: 1
    min: 1
    max: 5
    step: 1
---

## Uso

Las bolas se transmiten el impulso; el clic levanta las de un extremo.

```tsx
<CunaDeNewtonBackground n={5} len={0.45} />
```
