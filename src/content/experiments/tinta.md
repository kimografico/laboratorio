---
title: "Tinta"
description: "Crea manchas interactivas de tinta y ajusta cómo crecen y se desvanecen."
category: pendiente
component: "TintaBackground"
props:
  - name: "size"
    label: "Tamaño (px)"
    type: "number"
    default: 22
    min: 4
    max: 80
    step: 1
  - name: "growTime"
    label: "Tiempo de crecimiento (s)"
    type: "number"
    default: 1.5
    min: 0.1
    max: 10
    step: 0.1
  - name: "holdTime"
    label: "Pausa al máximo (s)"
    type: "number"
    default: 0.5
    min: 0
    max: 10
    step: 0.1
  - name: "fadeTime"
    label: "Tiempo de desvanecimiento (s)"
    type: "number"
    default: 2
    min: 0.1
    max: 10
    step: 0.1
  - name: "maxScale"
    label: "Expansión máxima (×)"
    type: "number"
    default: 1
    min: 1
    max: 8
    step: 0.1
  - name: "clickScale"
    label: "Tamaño al hacer clic (×)"
    type: "number"
    default: 3
    min: 1
    max: 10
    step: 0.1
  - name: "emit"
    label: "Emisión"
    type: "number"
    default: 25
    min: 0
    max: 200
    step: 1
  - name: "drift"
    label: "Deriva"
    type: "number"
    default: 12
    min: 0
    max: 100
    step: 1
  - name: "speed"
    label: "Velocidad"
    type: "number"
    default: 1
    min: 0.1
    max: 3
    step: 0.1
---

## Uso

Mover el ratón deja tinta que se funde; el clic crea una gota cuyo tamaño inicial se ajusta por separado. `maxScale` multiplica el radio inicial para definir el radio máximo; `growTime` controla cuánto tarda en alcanzarlo, `holdTime` cuánto lo mantiene y `fadeTime` cuánto tarda en desaparecer. `speed` acelera o ralentiza todas estas fases y el movimiento.

```tsx
<TintaBackground size={22} growTime={1.5} holdTime={0.5} fadeTime={2} maxScale={1} clickScale={3} speed={1} />
```
