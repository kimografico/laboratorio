#!/usr/bin/env pwsh
# Verificación de integridad y (opcional) build, para experimentos recién publicados.
# Es idempotente y no modifica el repo (salvo lo que generan los builds).
#
# Uso:
#   pwsh .../verify.ps1                       # solo chequeos estáticos
#   pwsh .../verify.ps1 -Run                  # + npm run check / build / build:lib
#   pwsh .../verify.ps1 -Run -Slugs foo,bar   # + exige dist-site/experiment/<slug>/index.html
#
# Salida: lista de problemas. Exit code 0 si todo OK, 1 si hay algún fallo.

param(
  [string]$Root,
  [switch]$Run,
  [string[]]$Slugs
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

function Get-BarrelExports([string]$barrelPath) {
  $names = New-Object System.Collections.Generic.List[string]
  foreach ($l in (Get-Content -LiteralPath $barrelPath)) {
    foreach ($m in [regex]::Matches($l, 'default as ([A-Za-z0-9_]+)')) { $names.Add($m.Groups[1].Value) }
  }
  return $names
}

function Get-ContentRows([string]$glob) {
  $rows = New-Object System.Collections.Generic.List[object]
  foreach ($f in (Get-ChildItem -Path $glob -ErrorAction SilentlyContinue)) {
    $raw = Get-Content -Raw -LiteralPath $f.FullName
    $cm = [regex]::Match($raw, '(?m)^component:\s*(.+?)\s*$')
    $catm = [regex]::Match($raw, '(?m)^category:\s*(.+?)\s*$')
    $comp = if ($cm.Success) { $cm.Groups[1].Value.Trim().Trim('"').Trim("'") } else { $null }
    $cat = if ($catm.Success) { $catm.Groups[1].Value.Trim().Trim('"').Trim("'") } else { $null }
    $rows.Add([pscustomobject]@{ Slug = $f.BaseName; Component = $comp; Category = $cat; Path = $f.FullName })
  }
  return $rows
}

$repoRoot = if ($Root) { (Resolve-Path -LiteralPath $Root).Path } else { Find-RepoRoot $PSScriptRoot }
$errors = New-Object System.Collections.Generic.List[string]

$registryKeys = Get-RegistryKeys (Join-Path $repoRoot 'src/lib/registry.tsx')
$barrelExports = Get-BarrelExports (Join-Path $repoRoot 'src/lib/index.ts')
$expRows = Get-ContentRows (Join-Path $repoRoot 'src/content/experiments/*.md')
$uiRows = Get-ContentRows (Join-Path $repoRoot 'src/content/ui/*.md')

$dupKeys = @($registryKeys | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
if ($dupKeys) { $errors.Add("registry.tsx: claves duplicadas -> $($dupKeys -join ', ')") }
$dupExports = @($barrelExports | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
if ($dupExports) { $errors.Add("index.ts: exports duplicados -> $($dupExports -join ', ')") }
$dupExp = @($expRows.Slug | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
if ($dupExp) { $errors.Add("experiments: slugs duplicados -> $($dupExp -join ', ')") }
$dupUi = @($uiRows.Slug | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
if ($dupUi) { $errors.Add("ui: slugs duplicados -> $($dupUi -join ', ')") }
$dupCross = @((@($expRows.Slug) + @($uiRows.Slug)) | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name })
if ($dupCross) { $errors.Add("slug repetido en experiments y ui -> $($dupCross -join ', ')") }

foreach ($r in @($expRows + $uiRows)) {
  if (-not $r.Component) { $errors.Add("'$($r.Slug)' no declara 'component:'"); continue }
  if ($registryKeys -notcontains $r.Component) { $errors.Add("'$($r.Slug)' apunta a '$($r.Component)' y no está en registry.tsx") }
}
foreach ($r in $expRows) {
  if ($r.Component -and -not $r.Category) { $errors.Add("experimento '$($r.Slug)' sin 'category:'") }
}
foreach ($r in $uiRows) {
  if ($r.Component -and -not $r.Category) { $errors.Add("ui '$($r.Slug)' sin 'category:'") }
}

if ($Run) {
  Push-Location $repoRoot
  try {
    foreach ($cmd in @('check', 'build', 'build:lib')) {
      Write-Output "== npm run $cmd =="
      $ok = $true
      & npm run $cmd 2>&1 | ForEach-Object { Write-Output $_ }
      if ($LASTEXITCODE -ne 0) { $ok = $false }
      if (-not $ok) { $errors.Add("npm run $cmd falló (exit $LASTEXITCODE)") }
    }
  } finally { Pop-Location }

  if ($Slugs) {
    foreach ($s in $Slugs) {
      $p = Join-Path $repoRoot "dist-site/experiment/$s/index.html"
      if (-not (Test-Path -LiteralPath $p)) { $errors.Add("no se generó dist-site/experiment/$s/index.html") }
    }
  }
}

if ($errors.Count -eq 0) {
  Write-Output 'VERIFY OK'
  exit 0
} else {
  Write-Output 'VERIFY FAIL:'
  foreach ($e in $errors) { Write-Output "  - $e" }
  exit 1
}
