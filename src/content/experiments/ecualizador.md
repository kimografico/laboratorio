---
title: "Ecualizador"
description: "Barras de LED que bailan; el puntero inyecta energía (más arriba = más)."
category: pendiente
component: "EcualizadorBackground"
props:
  - name: "n"
    label: "Barras"
    type: "number"
    default: 40
    min: 8
    max: 120
    step: 1
  - name: "seg"
    label: "Segmentos por barra"
    type: "number"
    default: 20
    min: 4
    max: 48
    step: 1
  - name: "sp"
    label: "Velocidad"
    type: "number"
    default: 1.5
    min: 0
    max: 5
    step: 0.1
  - name: "boost"
    label: "Impulso del puntero"
    type: "number"
    default: 0.8
    min: 0
    max: 3
    step: 0.05
---

## Uso

Barras de LED que bailan; el puntero inyecta energía (más arriba = más).

```tsx
<EcualizadorBackground n={40} seg={20} sp={1.5} />
```
