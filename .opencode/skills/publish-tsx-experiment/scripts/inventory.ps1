#!/usr/bin/env pwsh
# Inventario (SOLO LECTURA) para publicar componentes .tsx de +/ como experimentos.
# No modifica nada: sirve para que el agente detecte duplicados/conflictos ANTES de tocar el repo.
#
# Uso:
#   pwsh .opencode/skills/publish-tsx-experiment/scripts/inventory.ps1
#   pwsh .../inventory.ps1 -Root C:\ruta\repo -SourceDir +

param(
  [string]$Root,
  [string]$SourceDir = '+'
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

function Get-RegistryKeys([string]$registryPath) {
  $keys = New-Object System.Collections.Generic.List[string]
  $inObj = $false
  foreach ($l in (Get-Content -LiteralPath $registryPath)) {
    if (-not $inObj -and $l -match '=\s*\{\s*$') { $inObj = $true; continue }
    if ($inObj -and $l -match '^\s*\}\s*;') { break }
    if ($inObj -and $l -match '^\s*([A-Za-z0-9_]+)\s*,\s*$') { $keys.Add($Matches[1]) }
  }
  return $keys
}

function Get-ComponentValues([string]$glob) {
  $rows = New-Object System.Collections.Generic.List[object]
  foreach ($f in (Get-ChildItem -Path $glob -ErrorAction SilentlyContinue)) {
    $m = [regex]::Match((Get-Content -Raw -LiteralPath $f.FullName), '(?m)^component:\s*(.+?)\s*$')
    $val = if ($m.Success) { $m.Groups[1].Value.Trim().Trim('"').Trim("'") } else { '<falta>' }
    $rows.Add([pscustomobject]@{ Slug = $f.BaseName; Component = $val })
  }
  return $rows
}

function Duplicates($items) {
  return @($items | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
}

$repoRoot = if ($Root) { (Resolve-Path -LiteralPath $Root).Path } else { Find-RepoRoot $PSScriptRoot }

$registryPath = Join-Path $repoRoot 'src/lib/registry.tsx'
$expGlob = Join-Path $repoRoot 'src/content/experiments/*.md'
$uiGlob = Join-Path $repoRoot 'src/content/ui/*.md'
$srcRoot = Join-Path $repoRoot $SourceDir

Write-Output "== Raíz del repo =="
Write-Output "  $repoRoot"

Write-Output ''
Write-Output "== Archivos en $SourceDir/ =="
if (-not (Test-Path -LiteralPath $srcRoot)) {
  Write-Output "  (no existe $SourceDir/)"
} else {
  $all = Get-ChildItem -LiteralPath $srcRoot -Recurse -File
  Write-Output ("  Total: {0}" -f $all.Count)
  Write-Output '  -- .tsx (candidatos) --'
  $tsx = $all | Where-Object { $_.Extension -eq '.tsx' }
  foreach ($f in ($tsx | Sort-Object FullName)) {
    Write-Output ('  {0}' -f ($f.FullName.Substring($srcRoot.Length).TrimStart('\', '/')))
  }
  $other = $all | Where-Object { $_.Extension -ne '.tsx' } | Group-Object Extension | Sort-Object Name
  if ($other) {
    Write-Output '  -- otros --'
    foreach ($g in $other) { Write-Output ('  {0,-12} {1}' -f $g.Name, $g.Count) }
  }
}

$registryKeys = Get-RegistryKeys $registryPath
$expRows = Get-ComponentValues $expGlob
$uiRows = Get-ComponentValues $uiGlob

Write-Output ''
Write-Output '== Estado actual =='
Write-Output ("  registry.tsx keys : {0}" -f $registryKeys.Count)
Write-Output ("  experiments .md   : {0}" -f $expRows.Count)
Write-Output ("  ui .md            : {0}" -f $uiRows.Count)

$problems = @()
$dupKeys = Duplicates $registryKeys
$dupExpSlugs = Duplicates ($expRows | ForEach-Object { $_.Slug })
$dupUiSlugs = Duplicates ($uiRows | ForEach-Object { $_.Slug })
$allSlugs = @($expRows.Slug) + @($uiRows.Slug)
$dupAllSlugs = Duplicates $allSlugs
$missingExp = @($expRows | Where-Object { $_.Component -ne '<falta>' -and $registryKeys -notcontains $_.Component })
$missingUi = @($uiRows | Where-Object { $_.Component -ne '<falta>' -and $registryKeys -notcontains $_.Component })

if ($dupKeys) { $problems += "registry.tsx: claves duplicadas -> $($dupKeys -join ', ')" }
if ($dupExpSlugs) { $problems += "experiments: slugs duplicados -> $($dupExpSlugs -join ', ')" }
if ($dupUiSlugs) { $problems += "ui: slugs duplicados -> $($dupUiSlugs -join ', ')" }
if ($dupAllSlugs) { $problems += "slug en experiments y ui a la vez -> $($dupAllSlugs -join ', ')" }
foreach ($r in $missingExp) { $problems += "experiment '$($r.Slug)' apunta a '$($r.Component)' y no está en registry" }
foreach ($r in $missingUi) { $problems += "ui '$($r.Slug)' apunta a '$($r.Component)' y no está en registry" }

Write-Output ''
Write-Output '== Chequeos de integridad =='
if ($problems.Count -eq 0) {
  Write-Output '  OK: sin colisiones ni referencias rotas.'
} else {
  foreach ($p in $problems) { Write-Output "  AVISO: $p" }
}

Write-Output ''
Write-Output '== Colisiones potenciales (candidatos +/ vs repo) =='
$candidates = @()
if (Test-Path -LiteralPath $srcRoot) {
  $candidates = Get-ChildItem -LiteralPath $srcRoot -Recurse -File -Filter *.tsx |
    ForEach-Object { $_.BaseName } | Sort-Object -Unique
}
if ($candidates.Count -eq 0) {
  Write-Output '  (sin candidatos .tsx)'
} else {
  foreach ($c in $candidates) {
    $hits = @()
    if ($registryKeys -contains $c) { $hits += 'registry' }
    if (@($expRows.Component) -contains $c) { $hits += 'experiments.md' }
    if (@($uiRows.Component) -contains $c) { $hits += 'ui.md' }
    if ($hits.Count -gt 0) { Write-Output ('  {0,-32} -> ya existe en: {1}' -f $c, ($hits -join ', ')) }
  }
  Write-Output ('  ({0} candidatos; solo se listan los que colisionan)' -f $candidates.Count)
}
