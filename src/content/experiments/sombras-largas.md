---
title: "Sombras largas"
description: "Columnas con sombras proyectadas desde el puntero, que hace de foco."
category: pendiente
component: "SombrasLargasBackground"
props:
  - name: "n"
    label: "Objetos"
    type: "number"
    default: 14
    min: 1
    max: 60
    step: 1
  - name: "r"
    label: "Tamaño (px)"
    type: "number"
    default: 26
    min: 5
    max: 80
    step: 1
  - name: "len"
    label: "Longitud de la sombra"
    type: "number"
    default: 1200
    min: 100
    max: 3000
    step: 50
  - name: "al"
    label: "Opacidad"
    type: "number"
    default: 0.35
    min: 0
    max: 1
    step: 0.05
---

## Uso

Las columnas proyectan sombras desde el puntero, que hace de foco.

```tsx
<SombrasLargasBackground n={14} len={1200} />
```
