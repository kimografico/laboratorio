---
title: "Hormigas y migas"
description: "Clic = migas de azúcar. Las hormigas las recogen y las llevan al hormiguero. Huyen del puntero."
category: pendiente
component: "HormigasYMigasBackground"
props:
  - name: "n"
    label: "Hormigas"
    type: "number"
    default: 30
    min: 2
    max: 150
    step: 1
  - name: "sp"
    label: "Velocidad (px/s)"
    type: "number"
    default: 90
    min: 10
    max: 300
    step: 5
  - name: "am"
    label: "Migas por clic"
    type: "number"
    default: 10
    min: 1
    max: 40
    step: 1
  - name: "flee"
    label: "Radio de huida (px)"
    type: "number"
    default: 70
    min: 0
    max: 300
    step: 5
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 2.6
    min: 1
    max: 8
    step: 0.2
---

## Uso

El clic reparte migas que las hormigas llevan al hormiguero; huyen del puntero.

```tsx
<HormigasYMigasBackground n={30} am={10} />
```
