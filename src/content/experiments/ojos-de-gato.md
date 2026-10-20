---
title: "Ojos de gato"
description: "Parejas de ojos felinos que se abren al acercar el puntero y siguen sus movimientos."
category: pendiente
component: "CatEyesBackground"
props:
  - name: "pairs"
    label: "Densidad"
    type: "number"
    default: 12
    min: 1
    max: 500
    step: 1
  - name: "eyeWidth"
    label: "Tamaño de los ojos"
    type: "number"
    default: 45
    min: 10
    max: 80
    step: 1
  - name: "eyeOpenness"
    label: "Apertura de los ojos"
    type: "number"
    default: 1
    min: 0.2
    max: 2
    step: 0.01
  - name: "roundness"
    label: "Redondez"
    type: "number"
    default: 1
    min: 0
    max: 1.5
    step: 0.01
  - name: "pairGap"
    label: "Separación entre ojos"
    type: "number"
    default: 1.5
    min: 0.8
    max: 3
    step: 0.02
  - name: "radius"
    label: "Área de efecto del cursor"
    type: "number"
    default: 80
    min: 40
    max: 600
    step: 10
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.47
    min: 0.05
    max: 1
    step: 0.01
  - name: "eyeColor"
    label: "Color de ojos"
    type: "color"
  - name: "contourColor"
    label: "Color del contorno"
    type: "color"
---

## Uso

`color` fija el globo y el borde; `eyeColor` pinta el globo ocular y `contourColor` el borde. Las pupilas son siempre negras y opacas; con el botón del ratón pulsado y el puntero muy cerca, se ensanchan hasta hacerse redondas y crecen. Cada ojo mueve su pupila de forma independiente, por lo que pueden bizquear cuando el puntero cae entre ambos. Sin colores explícitos, el tema claro usa el fondo para el globo y negro para el borde; el tema oscuro usa blanco para el globo y el fondo para el borde. La opacidad del globo y el borde se ajusta con `--cat-eyes-opacity` en CSS. La densidad se limita a lo que cabe según el tamaño de los ojos y su separación. Los ojos empiezan a abrirse antes dentro del radio de efecto y se abren todos al mantener pulsado.

```tsx
<CatEyesBackground pairs={60} radius={230} />
```
