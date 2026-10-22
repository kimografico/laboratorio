---
title: "Guirnalda de luces"
description: "Guirnaldas de bombillas que cuelgan, se mecen y se encienden con el puntero o un clic."
category: simulacion
component: "LightsBackground"
props:
  - name: "strands"
    label: "Guirnaldas"
    type: "number"
    default: 4
    min: 1
    max: 10
    step: 1
  - name: "bulbs"
    label: "Bombillas"
    type: "number"
    default: 16
    min: 3
    max: 40
    step: 1
  - name: "weight"
    label: "Gravedad"
    type: "number"
    default: 0.4
    min: 0
    max: 1
    step: 0.01
  - name: "tension"
    label: "Tensión"
    type: "number"
    default: 50
    min: 0
    max: 100
    step: 0.1
  - name: "size"
    label: "Radio bombilla (px)"
    type: "number"
    default: 7
    min: 2
    max: 20
    step: 0.5
  - name: "wind"
    label: "Brisa"
    type: "number"
    default: 2
    min: 0
    max: 2
    step: 0.05
  - name: "damping"
    label: "Amortiguación"
    type: "number"
    default: 0.93
    min: 0.85
    max: 0.99
    step: 0.005
  - name: "glow"
    label: "Alcance de luz (px)"
    type: "number"
    default: 170
    min: 40
    max: 400
    step: 5
  - name: "pulse"
    label: "Pulso (px/s)"
    type: "number"
    default: 600
    min: 100
    max: 2000
    step: 25
  - name: "radius"
    label: "Radio puntero (px)"
    type: "number"
    default: 120
    min: 20
    max: 300
    step: 5
  - name: "alpha"
    label: "Opacidad"
    type: "number"
    default: 0.32
    min: 0
    max: 1
    step: 0.01
  - name: "lineWidth"
    label: "Grosor línea"
    type: "number"
    default: 1
    min: 0.5
    max: 3
    step: 0.1
  - name: "multicolor"
    label: "Luces multicolor"
    type: "boolean"
    default: true
---

## Uso

Las bombillas cambian de color y titilan como en Guirnalda de luces 2. Desactiva `multicolor` para mostrarlas en blanco casi transparente. El prop opcional `color` fija el color de las líneas; la opacidad global se ajusta con `--lights-opacity` en CSS.

```tsx
<LightsBackground strands={3} bulbs={14} wind={0.4} multicolor />
```

### Controles

- **Gravedad:** controla la fuerza aplicada hacia abajo a cada punto de la cuerda. Un valor mayor hace que las guirnaldas caigan más; en `0`, la gravedad no provoca caída.
- **Tensión:** ajusta el número de iteraciones que mantienen la cuerda tensa. La escala de 0 a 100 se convierte exponencialmente en 10–1000 iteraciones: 0 equivale a 10, 100 a 1000 y el punto medio a unas 250. El valor inicial equivale aproximadamente a 150 iteraciones.
- **Amortiguación:** cuánta velocidad conserva el movimiento de la cuerda en cada fotograma; valores altos mantienen la oscilación durante más tiempo y valores bajos la frenan antes.
- **Pulso:** velocidad en píxeles por segundo de la onda de luz que se expande desde el punto donde haces clic.
- **Alcance de luz:** distancia en píxeles a la que el puntero empieza a encender las bombillas; un valor mayor afecta a más luces y desde más lejos.
