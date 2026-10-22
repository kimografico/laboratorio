---
title: "Barco y olas II"
description: "Un barco cabalgando las olas e inclinándose con la pendiente; el puntero lo guía y levanta la mar."
category: naturaleza
component: "BarcoEnOlasBackground"
props:
  - name: "waves"
    label: "Cantidad de olas"
    type: "number"
    default: 5
    min: 1
    max: 10
    step: 1
  - name: "sep"
    label: "Separación de olas"
    type: "number"
    default: 50
    min: 0
    max: 80
    step: 1
  - name: "amp"
    label: "Altura de olas"
    type: "number"
    default: 22
    min: 0
    max: 80
    step: 1
  - name: "sp"
    label: "Velocidad"
    type: "number"
    default: 2.6
    min: 0
    max: 3
    step: 0.05
  - name: "len"
    label: "Longitud de onda"
    type: "number"
    default: 500
    min: 80
    max: 500
    step: 5
  - name: "size"
    label: "Barco"
    type: "number"
    default: 90
    min: 10
    max: 100
    step: 1
  - name: "ease"
    label: "Suavizado del barco"
    type: "number"
    default: 0.006
    min: 0.002
    max: 0.1
    step: 0.001
  - name: "color"
    label: "Color"
    type: "boolean"
    default: false
  - name: "lw"
    label: "Grosor de línea"
    type: "number"
    default: 0.7
    min: 0.1
    max: 6
    step: 0.1
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 1
    min: 0.05
    max: 1
    step: 0.05
  - name: "lineColor"
    label: "Color de línea"
    type: "color"
    default: "#808080"
    themed: false
---

## Uso

El puntero guía el barco en horizontal y levanta las olas al moverlo en vertical.

```tsx
<BarcoEnOlasBackground amp={28} len={260} size={44} />
```
