---
title: "Pradera"
description: "Pradera de hierba al viento con plantas que brotan al pasar el puntero."
category: backgrounds
component: "MeadowBackground"
props:
  - name: "spacing"
    label: "Separación (px)"
    type: "number"
    default: 8
    min: 4
    max: 30
    step: 1
  - name: "blade"
    label: "Altura de brizna (px)"
    type: "number"
    default: 14
    min: 4
    max: 40
    step: 1
  - name: "wind"
    label: "Viento"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: "radius"
    label: "Radio del puntero (px)"
    type: "number"
    default: 110
    min: 0
    max: 400
    step: 10
  - name: "bend"
    label: "Inclinación"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: "plantEvery"
    label: "Distancia por planta (px)"
    type: "number"
    default: 300
    min: 10
    max: 400
    step: 10
  - name: "plantSize"
    label: "Altura de planta (px)"
    type: "number"
    default: 110
    min: 20
    max: 300
    step: 10
  - name: "growth"
    label: "Crecimiento (px/s)"
    type: "number"
    default: 80
    min: 10
    max: 300
    step: 10
  - name: "life"
    label: "Vida de la planta (s)"
    type: "number"
    default: 6
    min: 1
    max: 60
    step: 1
  - name: "wither"
    label: "Marchitado (s)"
    type: "number"
    default: 3
    min: 0
    max: 30
    step: 1
  - name: "maxPlants"
    label: "Máx. de plantas"
    type: "number"
    default: 10
    min: 0
    max: 50
    step: 1
  - name: "ambient"
    label: "Plantas solas/s"
    type: "number"
    default: 0.2
    min: 0
    max: 2
    step: 0.05
  - name: "flowers"
    label: "Con flores"
    type: "boolean"
    default: true
  - name: "lineWidth"
    label: "Grosor de línea"
    type: "number"
    default: 1
    min: 0.5
    max: 4
    step: 0.1
  - name: "color"
    label: "Hierba"
    type: "color"
  - name: alpha
    label: Opacidad
    type: number
    default: 0.45
    min: 0
    max: 1
    step: 0.02
  - name: "plantColor"
    label: "Plantas"
    type: "color"
    default: "rgba(30, 84, 40, 0.9)"
  - name: "flowerColor"
    label: "Flores"
    type: "color"
    default: "rgba(196, 70, 90, 0.95)"
---

## Uso

Briznas repartidas por `spacing` en tres capas de profundidad se mecen con `wind` y se apartan del puntero dentro de `radius`. Cada cierto trecho recorrido brota una planta que crece con ramas y hojas (`flowers` añade flores al final), vive `life` segundos y se marchita en `wither`.

```tsx
<MeadowBackground
  spacing={8}
  blade={14}
  wind={1}
  radius={110}
  bend={1}
  plantEvery={300}
  plantSize={110}
  growth={80}
  life={6}
  wither={3}
  maxPlants={10}
  ambient={0.2}
  flowers
  lineWidth={1}
  color={""}
  alpha={0.45}
  plantColor={"rgba(30, 84, 40, 0.9)"}
  flowerColor={"rgba(196, 70, 90, 0.95)"} />
```
