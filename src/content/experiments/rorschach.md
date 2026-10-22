---
title: "Test de Rorschach"
description: "Manchas de tinta interactivas con simetría central y controles de crecimiento y desvanecimiento."
category: pendiente
component: "RorschachBackground"
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

Mueve el puntero o haz clic para crear manchas reflejadas desde el centro. La imagen se difumina después de aplicar el espejo para que las formas se fundan sin dejar esquinas en el eje. `maxScale` multiplica el radio inicial para definir el radio máximo; `growTime` controla cuánto tarda en alcanzarlo, `holdTime` cuánto lo mantiene y `fadeTime` cuánto tarda en desaparecer. `clickScale` ajusta el tamaño inicial de las gotas del clic, mientras `speed` acelera o ralentiza las fases y el movimiento.

```tsx
<RorschachBackground size={22} growTime={1.5} holdTime={0.5} fadeTime={2} maxScale={1} clickScale={3} speed={1} />
```
