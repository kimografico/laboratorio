---
title: Botón
description: "Botón configurable: variantes, tamaños, color, icono, estado pulsado y modo solo icono."
category: buttons
component: Button
props:
  - name: label
    label: Texto
    type: text
    default: "Botón"
  - name: variant
    label: Variante
    type: select
    default: solid
    options: [solid, outline, ghost]
  - name: size
    label: Tamaño
    type: select
    default: md
    options: [xs, sm, md, lg]
  - name: icon
    label: Icono
    type: select
    default: none
    options: [none, arrow-right, plus, check, download, search, heart]
  - name: iconPosition
    label: Posición del icono
    type: select
    default: right
    options: [left, right]
  - name: iconOnly
    label: Solo icono
    type: boolean
    default: false
  - name: shape
    label: Forma (solo icono)
    type: select
    default: circle
    options: [circle, rounded, squared]
  - name: fullWidth
    label: Ancho completo
    type: boolean
    default: false
  - name: color
    label: Color (vacío = tema)
    type: color
    default: ""
  - name: disabled
    label: Deshabilitado
    type: boolean
    default: false
---

## Uso

`iconOnly` convierte el botón en un botón de icono. `color` acepta un hex; si se deja vacío usa los
tokens del tema. Cuando `disabled` no hay hover ni animación al pulsar.

```tsx
<Button variant="solid" size="md" label="Empezar" icon="arrow-right" />
```
