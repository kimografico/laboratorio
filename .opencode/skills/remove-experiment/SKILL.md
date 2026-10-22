---
name: remove-experiment
description: >-
  Use when the user asks to remove, delete or retire an experiment from the
  showcase ("elimina doble-rendija", "borra este experimento", "quita el
  experimento del registro"). Locates the experiment by slug, removes its
  content page, React component and owned CSS, and cleans the matching import
  and entry from src/lib/registry.tsx. Do not use for UI pieces in
  src/content/ui.
---

# Eliminar un experimento

Elimina un experimento completo del showcase y de la librería, dejando el
registro y el contenido coherentes. Es un skill destructivo: valida primero,
muestra el plan y solo después borra.

## Alcance

Solo experimentos de `src/content/experiments/`. No elimines piezas de interfaz
de `src/content/ui/`, páginas de `src/content/pages/` ni material original de
`+/`.

## Archivos que se tocan

Por cada experimento:

1. **Borrar** `src/content/experiments/<slug>.md`.
2. **Borrar** su componente:
   - `src/components/backgrounds/<Component>.tsx`, o
   - `src/components/texts/<Component>.tsx`.
3. **Borrar** el CSS propio que exista junto al componente:
   - `src/components/texts/<Component>.css`,
   - `src/components/backgrounds/<Component>.css`,
   - módulos del tipo `<Component>.module.css`.
4. **Editar** `src/lib/registry.tsx`: eliminar el import y la entrada del
   componente en el mapa.

No se modifican:

- `package.json` ni `tsup.config.ts` (los entries de la librería se generan por
  glob).
- `src/content.config.ts`, `src/lib/categories.ts` ni `theme.css`.
- CSS compartido: `base.css`, `_shared.css`, `theme.css`, `global.css`.
- Otros experimentos, `src/content/ui/`, `+/`, `dist/` ni `dist-site/`.

## Localizar el experimento

El slug es la clave inequívoca: es el nombre del `.md` sin extensión. Si el
usuario da un título o un componente, localízalo antes de borrar:

```powershell
Get-ChildItem src/content/experiments -Filter *.md |
  Select-String -Pattern 'component:\s*NombreDelComponente'
```

O usa el skill `list-experiments`. No adivines entre varios candidatos: si hay
ambigüedad, pregunta.

## Comando

Primero muestra el plan sin tocar nada:

```powershell
pwsh .opencode/skills/remove-experiment/scripts/remove.ps1 -Slugs doble-rendija -DryRun
```

Para varios experimentos:

```powershell
pwsh .opencode/skills/remove-experiment/scripts/remove.ps1 -Slugs foo,bar -DryRun
```

Cuando el plan sea correcto, ejecuta sin `-DryRun`:

```powershell
pwsh .opencode/skills/remove-experiment/scripts/remove.ps1 -Slugs doble-rendija
```

Opciones:

- `-Root <ruta>`: raíz alternativa, útil para probar el script en un fixture.
- `-Force`: permite borrar aunque el nombre del componente aparezca en otros
  archivos. Úsalo solo después de comprobar que esas referencias son ajenas o
  que se eliminan por separado.

El script valida todos los slugs antes de escribir. Si uno falla, no modifica
ninguno. Es idempotente en el registro: si el import o la entrada ya no están,
no los duplica ni falla por ello.

## Comprobaciones del script

- El `.md` existe y está en `src/content/experiments/`.
- El frontmatter tiene `component`.
- El componente no está duplicado entre `backgrounds/` y `texts/`.
- El componente no es una pieza de `src/components/ui/`.
- No quedan referencias externas al componente (imports, JSX o
  `component:` en otro archivo).
- El registro contiene el import y la entrada esperados; si faltan, lo indica.

## Después de eliminar

1. Comprueba que no quedan referencias:

```powershell
rg -n "NombreDelComponente|slug-del-experimento" src
```

2. Ejecuta la verificación completa, en este orden y sin paralelizar builds:

```powershell
npm run check
npm run build
npm run build:lib
```

3. Confirma que la ruta ya no se genera:

```powershell
Test-Path dist-site/experiment/<slug>
```

Debe devolver `False`. Los directorios `dist/` y `dist-site/` son generados: no
los edites a mano; el build los reconstruye.

## Ejemplo real

Para `doble-rendija`:

- Borrar `src/content/experiments/doble-rendija.md`.
- Borrar `src/components/backgrounds/DobleRendijaBackground.tsx`.
- Quitar `DobleRendijaBackground` del import y del objeto de
  `src/lib/registry.tsx`.
- No hay CSS propio ni assets compartidos que borrar.
- Tras el build, `dist-site/experiment/doble-rendija/` deja de existir y la
  ruta responde 404.

## Límites y seguridad

- No borres `_shared.css`, `base.css` ni ningún CSS compartido.
- Si el componente importa un asset local, comprueba si es exclusivo antes de
  borrarlo. El script no elimina assets automáticamente para no romper otros
  experimentos.
- Si el componente se usa desde otro componente, detente y pide autorización.
- No elimines el `.md` de una pieza de interfaz con este skill.
- No toques los archivos originales de `+/`.
