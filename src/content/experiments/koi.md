---
title: Estanque de carpas
description: Carpas koi que nadan en profundidad y sienten curiosidad por el puntero, al que rodean sin tocarlo.
category: naturaleza
component: KoiBackground
props:
  - name: near
    label: Carpas cercanas
    type: number
    default: 6
    min: 0
    max: 20
    step: 1
  - name: far
    label: Carpas lejanas
    type: number
    default: 3
    min: 0
    max: 20
    step: 1
  - name: size
    label: Longitud (px)
    type: number
    default: 100
    min: 60
    max: 400
    step: 10
  - name: speed
    label: Velocidad
    type: number
    default: 0.7
    min: 0.1
    max: 3
    step: 0.1
  - name: curiosity
    label: Curiosidad (px)
    type: number
    default: 600
    min: 100
    max: 900
    step: 20
  - name: keep
    label: Distancia de respeto (px)
    type: number
    default: 100
    min: 20
    max: 400
    step: 10
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0.02
    max: 1
    step: 0.02
  - name: lineWidth
    label: Grosor de línea
    type: number
    default: 1.2
    min: 0.5
    max: 4
    step: 0.1
---

## Uso

`near` y `far` reparten las carpas cercanas (con contorno, manchas y aletas) y las lejanas (siluetas tenues); `size` fija su longitud y `speed` su nado. El puntero las atrae dentro de `curiosity` y, cuando llegan a `keep`, dan vueltas a su alrededor sin tocarlo.

Por defecto no dibuja fondo y hereda el color de la página. Opcionalmente fija `color` o define `--koi-color` y `--koi-opacity` en CSS.

```tsx
<KoiBackground near={4} far={4} size={190} speed={0.7} curiosity={460} keep={120} alpha={0.3} lineWidth={1.2} />
```
