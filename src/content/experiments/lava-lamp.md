---
title: "Lava Lamp"
description: "Burbujas de cera que suben y bajan con interacción del puntero"
category: backgrounds
component: LavaLampBackground
props:
  - name: count
    label: "Cantidad"
    type: number
    default: 8
    min: 2
    max: 20
    step: 1
  - name: size
    label: "Tamaño"
    type: number
    default: 0.11
    min: 0.05
    max: 0.25
    step: 0.01
  - name: speed
    label: "Velocidad"
    type: number
    default: 1
    min: 0.1
    max: 3
    step: 0.1
  - name: heat
    label: "Calor del puntero"
    type: number
    default: 1
    min: 0
    max: 2
    step: 0.1
  - name: softness
    label: "Suavidad"
    type: number
    default: 0.05
    min: 0.01
    max: 0.2
    step: 0.01
  - name: glow
    label: "Halo"
    type: number
    default: 0.18
    min: 0
    max: 0.6
    step: 0.01
  - name: scale
    label: "Resolución"
    type: number
    default: 4
    min: 2
    max: 8
    step: 1
  - name: pool
    label: "Charcos"
    type: boolean
    default: true
  - name: opacity
    label: "Opacidad"
    type: number
    default: 0.75
    min: 0.1
    max: 1
    step: 0.05
  - name: color
    label: "Color de cera"
    type: color
    default: "#e8643c"
  - name: core
    label: "Color del núcleo"
    type: color
    default: "#f7b267"
  - name: background
    label: "Fondo"
    type: color
    default: "#e0dad5"
---
## Uso

Simula una lámpara de lava con burbujas que suben y bajan según su temperatura. El puntero calienta las burbujas cercanas, haciendo que asciendan. Ajusta `count`, `size`, `speed`, `heat`, `softness`, `glow`, `scale`, `pool` y `opacity` para afinar el efecto. Usa `color`, `core` y `background` para personalizar la paleta.

```tsx
import { LavaLampBackground } from "@kimografico/laboratorio";

export default function Example() {
  return (
    <div style={{ height: "100vh" }}>
      <LavaLampBackground count={10} heat={1.2} color="#ff6b35" core="#ffd23f" background="#1a1a1a" />
    </div>
  );
}
```