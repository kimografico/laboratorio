---
title: "Gatos minimalistas"
description: "Gatos de silueta con ojos y bigotes; las pupilas siguen al puntero y el clic genera una onda de saltitos."
category: naturaleza
component: "GatosMinimalistasBackground"
props:
  - name: "size"
    label: "Tamaño del gato"
    type: "number"
    default: 49
    min: 20
    max: 120
    step: 1
  - name: "over"
    label: "Separación horizontal"
    type: "number"
    default: 0.85
    min: 0.3
    max: 1.5
    step: 0.01
  - name: "rowv"
    label: "Separación vertical"
    type: "number"
    default: 1.45
    min: 0.5
    max: 2.5
    step: 0.05
  - name: "jit"
    label: "Desorden"
    type: "number"
    default: 0.5
    min: 0
    max: 2
    step: 0.05
  - name: "warm"
    label: "Proporción cálida"
    type: "number"
    default: 0.65
    min: 0
    max: 1
    step: 0.05
  - name: "var"
    label: "Variación entre gatos"
    type: "number"
    default: 1.25
    min: 0
    max: 3
    step: 0.05
  - name: "eyes"
    label: "Tamaño de los ojos"
    type: "number"
    default: 0.75
    min: 0.3
    max: 2
    step: 0.05
  - name: "irr"
    label: "Irregularidad de los ojos"
    type: "number"
    default: 1.5
    min: 0
    max: 3
    step: 0.05
  - name: "dilate"
    label: "Dilatación de la pupila"
    type: "number"
    default: 2.5
    min: 0
    max: 3
    step: 0.05
  - name: "whisk"
    label: "Largo de los bigotes"
    type: "number"
    default: 0.75
    min: 0
    max: 3
    step: 0.05
  - name: "bob"
    label: "Movimiento"
    type: "number"
    default: 2.5
    min: 0
    max: 3
    step: 0.05
  - name: "rad"
    label: "Alcance del puntero"
    type: "number"
    default: 250
    min: 20
    max: 500
    step: 10
  - name: "opacity"
    label: "Opacidad"
    type: "number"
    default: 0.5
    min: 0
    max: 1
    step: 0.05
---

## Uso

Gatos minimalistas con pupilas que siguen al puntero. El clic produce una onda de saltitos.

```tsx
<GatosMinimalistasBackground size={58} warm={0.5} rad={170} />
```
