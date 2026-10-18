---
title: "Arboleda Fibonacci"
description: "Bosque de árboles que crecen siguiendo la sucesión de Fibonacci; reaccionan al puntero y se plantan con clic."
category: backgrounds
component: "FibonacciGroveBackground"
props:
  - name: "max"
    label: "Máx. árboles"
    type: "number"
    default: 5
    min: 1
    max: 20
    step: 1
  - name: "size"
    label: "Altura base (px)"
    type: "number"
    default: 400
    min: 200
    max: 1000
    step: 10
  - name: "minLevels"
    label: "Niveles mín."
    type: "number"
    default: 9
    min: 2
    max: 15
    step: 1
  - name: "maxLevels"
    label: "Niveles máx."
    type: "number"
    default: 15
    min: 2
    max: 15
    step: 1
  - name: "spread"
    label: "Apertura ramas"
    type: "number"
    default: 0.7
    min: 0.1
    max: 1.5
    step: 0.05
  - name: "trunk"
    label: "Grosor tronco"
    type: "number"
    default: 9
    min: 2
    max: 20
    step: 1
  - name: "randomness"
    label: "Aleatoriedad"
    type: "number"
    default: 0.4
    min: 0
    max: 1
    step: 0.05
  - name: "opacity"
    label: "Opacidad"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.05
  - name: "grass"
    label: "Franja césped"
    type: "number"
    default: 0.13
    min: 0
    max: 0.3
    step: 0.01
  - name: "grassAmount"
    label: "Cantidad césped"
    type: "number"
    default: 5.6
    min: 0
    max: 10
    step: 0.1
  - name: "grow"
    label: "Tiempo crecimiento (s)"
    type: "number"
    default: 8
    min: 1
    max: 30
    step: 1
  - name: "life"
    label: "Tiempo de vida (s)"
    type: "number"
    default: 10
    min: 2
    max: 60
    step: 1
  - name: "fade"
    label: "Velocidad de desaparición (s)"
    type: "number"
    default: 3
    min: 1
    max: 20
    step: 1
  - name: "interval"
    label: "Intervalo auto (s)"
    type: "number"
    default: 4
    min: 0
    max: 30
    step: 1
  - name: "sway"
    label: "Viento"
    type: "number"
    default: 0.05
    min: 0
    max: 0.3
    step: 0.01
  - name: "avoid"
    label: "Reacción puntero"
    type: "number"
    default: 0.1
    min: 0
    max: 1
    step: 0.05
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 220
    min: 50
    max: 500
    step: 10
  - name: "color"
    label: "Color"
    type: "color"
---

## Uso

Árboles que ramifican con la regla de Fibonacci (A→AB, B→A). Crecen, viven y se desvanecen. El puntero los empuja; clic planta uno nuevo.

```tsx
<FibonacciGroveBackground
  max={5}
  size={400}
  minLevels={9}
  maxLevels={15}
  spread={0.7}
  trunk={9}
  randomness={0.4}
  opacity={0.3}
  grass={0.13}
  grassAmount={5.6}
  grow={8}
  life={10}
  fade={3}
  interval={4}
  sway={0.05}
  avoid={0.1}
  radius={220}
  color={""} />
```
