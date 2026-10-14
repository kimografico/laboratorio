---
title: Botón
description: "Botón de acción con variantes, tamaños, icono y estado deshabilitado."
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
    options: [sm, md, lg]
  - name: icon
    label: Icono
    type: select
    default: none
    options: [none, arrow-right, plus, check, download]
  - name: iconPosition
    label: Posición del icono
    type: select
    default: right
    options: [left, right]
  - name: fullWidth
    label: Ancho completo
    type: boolean
    default: false
  - name: disabled
    label: Deshabilitado
    type: boolean
    default: false
---

## Uso

El botón se adapta al tema mediante tokens (`bg-fg`, `text-surface`, `border-line-strong`).

```tsx
<Button variant="solid" size="md" label="Empezar" icon="arrow-right" />
```
