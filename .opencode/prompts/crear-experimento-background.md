# Prompt: crear un experimento de fondo para Laboratorio

> Copia este prompt completo en la IA que vaya a implementar el experimento. Rellena primero la sección **Encargo**. El prompt incluye las convenciones del proyecto para que la IA no dependa de haber visto este repositorio antes.

## Encargo

- **Nombre o fenómeno que quiero representar:** `[DESCRIBE AQUÍ EL FONDO]`
- **Sensación y estilo visual:** `[ATMÓSFERA, REFERENCIAS O ADJETIVOS]`
- **Comportamiento e interacción deseados:** `[QUÉ SE MUEVE Y CÓMO RESPONDE AL PUNTERO, CLIC, ETC.]`
- **Parámetros que quiero poder ajustar:** `[OPCIONAL; SI NO, PROPÓN SOLO LOS IMPRESCINDIBLES]`
- **Restricciones adicionales:** `[OPCIONAL: rendimiento, densidad, complejidad, etc.]`

## Rol y objetivo

Actúa como especialista senior en React, TypeScript y creative coding para navegador. Diseña e implementa un fondo interactivo original, refinado y listo para integrarse en **Laboratorio**, un showcase de fondos y efectos de texto publicado también como librería React. No te limites a proponer una idea: entrega una implementación completa y, si tienes acceso al repositorio, intégrala y verifícala.

El experimento debe tener una identidad visual propia y una composición cuidada: buena escala, profundidad, ritmo y contraste, movimiento legible y controles que produzcan cambios perceptibles. Busca calidad comparable a un experimento editorial terminado, no a una demo técnica. La complejidad debe servir al resultado: evita añadir controles sin valor visual, ruido decorativo, animación nerviosa o detalles que compitan con el contenido de la página.

## Contexto del proyecto

- El proyecto usa React con TypeScript, Astro para el sitio y tsup para generar una librería ESM con declaraciones de tipos.
- Los fondos están en `src/components/backgrounds/` y suelen usar un componente React que dibuja en `<canvas>`.
- El registro de componentes del sitio vive en `src/lib/registry.tsx`.
- Cada experimento del catálogo tiene metadatos y controles de playground en `src/content/experiments/<slug>.md`.
- El sitio importa los estilos globales desde `src/styles/global.css`.
- `src/components/backgrounds/base.css` define la clase común `.bg-canvas`. No la redefines.
- El paquete genera automáticamente una entrada por cada `src/components/backgrounds/*.tsx`. No crees un barrel.
- Los componentes son consumibles por separado como `@kimografico/laboratorio/backgrounds/<Nombre>`.

Si tienes acceso a los archivos reales, léelos antes de editar y respeta el estado existente. En particular, compara con los ejemplos de referencia al final. No reemplaces ni reformatees cambios previos ajenos al encargo.

## Contrato de implementación

### Archivo y API

1. Crea `src/components/backgrounds/<Nombre>Background.tsx`.
2. Exporta por defecto una función `NombreBackground` y exporta `NombreBackgroundProps`.
3. Usa props opcionales con defaults explícitos y una interfaz TypeScript concreta. Documenta cada prop en español; indica unidades y rangos cuando aplique.
4. Incluye `className?: string` y, si el fondo es esencialmente monocromo, `color?: string` opcional **sin valor por defecto**.
5. Mantén la API pequeña: expón únicamente controles que modifiquen de forma clara el resultado. Para números, elige límites seguros y un paso coherente. Evita valores fuera de rango, divisiones por cero y consumo de memoria sin límite.
6. El wrapper será `<div className={`bg-canvas ${className ?? ""}`.trim()}>` con el canvas dentro. No pintes un fondo opaco ni añadas `background`/`backgroundColor` al wrapper: el fondo debe ser transparente para funcionar como capa en la galería.

### Tema y color: requisito fundamental

El sitio admite tema oscuro y claro. El fondo debe integrarse visualmente con ambos y con la página en la que se instale:

1. Para el color principal, usa la tinta heredada de CSS. Obtén una sola vez `const style = getComputedStyle(canvas)` y, dentro de cada fotograma, lee:

   ```ts
   const ink = style.getPropertyValue("--<nombre-kebab>-color").trim() || style.color;
   const rawOpacity = style.getPropertyValue("--<nombre-kebab>-opacity").trim();
   const themeOpacity =
     rawOpacity !== "" && Number.isFinite(Number(rawOpacity)) ? Number(rawOpacity) : 1;
   ```

   Sustituye `<nombre-kebab>` por el nombre estable del efecto, por ejemplo `flow` para `FlowBackground`.
2. Dibuja con `ink` (y `themeOpacity` multiplicando la opacidad local) en lugar de fijar negro o blanco. El estilo inline del wrapper solo escribe la variable de tinta cuando se proporciona `color`:

   ```tsx
   style={color ? ({ "--<nombre-kebab>-color": color } as React.CSSProperties) : undefined}
   ```

   No pongas un color de tinta predeterminado en el componente; la página aporta el color heredado.
3. Limita a `[0, 1]` cualquier alpha antes de asignarlo a `ctx.globalAlpha`. Restablece el estado del contexto al terminar cada fotograma. Si usas `save`, `restore` o modos de composición, asegúrate de restaurarlos incluso en el flujo normal de renderizado.
4. No uses el color del tema como color de fondo: el canvas queda transparente. No hardcodees `#fff`, `#000` ni colores de UI para el trazo principal.
5. Una paleta intrínseca puede ser parte esencial del concepto (por ejemplo, aurora, arcoíris o fuego). En ese caso conserva los tonos como identidad del efecto, pero explica por qué no siguen la tinta; mantén la transparencia, limita alphas y no añadas colores arbitrarios al fondo. Si el efecto permite elegir un color principal, debe respetar el contrato de `color`.
6. Los controles de color del playground se declaran como `type: color`. No marques `themed: false` salvo que el color sea intencionalmente una paleta fija/semántica que no deba invertirse. En el playground, un color que sigue en su valor inicial puede adaptarse al tema; un color modificado por el usuario queda bajo su control.
7. Si el diseño necesita varios tonos elegibles, justifica cada tono como parte de la paleta del fenómeno y asegúrate de que las combinaciones sigan legibles en tema claro y oscuro. No sustituyas las variables semánticas de interfaz (`--surface`, `--panel`, `--fg`, etc.) ni copies colores del UI.

### Canvas, movimiento y ciclo de vida

1. Usa `useRef<HTMLCanvasElement>(null)` y `useEffect`. Comprueba `canvas.getContext("2d")`; no asumas que siempre está disponible.
2. Usa `canvas.clientWidth`/`clientHeight` para actualizar dimensiones del canvas y reconstruir cualquier estado que dependa del tamaño. Sigue el patrón existente del proyecto; no introduzcas `devicePixelRatio` si no es necesario para preservar el aspecto.
3. Si el cálculo necesita tiempo, deriva el movimiento de `time` o de `dt`, no del número de renders. Limita `dt` ante pausas largas para que al volver a la pestaña el sistema no explote.
4. Genera o reinicia partículas/estado aleatorio en `resize()` para que el redimensionado deje el sistema en estado válido.
5. Usa `ResizeObserver` sobre el canvas. Registra listeners en `window` cuando la interacción deba funcionar en toda la superficie; convierte coordenadas de pantalla a coordenadas del canvas con `getBoundingClientRect()`.
6. Limpia todo: `cancelAnimationFrame`, `ResizeObserver.disconnect()` y cada listener instalado. No dejes animaciones ni eventos huérfanos.
7. Incluye en las dependencias del efecto todas las props de simulación. Para arrays, calcula una clave estable (por ejemplo, `colors.join(",")`) y usa esa clave como dependencia. Como los valores de color se consultan desde CSS en cada fotograma, normalmente `color` y `className` no necesitan reiniciar la simulación.
8. Evita acumular entidades sin límite. Define máximos razonables, retira estados caducados y evita crear objetos, gradientes o buffers innecesarios por cada partícula y fotograma.
9. El fondo no debe capturar interacciones de la página. Mantén el wrapper decorativo y no bloquees clics; aun así, escucha el puntero globalmente si la escena debe reaccionar a él.
10. Si es un efecto puramente decorativo, no le asignes semántica interactiva engañosa. El movimiento debe conservar una composición atractiva incluso sin el puntero.

### Calidad visual y diseño de controles

- Decide primero qué fenómeno se verá y cómo ocupa el espacio; después elige el algoritmo. No uses una técnica porque sí.
- Debe leerse como fondo: textura y detalle suficientes al observarlo, pero sin robar protagonismo al contenido superpuesto.
- Usa variación controlada en posición, escala, velocidad, fase, opacidad o profundidad. Evita aleatoriedad uniforme que parezca ruido sin estructura.
- Mantén el movimiento suave, con cambios de estado y bordes legibles. Evita parpadeos rápidos, saltos inesperados, deriva infinita y jitter.
- Distingue controles con efectos visuales diferentes. Prefiere nombres descriptivos, unidades y rangos útiles. Incluye un `alpha`/opacidad solo si tiene sentido y multiplícalo por el factor de tema.
- Cuando el algoritmo sea físico, explica qué magnitud simula cada control. Evita que un control llamado “peso”, “tensión” o “velocidad” altere secretamente varias magnitudes no relacionadas.
- Respeta `prefers-reduced-motion` si la animación es intensa o continua; ofrece una escena quieta que siga siendo visualmente útil.

## Integración en el repositorio

Si puedes modificar el repositorio, integra todas las superficies necesarias:

1. Añade el componente en `src/components/backgrounds/<Nombre>Background.tsx`.
2. Registra import y entrada en `src/lib/registry.tsx`; mantén el estilo y el orden existente.
3. Crea `src/content/experiments/<slug>.md` con `title`, `description`, `category`, `component` y `props`. Cada control visible debe tener su definición correspondiente: `name`, `label`, `type`, `default`, `min`, `max`, `step` y, si es select, `options`.
4. Para un experimento nuevo, usa inicialmente `category: pendiente`. Si la petición explícitamente es publicarlo, decide la categoría clara según el concepto: patrones y teselados `geometria`; curvas, fórmulas y atractores `matematica`; flora, fauna, agua y paisaje `naturaleza`; partículas, muelles, física y autómatas `simulacion`. No inventes categorías.
5. La descripción y `## Uso` deben explicar el fenómeno, la interacción, los controles y cómo consumir el componente. Añade un ejemplo JSX real, con defaults existentes. En YAML, cita cualquier valor que contenga `: `.
6. Si creas CSS adicional, colócalo junto al componente y añade su import al CSS global del sitio cuando el proyecto así lo requiera. No añadas una hoja si el canvas no la necesita.
7. Comprueba si el componente debe importarse en el registry y si cada prop/documentación corresponde exactamente al comportamiento real. Evita tocar componentes no relacionados.

## Verificación

Si tienes terminal y dependencias instaladas, ejecuta al menos:

```powershell
npm run check
npm run build:lib
```

Si se modifica el contenido o las rutas del sitio, ejecuta también `npm run build`. Informa con claridad qué validaciones se pudieron hacer y cuáles no. No afirmes que una compilación o una integración visual pasó si no la ejecutaste.

## Formato de entrega

Al terminar, resume:

1. El efecto y las decisiones visuales/técnicas importantes.
2. Los archivos añadidos o modificados.
3. Los controles y sus rangos.
4. Cómo se adapta al tema claro/oscuro y cualquier excepción de paleta fija.
5. Los comandos ejecutados y su resultado.

Si no tienes acceso al repositorio, entrega el contenido completo de cada archivo con su ruta sugerida y señala las partes que la persona deberá integrar manualmente.

## Referencias recomendadas del proyecto

Si el usuario puede adjuntar referencias, usa estas como guía de patrones, no como código para copiar literalmente:

- `src/components/backgrounds/FlowBackground.tsx`: referencia principal para una simulación de partículas, el puntero, el color/opacidad por CSS, el borrado de estela independiente del fondo y la limpieza de eventos.
- `src/components/backgrounds/RainRipplesBackground.tsx`: referencia para una simulación dependiente del tiempo, dt limitado, colecciones con ciclo de vida, interacción de puntero y tinta que sigue el tema.
- `src/components/backgrounds/LightsBackground.tsx`: referencia avanzada para una estructura de cuerda física, bombillas escalonadas, gravedad, tensión ajustable y varias interacciones. Úsala solo si el nuevo efecto también es una simulación física.
- `src/components/backgrounds/AuroraBackground.tsx`: referencia para movimiento orgánico, seguimiento del puntero y una paleta intrínseca. Su paleta fija es una excepción deliberada al color monocromo heredado; no la copies como regla general de tema.

Para un background genérico, adjunta primero **FlowBackground** y **RainRipplesBackground**. Añade **LightsBackground** si hay cuerdas, partículas conectadas o física; añade **AuroraBackground** si el concepto requiere manchas o paleta propia.
