---
title: "Eclipse"
description: "Eclipse solar realista: el Sol brilla más por contraste al taparse, con glow blanco que vira a anaranjado en la totalidad; el limbo irregular de la Luna produce las perlas de Baily. La Luna es el puntero: pasa de azul casi blanco a negro al cubrir el Sol."
category: pendiente
component: "EclipseBackground"
props:
  - name: "sun"
    label: "Tamaño del Sol (px)"
    type: "number"
    default: 100
    min: 20
    max: 160
    step: 1
  - name: "mr"
    label: "Luna (× Sol)"
    type: "number"
    default: 1.03
    min: 0.8
    max: 1.5
    step: 0.01
  - name: "sp"
    label: "Movimiento automático"
    type: "number"
    default: 0.5
    min: 0
    max: 4
    step: 0.1
  - name: "cor"
    label: "Corona"
    type: "number"
    default: 2
    min: 0
    max: 3
    step: 0.1
  - name: "bead"
    label: "Perlas de Baily"
    type: "number"
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: "beadLimit"
    label: "Límite de área visible (%)"
    type: "number"
    default: 5
    min: 1
    max: 10
    step: 0.5
  - name: "rough"
    label: "Rugosidad del limbo (%)"
    type: "number"
    default: 3
    min: 0
    max: 12
    step: 0.5
  - name: "stars"
    label: "Estrellas"
    type: "number"
    default: 180
    min: 0
    max: 600
    step: 10
  - name: "xray"
    label: "Visión radiográfica"
    type: "boolean"
    default: false
---

## Uso

La Luna es el puntero: al cubrir el Sol aparecen la corona y las perlas de Baily. Las perlas se reparten por los tramos estrechos entre ambos limbos; crecen y se vuelven más transparentes al ensancharse la franja. `beadLimit` define el porcentaje máximo del área lunar que puede quedar iluminado antes de que desaparezcan; el valor inicial es 5 %.
Activa `xray` para aplicar el filtro radiográfico con oscurecimiento 1 y contraste 3. El cielo y la Luna se vuelven negros, se oculta el halo claro y se conserva el halo naranja.

```tsx
<EclipseBackground sun={100} mr={1.03} sp={0.5} cor={2} bead={1} beadLimit={5} rough={3} stars={180} xray={false} />
```
