---
title: Tela
description: Red de malla simulada que cuelga, ondea con el viento y responde al puntero.
category: simulacion
component: ClothBackground
props:
  - name: spacing
    label: Separación (px)
    type: number
    default: 40
    min: 10
    max: 90
    step: 1
  - name: gravity
    label: Gravedad
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.05
  - name: iterations
    label: Iteraciones
    type: number
    default: 10
    min: 1
    max: 15
    step: 1
  - name: wind
    label: Viento
    type: number
    default: 0.05
    min: 0
    max: 0.5
    step: 0.01
  - name: radius
    label: Radio del puntero (px)
    type: number
    default: 130
    min: 20
    max: 400
    step: 10
  - name: push
    label: Empuje
    type: number
    default: 0.7
    min: 0
    max: 3
    step: 0.1
  - name: damping
    label: Amortiguación
    type: number
    default: 0.99
    min: 0.9
    max: 1
    step: 0.005
  - name: pin
    label: Anclaje
    type: select
    default: "top"
    options:
      - top
      - edges
  - name: dot
    label: Puntos (px)
    type: number
    default: 3
    min: 0
    max: 5
    step: 0.1
  - name: lineWidth
    label: Grosor de línea
    type: number
    default: 1
    min: 0.5
    max: 5
    step: 0.5
  - name: color
    label: Color
    type: color
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0
    max: 1
    step: 0.02
---

## Uso

La malla se simula con restricciones: `spacing` controla el tamaño de los nudos y `iterations` cuántas pasas de rigididad se aplican por fotograma. Con `pin="top"` cuelga como una cortina; con `pin="edges"` queda tensada por los bordes como una membrana. El puntero empuja la tela dentro de `radius` con fuerza `push`, y el `wind` mece el conjunto.

```tsx
<ClothBackground
  spacing={34}
  gravity={0.25}
  iterations={5}
  wind={0.05}
  pin="top"
  damping={0.99}
  alpha={0.3}
 />
```

