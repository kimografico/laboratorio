---
title: "Trendils"
description: "Red de zarcillos con física de muelles y filtro goo; en esta versión los nudos son círculos y los mayores llevan esferas con ojos que siguen al puntero."
category: pendiente
component: "TrendilBackground"
props:
  - name: "anchors"
    label: "Anclas en borde"
    type: "number"
    default: 60
    min: 4
    max: 60
    step: 1
  - name: "inner"
    label: "Nodos internos"
    type: "number"
    default: 6
    min: 0
    max: 40
    step: 1
  - name: "sparsity"
    label: "Dispersión"
    type: "number"
    default: 0.8
    min: 0
    max: 1
    step: 0.02
  - name: "span"
    label: "Tramo máx. (fracción diagonal)"
    type: "number"
    default: 0.3
    min: 0.1
    max: 1
    step: 0.05
  - name: "far"
    label: "Fracción lejanos"
    type: "number"
    default: 0.3
    min: 0
    max: 1
    step: 0.05
  - name: "thick"
    label: "Grosor extremo (px)"
    type: "number"
    default: 25
    min: 2
    max: 30
    step: 1
  - name: "thin"
    label: "Grosor centro (px)"
    type: "number"
    default: 1.5
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
    default: 30
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
    default: 0.8
    min: 0
    max: 2
    step: 0.05
  - name: "stiffness"
    label: "Rigidez"
    type: "number"
    default: 0.06
    min: 0.01
    max: 0.5
    step: 0.01
  - name: "damping"
    label: "Amortiguación"
    type: "number"
    default: 0.9
    min: 0.5
    max: 0.99
    step: 0.01
  - name: "kick"
    label: "Impulso"
    type: "number"
    default: 0.05
    min: 0
    max: 0.5
    step: 0.01
  - name: "eyes"
    label: "Ojos (0=sin)"
    type: "number"
    default: 3
    min: 0
    max: 10
    step: 1
  - name: "eyeSphere"
    label: "Esfera del ojo (×nodo)"
    type: "number"
    default: 3
    min: 1
    max: 4
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 1
    min: 0
    max: 1
    step: 0.02
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
    default: 3
    min: 0
    max: 20
    step: 1
  - name: "color"
    label: "Color"
    type: "color"
  - name: "eyeColor"
    label: "Color del globo"
    type: "color"
    default: "#dfdfb9"
    themed: false
  - name: "goo"
    label: "Filtro goo"
    type: "boolean"
    default: true
  - name: "frame"
    label: "Marco de cueva"
    type: "boolean"
    default: true
---

## Uso

Red de zarcillos con triangulación voraz, física de muelles y filtro goo (`feGaussianBlur` + `feColorMatrix`) para efecto metabola. En esta versión los nudos se dibujan como círculos y los nudos mayores llevan una esfera con ojo que sigue al puntero en horizontal y vertical.

El color de la tinta sigue el tema (hereda `color`/`currentColor` o la variable `--trendil-color`); el fondo lo pinta el contenedor con `var(--panel)`.

```tsx
<TrendilBackground anchors={20} inner={12} eyes={6} />
```
