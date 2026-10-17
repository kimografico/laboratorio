---
title: Lily
description: Nenúfares flotantes que se mecen con la corriente y reaccionan al puntero.
category: backgrounds
component: LilyBackground
props:
  - name: count
    label: Cantidad
    type: number
    default: 14
    min: 4
    max: 40
    step: 1
  - name: size
    label: Tamaño
    type: number
    default: 46
    min: 16
    max: 120
    step: 2
  - name: push
    label: Empuje
    type: number
    default: 1
    min: 0
    max: 3
    step: 0.1
  - name: reach
    label: Alcance
    type: number
    default: 90
    min: 20
    max: 200
    step: 5
  - name: flowers
    label: Flores
    type: number
    default: 0.25
    min: 0
    max: 1
    step: 0.05
  - name: alpha
    label: Opacidad
    type: number
    default: 0.3
    min: 0.1
    max: 0.8
    step: 0.05
  - name: lineWidth
    label: Grosor de línea
    type: number
    default: 1.2
    min: 0.5
    max: 3
    step: 0.1
---

## Uso

`count` y `size` controlan cuántos nenúfares hay y su radio medio (cada uno varía entre 0.55× y 1.4×). `push` y `reach` ajustan cómo el puntero los empuja, los aparta y hace girar (con `push = 0` no los toca); `flowers` es la fracción de nenúfares con flor, `alpha` la opacidad del contorno y `lineWidth` el grosor de línea. El color se hereda del CSS de la página; puedes forzarlo con la prop opcional `color` o con las variables `--lily-color` / `--lily-opacity`.

```tsx
import LilyBackground from "@kimografico/laboratorio/backgrounds/LilyBackground";

export function Demo() {
  return (
    <LilyBackground count={20} size={52} push={1.4} reach={120} flowers={0.4} />
  );
}
```
