#!/usr/bin/env pwsh
# Lista las categorías de experimentos del repo:
#   - el enum declarado en src/content.config.ts (fuente de verdad)
#   - las categorías realmente en uso en src/content/experiments/*.md
#
# Uso (desde la raíz del repo o desde cualquier sitio):
#   pwsh .opencode/skills/change-experiment-category/scripts/categories.ps1

$ErrorActionPreference = 'Stop'

# Localiza la raíz del repo subiendo hasta encontrar src/content.config.ts.
$dir = $PSScriptRoot
while ($dir -and -not (Test-Path (Join-Path $dir 'src/content.config.ts'))) {
  $parent = Split-Path -Parent $dir
  if ($parent -eq $dir) { break }
  $dir = $parent
}
if (-not (Test-Path (Join-Path $dir 'src/content.config.ts'))) {
  Write-Error 'No se encontró src/content.config.ts subiendo desde el script.'
}

$configPath = Join-Path $dir 'src/content.config.ts'
$experimentsGlob = Join-Path $dir 'src/content/experiments/*.md'

Write-Output '== Enum declarado (src/content.config.ts) =='
$configRaw = Get-Content -Raw $configPath
$enumMatch = [regex]::Match($configRaw, "(?s)category:\s*z\.enum\(\[([^\]]*)\]\)")
if (-not $enumMatch.Success) {
  Write-Output '  No se encontró `category: z.enum([...])`. Revisa src/content.config.ts a mano.'
} else {
  ($enumMatch.Groups[1].Value -split ',') |
    ForEach-Object { $_.Trim().Trim('"').Trim("'") } |
    Where-Object { $_ } |
    ForEach-Object { Write-Output "  - $_" }
}

Write-Output ''
Write-Output '== Categorias en uso (src/content/experiments/*.md) =='
$rows = Select-String -Path $experimentsGlob -Pattern '^category:\s*(.+)$' |
  ForEach-Object { $_.Matches[0].Groups[1].Value.Trim().Trim('"').Trim("'") } |
  Group-Object |
  Sort-Object Name
foreach ($r in $rows) { Write-Output ('  {0,-16} {1}' -f $r.Name, $r.Count) }

$total = (Get-ChildItem $experimentsGlob).Count
$sum = ($rows | Measure-Object -Property Count -Sum).Sum
Write-Output ''
Write-Output ("  Total .md: $total    Suma por categoria: $sum")
if ($sum -ne $total) {
  Write-Output '  AVISO: la suma no cuadra; hay archivos sin `category:` o con formato inesperado.'
}
