#!/usr/bin/env pwsh
# Andamiaje idempotente para registrar experimentos/piezas nuevas:
#   - crea el .md de contenido (NUNCA sobrescribe uno existente)
#   - inserta el import + la entrada en src/lib/registry.tsx (ordenado por categoría)
#
# Todo experimento nuevo (fondos y textos) entra SIEMPRE con `category: pendiente`;
# la categoría temática final se decide al publicar con change-experiment-category.
# Las piezas de UI usan su propia categoría de la colección ui (por defecto "buttons").
#
# Uso:
#   pwsh .../scaffold.ps1 -Spec spec.json
#   pwsh .../scaffold.ps1 -Json '[{...}]'
#   pwsh .../scaffold.ps1 -Spec spec.json -DryRun
#
# Formato del spec (array de entradas):
# [
#   {
#     "kind": "background",            # background | text | ui  (elige carpeta + colección)
#     "component": "FooBackground",    # nombre del export por defecto
#     "slug": "foo",                   # nombre del .md (sin extensión)
#     "title": "Foo",
#     "description": "…",
#     "props": [                       # puede ir vacío
#       { "name": "count", "label": "Cantidad", "type": "number", "default": 8, "min": 1, "max": 40, "step": 1 },
#       { "name": "color", "label": "Color", "type": "color", "default": "#ffffff" }
#     ],
#     "uiCategory": "buttons",         # solo kind=ui
#     "usage": "## Uso\n\n…"           # cuerpo markdown tras el frontmatter
#   }
# ]

param(
  [string]$Spec,
  [string]$Json,
  [string]$Root,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Find-RepoRoot([string]$start) {
  $dir = $start
  while ($dir -and -not (Test-Path (Join-Path $dir 'src/content.config.ts'))) {
    $parent = Split-Path -Parent $dir
    if ($parent -eq $dir) { break }
    $dir = $parent
  }
  if (-not (Test-Path (Join-Path $dir 'src/content.config.ts'))) {
    throw 'No se encontró src/content.config.ts subiendo desde el script. Pasa -Root.'
  }
  return $dir
}

function Format-YamlScalar($v) {
  if ($null -eq $v) { return $null }
  if ($v -is [bool]) { if ($v) { return 'true' } else { return 'false' } }
  if ($v -is [int] -or $v -is [long] -or $v -is [double] -or $v -is [decimal] -or $v -is [single]) {
    return $v.ToString([System.Globalization.CultureInfo]::InvariantCulture)
  }
  $s = [string]$v
  $esc = $s.Replace('\', '\\').Replace('"', '\"')
  return '"' + $esc + '"'
}

function Format-YamlList($arr) {
  $items = @($arr | ForEach-Object { Format-YamlScalar $_ })
  return '[' + ($items -join ', ') + ']'
}

function Build-PropsYaml($props) {
  $out = New-Object System.Collections.Generic.List[string]
  $list = @($props)
  if ($list.Count -eq 0 -or ($list.Count -eq 1 -and $null -eq $list[0])) {
    $out.Add('props: []')
    return $out
  }
  $out.Add('props:')
  foreach ($p in $list) {
    $names = $p.PSObject.Properties.Name
    if ($names -notcontains 'name' -or $names -notcontains 'type') {
      throw "Cada prop necesita 'name' y 'type'. Revisa: $($p | ConvertTo-Json -Compress)"
    }
    $out.Add('  - name: ' + (Format-YamlScalar $p.name))
    if ($names -contains 'label' -and $null -ne $p.label) { $out.Add('    label: ' + (Format-YamlScalar $p.label)) }
    $out.Add('    type: ' + (Format-YamlScalar $p.type))
    if ($names -contains 'default' -and $null -ne $p.default) { $out.Add('    default: ' + (Format-YamlScalar $p.default)) }
    foreach ($f in 'min', 'max', 'step') {
      if ($names -contains $f -and $null -ne $p.$f) { $out.Add("    ${f}: " + (Format-YamlScalar $p.$f)) }
    }
    if ($names -contains 'options' -and $null -ne $p.options) { $out.Add('    options: ' + (Format-YamlList $p.options)) }
  }
  return $out
}

function Read-Lines([string]$path) {
  $raw = Get-Content -Raw -LiteralPath $path
  $nl = if ($raw -match "`r`n") { "`r`n" } else { "`n" }
  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($l in ($raw -split "`r?`n")) { $lines.Add($l) }
  # La última entrada suele ser '' por el salto final; la conservamos para reproducir el trailing newline.
  return [pscustomobject]@{ Lines = $lines; Newline = $nl }
}

function Write-Text([string]$path, [string]$text) {
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $text, $enc)
}

function Add-RegistryImport($lines, [string]$component, [string]$folder) {
  $existing = @()
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^import ([A-Za-z0-9_]+) from "\.\./components/([a-zA-Z0-9_\-]+)/') {
      $existing += [pscustomobject]@{ Name = $Matches[1]; Folder = $Matches[2]; Index = $i }
    }
  }
  if ($existing | Where-Object { $_.Name -eq $component }) { return $false }
  $same = @($existing | Where-Object { $_.Folder -eq $folder })
  $newLine = 'import ' + $component + ' from "../components/' + $folder + '/' + $component + '";'
  if ($same.Count -eq 0) {
    $insertAt = if ($existing.Count -eq 0) { 0 } else { ($existing | Measure-Object -Property Index -Maximum).Maximum + 1 }
  } else {
    $target = $same | Where-Object { [string]::Compare($_.Name, $component, [System.StringComparison]::OrdinalIgnoreCase) -gt 0 } | Sort-Object Index | Select-Object -First 1
    $insertAt = if ($target) { $target.Index } else { ($same | Measure-Object -Property Index -Maximum).Maximum + 1 }
  }
  $lines.Insert($insertAt, $newLine)
  return $true
}

function Add-RegistryEntry($lines, [string]$component, [string]$folder) {
  $map = @{}
  foreach ($l in $lines) {
    if ($l -match '^import ([A-Za-z0-9_]+) from "\.\./components/([a-zA-Z0-9_\-]+)/') { $map[$Matches[1]] = $Matches[2] }
  }
  $entries = @()
  $inObj = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $l = $lines[$i]
    if (-not $inObj -and $l -match '=\s*\{\s*$') { $inObj = $true; continue }
    if ($inObj -and $l -match '^\s*\}\s*;') { break }
    if ($inObj -and $l -match '^\s*([A-Za-z0-9_]+)\s*,\s*$') {
      $entries += [pscustomobject]@{ Name = $Matches[1]; Index = $i; Folder = $map[$Matches[1]] }
    }
  }
  if ($entries | Where-Object { $_.Name -eq $component }) { return $false }
  $same = @($entries | Where-Object { $_.Folder -eq $folder })
  $newLine = '  ' + $component + ','
  if ($entries.Count -eq 0) { $insertAt = 0 }
  elseif ($same.Count -eq 0) { $insertAt = ($entries | Measure-Object -Property Index -Maximum).Maximum + 1 }
  else {
    $target = $same | Where-Object { [string]::Compare($_.Name, $component, [System.StringComparison]::OrdinalIgnoreCase) -gt 0 } | Sort-Object Index | Select-Object -First 1
    $insertAt = if ($target) { $target.Index } else { ($same | Measure-Object -Property Index -Maximum).Maximum + 1 }
  }
  $lines.Insert($insertAt, $newLine)
  return $true
}

# ---- Carga del spec ----------------------------------------------------------
if (-not $Spec -and -not $Json) { throw 'Indica -Spec <archivo.json> o -Json ''[...]''.' }
$raw = if ($Spec) { Get-Content -Raw -LiteralPath $Spec } else { $Json }
$entries = @($raw | ConvertFrom-Json)
if ($entries.Count -eq 0) { throw 'El spec está vacío.' }

$repoRoot = if ($Root) { (Resolve-Path -LiteralPath $Root).Path } else { Find-RepoRoot $PSScriptRoot }
$registryPath = Join-Path $repoRoot 'src/lib/registry.tsx'
$expDir = Join-Path $repoRoot 'src/content/experiments'
$uiDir = Join-Path $repoRoot 'src/content/ui'

$reg = Read-Lines $registryPath
$regChanged = $false
$report = New-Object System.Collections.Generic.List[string]

foreach ($e in $entries) {
  $names = $e.PSObject.Properties.Name
  foreach ($req in 'kind', 'component', 'slug', 'title', 'description') {
    if ($names -notcontains $req -or [string]::IsNullOrWhiteSpace([string]$e.$req)) {
      throw "Entrada sin '$req': $($e | ConvertTo-Json -Compress)"
    }
  }
  $kind = [string]$e.kind
  $folder = switch ($kind) {
    'background' { 'backgrounds' }
    'text' { 'texts' }
    'ui' { 'ui' }
    default { throw "kind inválido '$kind' (usa background|text|ui)." }
  }
  $cat = if ($kind -eq 'ui') { if ($names -contains 'uiCategory' -and $e.uiCategory) { [string]$e.uiCategory } else { 'buttons' } } else { 'pendiente' }
  $component = [string]$e.component
  $slug = [string]$e.slug

  $destFile = Join-Path $repoRoot ("src/components/$folder/$component.tsx")
  $mdDir = if ($kind -eq 'ui') { $uiDir } else { $expDir }
  $mdPath = Join-Path $mdDir "$slug.md"
  $relMd = if ($kind -eq 'ui') { "src/content/ui/$slug.md" } else { "src/content/experiments/$slug.md" }

  if (-not (Test-Path -LiteralPath $destFile)) {
    $report.Add("AVISO  falta el componente adaptado: src/components/$folder/$component.tsx")
  }

  # 1) .md
  if (Test-Path -LiteralPath $mdPath) {
    $report.Add("SKIP   $relMd ya existe (no se sobrescribe)")
  } else {
    $front = New-Object System.Collections.Generic.List[string]
    $front.Add('---')
    $front.Add('title: ' + (Format-YamlScalar ([string]$e.title)))
    $front.Add('description: ' + (Format-YamlScalar ([string]$e.description)))
    $front.Add('category: ' + $cat)
    $front.Add('component: ' + (Format-YamlScalar $component))
    foreach ($pl in (Build-PropsYaml $e.props)) { $front.Add($pl) }
    $front.Add('---')
    $usage = if ($names -contains 'usage' -and $e.usage) { [string]$e.usage } else { "## Uso`n`nDescripción breve y un ejemplo representativo.`n`n``````tsx`n<$component />`n``````" }
    $body = ($front -join "`n") + "`n`n" + $usage + "`n"
    if (-not $DryRun) { if (-not (Test-Path -LiteralPath $mdDir)) { New-Item -ItemType Directory -Path $mdDir -Force | Out-Null }; Write-Text $mdPath $body }
    $report.Add("OK     $relMd " + $(if ($DryRun) { '(dry-run)' } else { 'creado' }))
  }

  # 2) registry.tsx
  $imp = Add-RegistryImport $reg.Lines $component $folder
  if ($imp) { $regChanged = $true }
  $ent = Add-RegistryEntry $reg.Lines $component $folder
  if ($ent) { $regChanged = $true }
  $report.Add("REG    registry.tsx: import=$(if ($imp) { 'añadido' } else { 'ya estaba' }), entry=$(if ($ent) { 'añadida' } else { 'ya estaba' })")
}

if (-not $DryRun -and $regChanged) { Write-Text $registryPath (($reg.Lines -join $reg.Newline) + $reg.Newline) }

Write-Output ("== scaffold " + $(if ($DryRun) { '(dry-run, sin escribir)' } else { 'aplicado' }) + " ==")
foreach ($r in $report) { Write-Output "  $r" }
if ($DryRun) { Write-Output '  (dry-run: registry.tsx NO se ha modificado)' }
