---
title: "Serpiente"
description: "Una serpiente persigue la comida. Clic = pone comida; si no hay, sigue al puntero o vaga sola."
category: pendiente
component: "SerpienteBackground"
props:
  - name: "len"
    label: "Longitud inicial"
    type: "number"
    default: 15
    min: 3
    max: 80
    step: 1
  - name: "w"
    label: "Grosor (px)"
    type: "number"
    default: 9
    min: 2
    max: 30
    step: 1
  - name: "sp"
    label: "Velocidad (px/s)"
    type: "number"
    default: 170
    min: 20
    max: 600
    step: 10
  - name: "grow"
    label: "Crecimiento"
    type: "number"
    default: 3
    min: 0
    max: 20
    step: 1
---

## Uso

La serpiente persigue la comida; sin comida sigue al puntero o vaga sola.

```tsx
<SerpienteBackground len={15} sp={170} />
```
