---
title: Toggle de tema
description: "Interruptor claro/oscuro con knob animado. En la galería solo es visual."
category: buttons
component: ThemeToggle
props:
  - name: size
    label: Tamaño
    type: select
    default: md
    options: [xs, sm, md, lg]
  - name: variant
    label: Variante
    type: select
    default: toggle
    options: [toggle, solid, mini, solid-mini]
  - name: shape
    label: Forma (modos mini)
    type: select
    default: circle
    options: [circle, rounded, squared]
---

## Uso

`variant="solid"` rellena los iconos  
`variant="mini"` lo convierte en un botón redondo que alterna el icono  
`variant="solid-mini"` combina ambos  
`shape` controla el borde en los modos mini (`circle`, `rounded`, `squared`)

```tsx
<ThemeToggle size="md" variant="toggle" />
```
