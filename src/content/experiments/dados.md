---
title: "Dados"
description: "Rejilla de dados: el puntero los hace rodar al pasar. Clic = tirada general."
category: pendiente
component: "DadosBackground"
props:
  - name: "cell"
    label: "Tamaño de celda (px)"
    type: "number"
    default: 56
    min: 20
    max: 160
    step: 4
  - name: "rad"
    label: "Alcance del puntero (px)"
    type: "number"
    default: 60
    min: 0
    max: 300
    step: 10
  - name: "roll"
    label: "Duración de la tirada (s)"
    type: "number"
    default: 0.6
    min: 0.1
    max: 3
    step: 0.1
---

## Uso

El puntero hace rodar los dados al pasar y el clic provoca una tirada general.

```tsx
<DadosBackground cell={56} rad={60} />
```
