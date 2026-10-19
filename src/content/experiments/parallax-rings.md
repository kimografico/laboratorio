---
title: Parallax Rings
description: Anillos a distintas profundidades que se desplazan con el puntero creando paralaje.
category: geometria
component: RingsBackground
props:
  - name: count
    label: Anillos
    type: number
    default: 20
    min: 2
    max: 60
    step: 1
  - name: strength
    label: Fuerza paralaje
    type: number
    default: 200
    min: 0
    max: 300
    step: 10
  - name: spread
    label: Reparto paralaje
    type: number
    default: 1.75
    min: 0
    max: 5
    step: 0.05
  - name: ease
    label: Suavizado
    type: number
    default: 0.03
    min: 0.005
    max: 0.2
    step: 0.005
  - name: alpha
    label: Opacidad
    type: number
    default: 0.2
    min: 0
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor
    type: number
    default: 0.5
    min: 0.5
    max: 4
    step: 0.5
  - name: lineDepth
    label: Grosor por profundidad
    type: number
    default: 3
    min: 0
    max: 5
    step: 0.05
  - name: drift
    label: Deriva
    type: number
    default: 1
    min: 0
    max: 5
    step: 0.1
  - name: color
    label: Color
    type: color
---

## Uso

Los anillos grandes se sienten más cercanos y se mueven más. `strength` acentúa el desplazamiento, `spread` amplia la diferencia de paralaje entre anillos, `lineDepth` engorda los más cercanos y `drift` multiplica la deriva flotante.

```tsx
<RingsBackground count={14} strength={80} spread={0.5} lineDepth={0.5} />
```
