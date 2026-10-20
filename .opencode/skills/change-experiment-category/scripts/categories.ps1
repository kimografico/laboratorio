#!/usr/bin/env pwsh
# Lista las categorías de experimentos del repo:
#   - EXPERIMENT_CATEGORIES, BACKGROUND_CATEGORIES y CATEGORY_LABELS de
#     src/lib/categories.ts (fuente de verdad)
#   - las categorías realmente en uso en src/content/experiments/*.md
#
# Uso (desde la raíz del repo o desde cualquier sitio):
#   pwsh .opencode/skills/change-experiment-category/scripts/categories.ps1

$ErrorActionPreference = 'Stop'

# Localiza la raíz del repo subiendo hasta encontrar src/lib/categories.ts.
$dir = $PSScriptRoot
while ($dir -and -not (Test-Path (Join-Path $dir 'src/lib/categories.ts'))) {
  $parent = Split-Path -Parent $dir
  if ($parent -eq $dir) { break }
  $dir = $parent
}
if (-not (Test-Path (Join-Path $dir 'src/lib/categories.ts'))) {
  Write-Error 'No se encontró src/lib/categories.ts subiendo desde el script.'
}

$categoriesPath = Join-Path $dir 'src/lib/categories.ts'
$experimentsGlob = Join-Path $dir 'src/content/experiments/*.md'
$categoriesRaw = Get-Content -Raw $categoriesPath

function Get-ArrayValues([string]$Name) {
  $match = [regex]::Match(
    $categoriesRaw,
    "(?s)$Name\s*=\s*\[(.*?)\]\s*as const;"
  )
  if (-not $match.Success) { return @() }
  return [regex]::Matches($match.Groups[1].Value, "['""]([^'""]+)['""]") |
    ForEach-Object { $_.Groups[1].Value }
}

$valid = @(Get-ArrayValues 'EXPERIMENT_CATEGORIES')
$backgrounds = @(Get-ArrayValues 'BACKGROUND_CATEGORIES')

$labels = @{}
$labelsMatch = [regex]::Match(
  $categoriesRaw,
  '(?s)CATEGORY_LABELS\s*:\s*Record<[^>]+>\s*=\s*\{(.*?)\};'
)
if ($labelsMatch.Success) {
  foreach ($m in [regex]::Matches($labelsMatch.Groups[1].Value, "['""]?([\w-]+)['""]?\s*:\s*['""]([^'""]*)['""]")) {
    $labels[$m.Groups[1].Value] = $m.Groups[2].Value
  }
}

Write-Output '== Categorías válidas (src/lib/categories.ts) =='
if ($valid.Count -eq 0) {
  Write-Output '  No se pudo leer EXPERIMENT_CATEGORIES. Revisa src/lib/categories.ts a mano.'
} else {
  foreach ($c in $valid) {
    $label = if ($labels.ContainsKey($c)) { $labels[$c] } else { '(sin etiqueta)' }
    $isBg = if ($backgrounds -contains $c) { ' [fondo]' } else { '' }
    Write-Output ("  - {0,-14} {1}{2}" -f $c, $label, $isBg)
  }
}

Write-Output ''
Write-Output '== Categorías en uso (src/content/experiments/*.md) =='
$rows = Select-String -Path $experimentsGlob -Pattern '^category:\s*(.+)$' |
  ForEach-Object { $_.Matches[0].Groups[1].Value.Trim().Trim('"').Trim("'") } |
  Group-Object |
  Sort-Object Name
foreach ($r in $rows) {
  $unknown = if ($valid -notcontains $r.Name) { '  <-- no está en EXPERIMENT_CATEGORIES' } else { '' }
  Write-Output ('  {0,-16} {1}{2}' -f $r.Name, $r.Count, $unknown)
}

$total = (Get-ChildItem $experimentsGlob).Count
$sum = ($rows | Measure-Object -Property Count -Sum).Sum
Write-Output ''
Write-Output ("  Total .md: $total    Suma por categoría: $sum")
if ($sum -ne $total) {
  Write-Output '  AVISO: la suma no cuadra; hay archivos sin `category:` o con formato inesperado.'
}
