---
title: "Lava Lamp"
description: "Burbujas de cera que suben y bajan con interacción del puntero"
category: simulacion
component: LavaLampBackground
props:
  - name: count
    label: "Cantidad"
    type: number
    default: 12
    min: 1
    max: 20
    step: 1
  - name: size
    label: "Tamaño"
    type: number
    default: 0.09
    min: 0.05
    max: 0.25
    step: 0.01
  - name: speed
    label: "Velocidad"
    type: number
    default: 3
    min: 0.1
    max: 3
    step: 0.1
  - name: heat
    label: "Calor del puntero"
    type: number
    default: 5
    min: 0
    max: 5
    step: 0.1
  - name: softness
    label: "Suavidad"
    type: number
    default: 0.01
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
  - name: pool
    label: "Charcos"
    type: boolean
    default: true
  - name: opacity
    label: "Opacidad"
    type: number
    default: 0.15
    min: 0.1
    max: 1
    step: 0.05
  - name: color
    label: "Color de cera"
    type: color
  - name: core
    label: "Color del núcleo"
    type: color
    default: "#ffffff"
---
## Uso

Simula una lámpara de lava con burbujas que suben y bajan según su temperatura. El puntero calienta las burbujas cercanas, haciendo que asciendan; mantén pulsado para triplicar el calor. Ajusta `count`, `size`, `speed`, `heat`, `softness`, `glow`, `pool` y `opacity` para afinar el efecto. Usa `color`, `core` y `background` para personalizar la paleta.

```tsx
import LavaLampBackground from "@kimografico/laboratorio/backgrounds/LavaLampBackground";

export default function Example() {
  return (
    <div style={{ height: "100vh" }}>
      <LavaLampBackground count={10} heat={1.2} color="#ff6b35" core="#ffd23f" />
    </div>
  );
}
```