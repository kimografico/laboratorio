---
title: Botón de icono
description: "Botón de solo icono, con forma circular o cuadrada y variantes."
category: buttons
component: IconButton
props:
  - name: icon
    label: Icono
    type: select
    default: arrow-right
    options: [arrow-right, plus, check, download, search, heart]
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
  - name: shape
    label: Forma
    type: select
    default: circle
    options: [circle, square]
  - name: disabled
    label: Deshabilitado
    type: boolean
    default: false
---

## Uso

Pensado para acciones compactas. Usa `shape="square"` para un look tipo toolbar.

```tsx
<IconButton icon="plus" variant="outline" size="md" shape="circle" />
```
