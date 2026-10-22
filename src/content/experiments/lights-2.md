---
title: "Guirnalda de luces 2"
description: "Guirnaldas de luces colgantes que oscilan; el puntero las empuja."
category: pendiente
component: "Lights2Background"
props:
  - name: "rows"
    label: "Guirnaldas"
    type: "number"
    default: 3
    min: 1
    max: 8
    step: 1
  - name: "bulbs"
    label: "Bombillas por guirnalda"
    type: "number"
    default: 16
    min: 4
    max: 60
    step: 1
  - name: "slack"
    label: "Holgura"
    type: "number"
    default: 0.2
    min: 0
    max: 1
    step: 0.01
  - name: "push"
    label: "Empuje del puntero"
    type: "number"
    default: 1
    min: 0
    max: 4
    step: 0.1
  - name: "spd"
    label: "Parpadeo"
    type: "number"
    default: 2
    min: 0
    max: 10
    step: 0.1
---

## Uso

Guirnaldas de luces colgantes que oscilan; el puntero las empuja.

```tsx
<Lights2Background rows={3} bulbs={16} />
```
