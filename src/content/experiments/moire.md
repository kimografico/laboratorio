---
title: Moiré
description: Dos tramas de anillos concéntricos que interfieren entre sí y siguen al puntero.
category: backgrounds
component: MoireBackground
props:
  - name: spacing
    label: Separación (px)
    type: number
    default: 14
    min: 4
    max: 40
    step: 1
  - name: detune
    label: Desajuste
    type: number
    default: 0.02
    min: 0
    max: 0.1
    step: 0.005
  - name: ease
    label: Suavizado
    type: number
    default: 0.05
    min: 0.01
    max: 0.3
    step: 0.01
  - name: drift
    label: Deriva (px)
    type: number
    default: 40
    min: 0
    max: 150
    step: 5
  - name: lineWidth
    label: Grosor
    type: number
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: color
    label: Color
    type: color
    default: "rgba(0, 0, 0, 0.2)"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

`spacing` abre o cierra los anillos y `detune` separa ligeramente las dos tramas: cuanto mayor, más viva es la interferencia. `ease` controla la rapidez con la que la segunda trama sigue al puntero y `drift` la amplitud de su deriva en reposo.

```tsx
<MoireBackground spacing={14} detune={0.02} ease={0.05} drift={40} />
```
