---
title: "Colonización del espacio"
description: "Una red ramificada crece hacia puntos de auxina; el puntero siembra atractores y el clic añade una raíz."
category: pendiente
component: "ColonizacionDelEspacioBackground"
props:
  - name: "na"
    label: "Atractores"
    type: "number"
    default: 700
    min: 100
    max: 2000
    step: 50
  - name: "rad"
    label: "Radio de influencia"
    type: "number"
    default: 80
    min: 20
    max: 200
    step: 5
  - name: "step"
    label: "Paso"
    type: "number"
    default: 4
    min: 1
    max: 12
    step: 1
  - name: "kill"
    label: "Radio de eliminación"
    type: "number"
    default: 14
    min: 4
    max: 40
    step: 1
  - name: "it"
    label: "Pasos por fotograma"
    type: "number"
    default: 2
    min: 1
    max: 6
    step: 1
  - name: "dep"
    label: "Siembra del puntero"
    type: "number"
    default: 10
    min: 0
    max: 50
    step: 1
---

## Uso

Red de crecimiento espacial: el puntero siembra atractores y el clic añade una nueva raíz.

```tsx
<ColonizacionDelEspacioBackground na={700} rad={80} dep={10} />
```
