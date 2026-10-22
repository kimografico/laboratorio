---
title: "Nevada acumulada"
description: "La nieve cae y se acumula formando un perfil que se asienta solo; el puntero la barre."
category: pendiente
component: "NevadaAcumuladaBackground"
props:
  - name: "n"
    label: "Copos"
    type: "number"
    default: 800
    min: 50
    max: 3000
    step: 50
  - name: "wind"
    label: "Viento"
    type: "number"
    default: 0.15
    min: -1
    max: 1
    step: 0.05
  - name: "acc"
    label: "Acumulación"
    type: "number"
    default: 4
    min: 0
    max: 20
    step: 0.5
  - name: "rad"
    label: "Radio de barrido"
    type: "number"
    default: 70
    min: 10
    max: 300
    step: 5
  - name: "size"
    label: "Tamaño del copo"
    type: "number"
    default: 2
    min: 0.5
    max: 8
    step: 0.1
---

## Uso

Nieve que se acumula en el suelo. El puntero barre la capa acumulada.

```tsx
<NevadaAcumuladaBackground n={800} wind={0.15} acc={4} />
```
