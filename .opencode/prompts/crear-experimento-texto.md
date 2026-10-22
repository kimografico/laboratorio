# Prompt: crear un efecto de texto para Laboratorio

> Copia este prompt completo en la IA que vaya a implementar el efecto. Rellena primero la sección **Encargo**. Este documento describe las convenciones de implementación, tema e integración de Laboratorio sin depender de que la IA haya visto el repositorio.

## Encargo

- **Nombre o tipo de efecto:** `[DESCRIBE AQUÍ LA ANIMACIÓN TIPOGRÁFICA]`
- **Sensación y estilo visual:** `[EJ.: SUTIL, EDITORIAL, MECÁNICO, LÚDICO]`
- **Cómo se comporta el texto:** `[QUÉ ANIMA: GLIFOS, PALABRAS, LÍNEAS, ETC.; INICIO, REPETICIÓN, FINAL]`
- **Controles que quiero:** `[OPCIONAL; SI NO, PROPÓN SOLO LOS IMPRESCINDIBLES]`
- **Texto de ejemplo:** `[OPCIONAL]`
- **Restricciones adicionales:** `[OPCIONAL: CSS PURO, SIN JS EN RUNTIME, ETC.]`

## Rol y objetivo

Actúa como especialista senior en React, TypeScript, CSS y motion design tipográfico. Diseña e implementa un efecto de texto original y refinado para **Laboratorio**, un catálogo de experimentos React integrado con Astro y publicado también como librería. No entregues solo una propuesta: proporciona el componente, su hoja CSS, los metadatos del playground y la integración necesaria si tienes acceso al repositorio.

La animación debe mejorar la lectura y aportar una personalidad clara sin convertir el texto en ruido. Prioriza timing, jerarquía, espaciado, ritmo, legibilidad y un estado final cuidado. Debe verse bien con el tamaño y la fuente heredados del sitio, y no depender de un fondo oscuro o de un tamaño de fuente concreto.

## Contexto del proyecto

- Los textos están en `src/components/texts/` y se publican como componentes React reutilizables.
- Cada efecto tiene `<NombreText>.tsx` y `<NombreText>.css`, con export default y una interfaz de props exportada.
- Los estilos comunes de la familia que trabaja por palabras y caracteres viven en `src/components/texts/_shared.css`.
- La página de catálogo y los controles del playground se describen en `src/content/experiments/<slug>.md`.
- `src/styles/global.css` importa los estilos CSS de los efectos usados en el sitio.
- `tsup.config.ts` genera automáticamente un entry por cada archivo `.tsx` de `src/components/texts/`; no hay barrel.
- Los componentes se importan como `@kimografico/laboratorio/texts/<NombreText>`. Cada CSS se consume por su ruta CSS correspondiente.
- Los textos se previsualizan dentro de una página con tema claro u oscuro y heredan la tipografía y el color del contexto.

Si tienes acceso al repositorio, inspecciona primero uno o más ejemplos de referencia. No copies el efecto existente: reutiliza las convenciones estructurales y crea una técnica/identidad visual propia. No sobrescribas cambios ajenos.

## Contrato de implementación

### API y React

1. Crea `src/components/texts/<NombreText>.tsx` y `src/components/texts/<NombreText>.css`.
2. Exporta por defecto `NombreText` y exporta `NombreTextProps`.
3. El texto se recibe como `children: string`; añade `className?: string`. Usa props opcionales con defaults explícitos, nombres claros y JSDoc en español con unidades.
4. Mantén el componente tipado y pequeño. Los controles del playground deben corresponder a los props reales y estar limitados a rangos que no rompan el layout o la animación.
5. Para un efecto de texto declarativo, prefiere JSX + CSS: evita `useEffect`, listeners, canvas y temporizadores cuando `@keyframes`, variables CSS y estado declarativo resuelvan el problema. Solo introduce lógica imperativa si es esencial al concepto.
6. Mantén la etiqueta raíz inline o inline-block según lo que necesite la transformación. No impongas fuente, color, tamaño global, peso ni fondo; deben heredarse de la página. `className` debe permitir estilos externos sin romper las clases propias.
7. Asegura que caracteres especiales, espacios, texto vacío, emojis/caracteres Unicode y palabras largas no se procesen de forma frágil. Si separas por glifos, usa iteración por puntos de código (`[...word]`) en vez de indexación UTF-16 (`word[i]`). No pierdas ni dupliques espacios.
8. Evita lecturas de `window`, `document` y mediciones DOM durante el render, para conservar compatibilidad con SSR. Si un efecto necesita medición, hazla después del montaje, límpiala y contempla cambios de tamaño.

### Herencia de color y temas: requisito fundamental

El efecto debe funcionar en los temas claro y oscuro de la página sin depender de un color de fondo:

1. Para el color principal, hereda `color` del elemento padre y usa `currentColor` en CSS (incluidos `text-shadow`, bordes y trazos). No pongas `color: #fff`, `color: #000` ni un color fijo en el componente o en su selector principal.
2. No pintes un fondo en el efecto. No fijes la apariencia a la superficie oscura del showcase.
3. No añadas una prop `color` salvo que sea una decisión de diseño realmente necesaria. La convención de estos textos es usar el color tipográfico heredado de la página.
4. Los acentos de color fijos solo se permiten cuando son indispensables para explicar el concepto (por ejemplo, los canales rojo/cian de un glitch). Limítalos a capas breves o detalles secundarios, mantenlos legibles en claro y oscuro, y conserva el texto base en `currentColor`. Evita usar la excepción para adornos arbitrarios.
5. Si propones un color configurable, no lo apliques automáticamente a todo el texto base; define cómo convive con el color heredado. El playground no debe forzar un color que haga desaparecer el texto en uno de los temas.
6. No confundas los tokens de interfaz (`--surface`, `--panel`, `--fg`, `--muted`, etc.) con el color del texto: el componente vive dentro de un contexto que ya aporta color y tipografía.

### CSS, estructura y animación

1. Usa una clase raíz única y específica del efecto (por ejemplo, `.wave-text`) y nombres descendientes igualmente específicos. Evita selectores globales como `span`, `p`, `*` o `body`.
2. Si el efecto anima cada glifo y lo organiza por palabras, importa la estructura común:

   ```css
   @import "./_shared.css";
   ```

   Esta hoja ofrece las clases `.tx-word`, `.tx-char` y `.tx-sep` para mantener palabras juntas, preservar separadores y transformar caracteres en línea. No alteres `_shared.css` para resolver algo que pertenece a un solo efecto.
3. Define variables CSS propias, con prefijo específico, como valores inline de las props (por ejemplo, `--tx-duration`, `--tx-delay`, `--tx-amplitude`). Declara unidades en esas variables (`s`, `em`, `deg`, `px`) siempre que proceda. No construyas strings CSS con valores sin validar si pueden llegar desde consumidores.
4. Mantén `@keyframes` con nombres únicos del efecto y usa curvas de timing intencionadas. Configura duración, delay, stagger y repetición para que cada prop tenga un efecto visual obvio.
5. Si descompones el texto, conserva una representación accesible legible: el nodo raíz puede exponer el texto completo mediante `aria-label`, y las copias visuales/fragmentadas pueden marcarse `aria-hidden="true"` para evitar anuncios repetidos. No ocultes todo el contenido a tecnologías de asistencia.
6. Define un estado final visible. Una animación de entrada no debe dejar el texto invisible si se desactiva la animación, si falla CSS o si el usuario prefiere movimiento reducido.
7. Respeta `@media (prefers-reduced-motion: reduce)`. Desactiva o simplifica el movimiento y deja el texto completo, legible y sin transformaciones que lo recorten. Si el efecto cambia su aspecto final (por ejemplo, relleno de texto transparente), restáuralo a `currentColor`.
8. No animes propiedades de layout costosas si una transformación o una máscara produce el mismo resultado. No uses filtros o sombras expansivas por cada glifo si son innecesarios. Evita `will-change` permanente en todos los caracteres.
9. Añade `key` al elemento raíz solo si el efecto necesita reiniciarse al cambiar texto/props; compón una clave estable con los valores relevantes. No fuerces remontajes que reinicien animaciones por cada render sin necesidad.
10. No asumas una línea, longitud o tamaño de fuente fijo. Prueba mentalmente títulos cortos y textos largos; evita saltos, clipping, pérdida de espacios o wrappers que impidan que el consumidor use su propia composición.

### Calidad del movimiento y controles

- La animación debe tener intención: aparición, énfasis, desplazamiento, deformación, revelado, etc. Explica visualmente qué se mueve y por qué.
- Usa el timing para dirigir la mirada, no para mantener cada carácter en movimiento por defecto. Un efecto de entrada puede ser de una sola pasada; un pulso ambiental puede repetirse.
- El stagger debe permanecer controlado para que un texto largo no tarde una eternidad. Si la duración total depende del número de caracteres, calcúlala de forma deliberada y documenta esa relación.
- El texto debe seguir siendo legible durante y después de la animación, salvo una breve transición inherente al concepto.
- No confundas un parámetro interno de implementación con un control útil. Expón solo propiedades que un usuario del playground entienda y pueda ajustar con un resultado apreciable.
- Documenta unidades y rangos: segundos para duración/retraso, `em` para desplazamiento tipográfico y grados para ángulos, por ejemplo.
- Mantén una versión estática de alta calidad cuando se desactive movimiento reducido o la animación haya terminado.

## Metadatos e integración

Si puedes modificar el repositorio:

1. Añade el componente y el CSS en `src/components/texts/`.
2. Importa `./_shared.css` desde el CSS del efecto cuando se use la estructura de palabras/glifos. Añade el nuevo CSS a `src/styles/global.css` para que se vea en el sitio.
3. Registra el componente en `src/lib/registry.tsx` (import y entrada del objeto de componentes), siguiendo el patrón existente. La galería y el playground resuelven los componentes mediante ese registro.
4. Crea `src/content/experiments/<slug>.md` con `title`, `description`, `category: texts`, `component` y `props`.
5. Incluye `children` como primer control de tipo `text`, normalmente con etiqueta `Texto`. Declara los demás controles con `name`, `label`, `type`, `default`, `min`, `max`, `step` y `options` si corresponde. Los tipos admitidos por el playground son `number`, `color`, `text`, `boolean`, `colors` y `select`.
6. Explica en la descripción la intención del efecto y en `## Uso` cómo se ve, qué controles lo cambian y si es de una pasada o repetitivo. Incluye uno o dos ejemplos JSX que compilen. Cita en YAML cualquier valor que contenga `: `.
7. El CSS de cada texto se publica por ruta propia: `@kimografico/laboratorio/texts/<NombreText>.css`. No crees un barrel. Conserva los nombres de clases y animaciones aislados para que importar varios efectos no cause colisiones.

## Verificación

Si hay terminal y dependencias instaladas, ejecuta:

```powershell
npm run check
npm run build:lib
```

Si el contenido o la página del sitio cambió, ejecuta además `npm run build`. Informa resultados reales y no declares verificación visual si no abriste una vista previa.

Antes de terminar revisa:

- El texto hereda el color y tipografía del entorno.
- El componente se ve con tema claro y oscuro sin fondo propio.
- La animación y el estado estático son legibles.
- `prefers-reduced-motion` no oculta ni recorta el contenido.
- El texto completo se anuncia una vez, no una vez por carácter.
- Los controles documentados coinciden con los props y defaults del componente.
- La hoja CSS se importa en el sitio y no introduce selectores globales.

## Formato de entrega

Resume el concepto, los archivos, los controles, el comportamiento de accesibilidad/tema y los comandos ejecutados. Si no tienes acceso al repositorio, entrega el contenido completo de cada archivo con su ruta sugerida y deja clara la integración manual pendiente.

## Referencias recomendadas del proyecto

Si el usuario puede adjuntar ejemplos, úsalos para aprender estructura y nivel de acabado, no para duplicar sus keyframes:

- `src/components/texts/FadeUpText.tsx` + `FadeUpText.css`: mejor referencia general para `children`, segmentación por palabras/glifos, delays por carácter, accesibilidad y CSS compartido.
- `src/components/texts/WaveText.tsx` + `WaveText.css`: referencia breve y clara para stagger, ciclos CSS y movimiento por carácter.
- `src/components/texts/GlowText.tsx` + `GlowText.css`: referencia para un efecto en línea que hereda el color con `currentColor`, usa variables CSS y admite movimiento reducido.
- `src/components/texts/FlipText.tsx` + `FlipText.css`: referencia para una animación tipográfica 3D y para un efecto con estructura CSS propia que no usa `_shared.css`.
- `src/components/texts/GlitchText.tsx` + `GlitchText.css`: referencia de un efecto cuya identidad requiere acentos cromáticos fijos; es una excepción, no el patrón de color predeterminado.

Para un efecto genérico nuevo, adjunta **FadeUpText** y **GlowText**; añade **WaveText** para un efecto por glifo o **FlipText** si la idea depende de perspectiva/3D. Usa **GlitchText** solo cuando el concepto requiera deliberadamente una paleta cromática ajena al tema.
