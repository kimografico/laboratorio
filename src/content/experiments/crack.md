---
title: "Grietas"
description: "Impactos que generan redes de grietas radiales con ramificación, anillos y facetas, como un cristal astillado. Al hacer clic se crea un impacto en el cursor."
category: simulacion
component: "CrackBackground"
props:
  - name: "interval"
    label: "Intervalo ambiental (s)"
    type: "number"
    default: 0
    min: 0
    max: 10
    step: 0.5
  - name: "size"
    label: "Alcance (px)"
    type: "number"
    default: 260
    min: 80
    max: 600
    step: 10
  - name: "rays"
    label: "Grietas radiales"
    type: "number"
    default: 9
    min: 3
    max: 24
    step: 1
  - name: "rings"
    label: "Anillos (0-5)"
    type: "number"
    default: 3
    min: 0
    max: 5
    step: 1
  - name: "branch"
    label: "Ramificación"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.05
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0.2
    max: 3
    step: 0.1
  - name: "life"
    label: "Vida (s)"
    type: "number"
    default: 14
    min: 4
    max: 30
    step: 1
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
    default: 1
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

Grietas que crecen desde el punto de impacto con ramificación orgánica y anillos concéntricos. El parámetro `interval` > 0 genera impactos automáticos; a 0 solo reacciona a clics.

```tsx
<CrackBackground interval={0} size={260} rays={9} rings={3} branch={0.3} />
```
