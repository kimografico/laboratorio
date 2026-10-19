---
title: Network II
description: Red de puntos conectados con una capa extra de puntos sueltos que flotan sin conectarse y una rejilla espacial para más rendimiento.
category: geometria
component: NetworkBackground2
props:
  - name: density
    label: Conectados
    type: number
    default: 0.6
    min: 0.1
    max: 3
    step: 0.1
  - name: scatter
    label: Sueltos
    type: number
    default: 1.2
    min: 0
    max: 6
    step: 0.1
  - name: link
    label: Enlace (px)
    type: number
    default: 120
    min: 40
    max: 300
    step: 10
  - name: speed
    label: Deriva
    type: number
    default: 0.3
    min: 0
    max: 2
    step: 0.1
  - name: radius
    label: Radio del puntero
    type: number
    default: 200
    min: 40
    max: 500
    step: 10
  - name: attract
    label: Atracción
    type: number
    default: 0.04
    min: 0
    max: 0.3
    step: 0.01
  - name: dot
    label: Radio del punto
    type: number
    default: 1.6
    min: 0.5
    max: 6
    step: 0.1
  - name: color
    label: Color
    type: color
---

## Uso

`scatter` controla los puntos sueltos. Usa una rejilla espacial para comparar solo celdas vecinas.

```tsx
<NetworkBackground2 density={0.6} scatter={1.2} link={120} />
```
