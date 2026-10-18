---
title: "Zarcillos con Ojos"
description: "Red de zarcillos con física de muelles, filtro goo y ojos de gato en los nudos mayores que siguen al puntero."
category: pendiente
component: "TendrilEyesBackground"
props:
  - name: "anchors"
    label: "Anclas en borde"
    type: "number"
    default: 40
    min: 4
    max: 60
    step: 1
  - name: "inner"
    label: "Nodos internos"
    type: "number"
    default: 0
    min: 0
    max: 40
    step: 1
  - name: "strands"
    label: "Hilos extra"
    type: "number"
    default: 8
    min: 0
    max: 20
    step: 1
  - name: "sparsity"
    label: "Dispersión"
    type: "number"
    default: 0.2
    min: 0
    max: 1
    step: 0.05
  - name: "span"
    label: "Tramo máx. (fracción diagonal)"
    type: "number"
    default: 0.2
    min: 0.1
    max: 1
    step: 0.05
  - name: "far"
    label: "Fracción lejanos"
    type: "number"
    default: 0.4
    min: 0
    max: 1
    step: 0.05
  - name: "thick"
    label: "Grosor extremo (px)"
    type: "number"
    default: 30
    min: 2
    max: 30
    step: 1
  - name: "thin"
    label: "Grosor centro (px)"
    type: "number"
    default: 2
    min: 1
    max: 10
    step: 0.5
  - name: "wave"
    label: "Onda"
    type: "number"
    default: 0
    min: 0
    max: 1
    step: 0.05
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0.1
    max: 5
    step: 0.1
  - name: "sag"
    label: "Hundimiento"
    type: "number"
    default: 0.05
    min: 0
    max: 0.2
    step: 0.01
  - name: "drift"
    label: "Deriva nodos (px)"
    type: "number"
    default: 10
    min: 0
    max: 50
    step: 1
  - name: "radius"
    label: "Radio atracción (px)"
    type: "number"
    default: 200
    min: 50
    max: 500
    step: 10
  - name: "pull"
    label: "Fuerza atracción"
    type: "number"
    default: 1
    min: 0
    max: 2
    step: 0.05
  - name: "stiffness"
    label: "Rigidez"
    type: "number"
    default: 0.02
    min: 0.01
    max: 0.5
    step: 0.01
  - name: "damping"
    label: "Amortiguación"
    type: "number"
    default: 0.95
    min: 0.5
    max: 0.99
    step: 0.01
  - name: "kick"
    label: "Impulso"
    type: "number"
    default: 0.15
    min: 0
    max: 0.5
    step: 0.01
  - name: "eyes"
    label: "Ojos (0=sin)"
    type: "number"
    default: 0
    min: 0
    max: 10
    step: 1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0
    max: 1
    step: 0.02
  - name: "goo"
    label: "Filtro goo"
    type: "boolean"
    default: true
  - name: "blur"
    label: "Desenfoque (px)"
    type: "number"
    default: 3
    min: 0
    max: 10
    step: 0.5
  - name: "contrast"
    label: "Contraste"
    type: "number"
    default: 60
    min: 5
    max: 60
    step: 1
  - name: "cut"
    label: "Umbral corte"
    type: "number"
    default: 4
    min: 0
    max: 20
    step: 1
  - name: "color"
    label: "Color"
    type: "color"
---

## Uso

Red de zarcillos con triangulación voraz y física de muelles. Filtro goo (feGaussianBlur + feColorMatrix) para efecto metabola. Ojos opcionales en nudos mayores.

```tsx
<TendrilEyesBackground
  anchors={40}
  inner={0}
  strands={8}
  sparsity={0.2}
  span={0.2}
  far={0.4}
  thick={30}
  thin={2}
  wave={0}
  speed={1}
  sag={0.05}
  drift={10}
  radius={200}
  pull={1}
  stiffness={0.02}
  damping={0.95}
  kick={0.15}
  eyes={0}
  alpha={0.5}
  goo
  blur={3}
  contrast={60}
  cut={4}
  color={""} />
```
