---
title: Typewriter Text
description: El texto se escribe carácter a carácter con un cursor que va avanzando y parpadea. Clásico para titulares y kickers.
category: texts
component: TypewriterText
props:
  - name: children
    label: Texto
    type: text
  - name: speed
    label: Velocidad por carácter (s)
    type: number
    default: 0.06
    min: 0.01
    max: 0.4
    step: 0.01
  - name: delay
    label: Retraso (s)
    type: number
    default: 0.3
    min: 0
    max: 3
    step: 0.1
  - name: caret
    label: Cursor
    type: boolean
    default: true
---

## Uso

Usa `steps()` sobre el ancho del contenedor, por lo que conviene una tipografía monoespaciada (es la que aplica por defecto).

```tsx
<TypewriterText>Escribiendo un titular</TypewriterText>
<TypewriterText speed={0.04} caret={false}>Sin cursor</TypewriterText>
```
