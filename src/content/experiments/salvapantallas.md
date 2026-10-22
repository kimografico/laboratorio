---
title: "Salvapantallas"
description: "Logotipos que rebotan y cambian de color al chocar. Clic = añade otro. El puntero los empuja."
category: pendiente
component: "SalvapantallasBackground"
props:
  - name: "n"
    label: "Cantidad"
    type: "number"
    default: 3
    min: 1
    max: 20
    step: 1
  - name: "sp"
    label: "Velocidad (px/s)"
    type: "number"
    default: 160
    min: 20
    max: 600
    step: 10
  - name: "w"
    label: "Ancho (px)"
    type: "number"
    default: 90
    min: 20
    max: 300
    step: 5
  - name: "push"
    label: "Empuje del puntero"
    type: "number"
    default: 1
    min: 0
    max: 4
    step: 0.1
---

## Uso

Los logotipos rebotan y cambian de color al chocar; el clic añade otro.

```tsx
<SalvapantallasBackground n={3} sp={160} />
```
