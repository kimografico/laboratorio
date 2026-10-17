---
title: Physarum
description: Red de venas de moho polimorfo que crece sobre el fondo y converge hacia el alimento del puntero.
category: backgrounds
component: PhysarumBackground
props:
  - name: density
    label: Densidad
    type: number
    default: 8
    min: 2
    max: 20
    step: 0.5
  - name: steps
    label: Pasos por fotograma
    type: number
    default: 4
    min: 1
    max: 10
    step: 1
  - name: sensor
    label: Sensor (px)
    type: number
    default: 20
    min: 4
    max: 60
    step: 1
  - name: turn
    label: Giro (rad)
    type: number
    default: 0.5
    min: 0.05
    max: 2
    step: 0.05
  - name: persistence
    label: Persistencia
    type: number
    default: 0.94
    min: 0.85
    max: 0.995
    step: 0.005
  - name: diffusion
    label: Difusión
    type: number
    default: 0.12
    min: 0
    max: 0.5
    step: 0.01
  - name: attraction
    label: Atracción
    type: number
    default: 1.5
    min: 0
    max: 3
    step: 0.1
  - name: reach
    label: Alcance (px)
    type: number
    default: 300
    min: 50
    max: 600
    step: 10
  - name: threshold
    label: Umbral
    type: number
    default: 0.6
    min: 0.1
    max: 1.5
    step: 0.05
  - name: opacity
    label: Opacidad
    type: number
    default: 0.85
    min: 0
    max: 1
    step: 0.02
  - name: color
    label: Color
    type: color
    default: "#7a4a1d"
  - name: background
    label: Fondo
    type: color
    default: "#e0dad5"
---

## Uso

Miles de agentes huelen el rastro que dejan los demás y lo depositan en un mapa de alta resolución; `threshold` y `sharpness` dejan las venas más finas o más difusas. El puntero siembra alimento (`lure`) y reclama una fracción de los agentes (`attraction`, `reach`, `sink`), que entran desde el borde y dibujan venas convergentes.

```tsx
<PhysarumBackground density={8} steps={4} sensor={20} persistence={0.94} attraction={1.5} />
```
