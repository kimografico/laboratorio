---
title: Physarum
description: Red de venas de moho polimorfo que crece sobre el fondo y converge hacia el alimento del puntero.
category: simulacion
component: PhysarumBackground
props:
  - name: density
    label: Densidad
    type: number
    default: 12
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
    default: 40
    min: 4
    max: 60
    step: 1
  - name: turn
    label: Giro (rad)
    type: number
    default: 0.75
    min: 0.05
    max: 2
    step: 0.05
  - name: persistence
    label: Persistencia
    type: number
    default: 0.95
    min: 0.85
    max: 0.995
    step: 0.005
  - name: diffusion
    label: Difusión
    type: number
    default: 0.35
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
    default: 1.25
    min: 0.1
    max: 1.5
    step: 0.05
  - name: opacity
    label: Opacidad
    type: number
    default: 0.5
    min: 0
    max: 1
    step: 0.02
  - name: color
    label: Color
    type: color
---

## Uso

Miles de agentes huelen el rastro que dejan los demás y lo depositan en un mapa de alta resolución; `threshold` y `sharpness` dejan las venas más finas o más difusas. El puntero siembra alimento (`lure`) y reclama una fracción de los agentes (`attraction`, `reach`, `sink`), que entran desde el borde y dibujan venas convergentes.

```tsx
<PhysarumBackground density={8} steps={4} sensor={20} persistence={0.94} attraction={1.5} />
```
