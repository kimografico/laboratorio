---
title: Botón
description: "Botón configurable: variantes, tamaños, color, icono, distintivo, estado pulsado y modo solo icono."
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
    options: [none, arrow-left, arrow-right, plus, check, download, search, heart, rotate-ccw, maximize, minimize, copy]
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
    label: Forma
    type: select
    default: circle
    options: [circle, rounded, squared]
  - name: fullWidth
    label: Ancho completo
    type: boolean
    default: false
  - name: badge
    label: Distintivo
    type: text
    default: ""
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

`iconOnly` convierte el botón en un botón de icono. `shape` controla el redondeo tanto con texto
como en modo icono. `badge` añade un distintivo junto a la etiqueta. `href` renderiza el botón como
enlace. `color` acepta un hex; si se deja vacío usa los tokens del tema. Cuando `disabled` no hay
hover ni animación al pulsar.

```tsx
<Button variant="solid" size="md" label="Empezar" icon="arrow-right" />
<Button label="Copiar" icon="copy" variant="outline" badge={3} />
```
