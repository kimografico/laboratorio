---
title: Estanque de carpas II
description: "Segunda variante de carpas koi: bancos cercanos y lejanos que exploran el puntero rodeándolo sin tocarlo."
category: backgrounds
component: KoiBackgroundII
props:
  - name: near
    label: Carpas cercanas
    type: number
    default: 4
    min: 0
    max: 20
    step: 1
  - name: far
    label: Carpas lejanas
    type: number
    default: 4
    min: 0
    max: 20
    step: 1
  - name: size
    label: Longitud (px)
    type: number
    default: 190
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
    default: 460
    min: 100
    max: 900
    step: 20
  - name: keep
    label: Distancia de respeto (px)
    type: number
    default: 120
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

`near` y `far` reparten las carpas cercanas (con contorno, manchas y aletas) y las lejanas (siluetas tenues); `size` fija su longitud y `speed` su nado. El puntero las atrae dentro de `curiosity` y, al llegar a `keep`, dan vueltas a su alrededor sin tocarlo; `alpha` y `lineWidth` controlan la presencia del trazo.

Por defecto no dibuja fondo y hereda el color de la página. Opcionalmente fija `color` o define `--koi-color` y `--koi-opacity` en CSS.

```tsx
<KoiBackgroundII near={4} far={4} size={190} speed={0.7} curiosity={460} keep={120} alpha={0.3} lineWidth={1.2} />
```
