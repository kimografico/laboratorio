---
title: "Teseracto"
description: "Hipercubo de cuatro dimensiones proyectado a 2D con giros por eje y planos 4D configurables; cada dirección del puntero elige el eje o plano que mueve."
category: geometria
component: "TeseractoBackground"
props:
  - name: "size"
    label: "Tamaño"
    type: "number"
    default: 310
    min: 40
    max: 400
    step: 5
  - name: "lw"
    label: "Grosor"
    type: "number"
    default: 2
    min: 0.5
    max: 8
    step: 0.1
  - name: "glow"
    label: "Brillo"
    type: "number"
    default: 0.5
    min: 0
    max: 1.5
    step: 0.05
  - name: "initX"
    label: "Giro inicial X"
    type: "number"
    default: 0
    min: -180
    max: 180
    step: 5
  - name: "initY"
    label: "Giro inicial Y"
    type: "number"
    default: 65
    min: -180
    max: 180
    step: 5
  - name: "initZ"
    label: "Giro inicial Z"
    type: "number"
    default: 0
    min: -180
    max: 180
    step: 5
  - name: "rx"
    label: "Giro X"
    type: "number"
    default: 0
    min: -2
    max: 2
    step: 0.05
  - name: "ry"
    label: "Giro Y"
    type: "number"
    default: 0
    min: -2
    max: 2
    step: 0.05
  - name: "rz"
    label: "Giro Z"
    type: "number"
    default: 0
    min: -2
    max: 2
    step: 0.05
  - name: "rw"
    label: "Giro W (4D)"
    type: "number"
    default: 0
    min: -2
    max: 2
    step: 0.05
  - name: "mouse"
    label: "Efecto del ratón"
    type: "number"
    default: 0.75
    min: 0
    max: 2
    step: 0.05
  - name: "persp"
    label: "Perspectiva"
    type: "number"
    default: 3
    min: 1
    max: 10
    step: 0.1
  - name: "mouseX"
    label: "Mouse eje X"
    type: "select"
    default: "ZW"
    options: ["none", "X", "Y", "Z", "W", "XY", "XZ", "XW", "YZ", "YW", "ZW"]
  - name: "mouseY"
    label: "Mouse eje Y"
    type: "select"
    default: "none"
    options: ["none", "X", "Y", "Z", "W", "XY", "XZ", "XW", "YZ", "YW", "ZW"]
  - name: "multicolor"
    label: "Multicolor"
    type: "boolean"
    default: false
  - name: "color"
    label: "Color"
    type: "color"
    default: ""
---

## Uso

Proyección 2D de un teseracto. `mouseX` y `mouseY` eligen a qué eje o plano afecta el movimiento horizontal y vertical del puntero: una letra (`X`, `Y`, `Z`, `W`) aplica el giro de ese eje (X → YZ, Y → XZ, Z → XY, W → XW) y una pareja (`XY`, `XZ`, `XW`, `YZ`, `YW`, `ZW`) gira directamente en ese plano. `none` desactiva esa dirección. `initX`, `initY` e `initZ` fijan la orientación inicial en grados. Los giros automáticos (`rx`, `ry`, `rz`, `rw`) están a 0 por defecto, así que el movimiento lo controla solo el ratón; súbelos para añadir rotación automática. `multicolor` está activo por defecto: las aristas usan la paleta arcoíris y los vértices quedan blancos. `color` fija un color único para aristas y vértices y tiene prioridad. Si `multicolor` está desactivado y `color` está vacío, se usa el color de texto del tema con opacidad variable alrededor del 25 % según la profundidad.

```tsx
<TeseractoBackground
  size={310}
  lw={2}
  glow={0.5}
  initX={0}
  initY={65}
  initZ={0}
  rx={0}
  ry={0}
  rz={0}
  rw={0}
  mouse={2}
  persp={3}
  mouseX="ZW"
  mouseY="none"
  multicolor
  color={""}
/>
```
