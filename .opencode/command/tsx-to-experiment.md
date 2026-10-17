---
description: Integra uno o más componentes .tsx en la librería y el showcase (registro, demo y verificación).
agent: tsx-to-experiment
---

Integra el/los componente(s) indicados siguiendo tu contrato de integración.

Argumentos: $ARGUMENTS

Si no se indica ningún archivo, revisa la carpeta `+/` y añade todos los `*.tsx`
que aún no estén integrados en `src/components/backgrounds/` (o `texts/`, según
corresponda). Para cada uno: coloca el archivo, adáptalo al contrato, regístralo
en `src/lib/registry.tsx`, crea su
`src/content/experiments/<slug>.md` y verifica con `npm run check` y `npm run build`.

No modifiques el algoritmo ni los valores por defecto del componente original.
