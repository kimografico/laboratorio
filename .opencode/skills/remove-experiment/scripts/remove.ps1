#!/usr/bin/env pwsh
# Removes one or more experiments from the showcase.
# Validates every slug first, then edits the registry and deletes the owned files.
# Never touches +/, src/content/ui/, shared CSS, or generated dist/ directories.

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string[]] $Slugs,

    [string] $Root,

    [switch] $DryRun,

    # Allow removal even if the component name is still referenced outside
    # the experiment's own files. Use only after confirming those references
    # are unrelated or are being removed separately.
    [switch] $Force
)

$ErrorActionPreference = 'Stop'

function Find-RepoRoot {
    param([string] $Start)

    $current = (Resolve-Path -LiteralPath $Start).Path
    while ($current) {
        if ((Test-Path -LiteralPath (Join-Path $current 'package.json')) -and
            (Test-Path -LiteralPath (Join-Path $current 'src/lib/registry.tsx'))) {
            return $current
        }
        $parent = Split-Path -Parent $current
        if (-not $parent -or $parent -eq $current) { break }
        $current = $parent
    }
    throw "No se encontró la raíz del repositorio desde '$Start'."
}

function Read-FrontmatterValue {
    param(
        [string] $Raw,
        [string] $Key
    )

    $match = [regex]::Match(
        $Raw,
        "(?m)^$([regex]::Escape($Key)):\s*(.*?)\s*$"
    )
    if (-not $match.Success) { return $null }
    return $match.Groups[1].Value.Trim().Trim('"').Trim("'")
}

function Get-ReferenceFiles {
    param(
        [string] $RepoRoot,
        [string] $Component,
        [string[]] $Excluded
    )

    $src = Join-Path $RepoRoot 'src'
    if (-not (Test-Path -LiteralPath $src)) { return @() }

    $escaped = [regex]::Escape($Component)
    $pattern = "(?m)^\s*import\s+$escaped\s+from\b|<\s*$escaped\b|component:\s*[`"']?$escaped\b"

    $files = Get-ChildItem -LiteralPath $src -Recurse -File |
        Where-Object { $_.Extension -in @('.ts', '.tsx', '.js', '.jsx', '.astro', '.md', '.css') }

    $references = New-Object System.Collections.Generic.List[string]

    foreach ($file in $files) {
        if ($Excluded -contains $file.FullName) { continue }

        $raw = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
        if ([regex]::IsMatch($raw, $pattern)) {
            $references.Add($file.FullName)
        }
    }

    return $references.ToArray()
}

$repoRoot = if ($Root) {
    (Resolve-Path -LiteralPath $Root).Path
} else {
    Find-RepoRoot -Start $PSScriptRoot
}

$registryPath = Join-Path $repoRoot 'src/lib/registry.tsx'
$experimentsDir = Join-Path $repoRoot 'src/content/experiments'
$uiDir = Join-Path $repoRoot 'src/content/ui'

if (-not (Test-Path -LiteralPath $registryPath)) {
    throw "No existe el registro: $registryPath"
}
if (-not (Test-Path -LiteralPath $experimentsDir)) {
    throw "No existe el directorio de experimentos: $experimentsDir"
}

$slugList = @(
    $Slugs |
        ForEach-Object { $_ -split ',' } |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ } |
        Select-Object -Unique
)

if ($slugList.Count -eq 0) {
    throw 'Debes indicar al menos un slug de experimento.'
}

$plans = New-Object System.Collections.Generic.List[object]
$problems = New-Object System.Collections.Generic.List[string]

foreach ($slug in $slugList) {
    $mdPath = Join-Path $experimentsDir "$slug.md"
    $uiPath = Join-Path $uiDir "$slug.md"

    if (-not (Test-Path -LiteralPath $mdPath)) {
        if (Test-Path -LiteralPath $uiPath) {
            $problems.Add("'$slug' es una pieza de interfaz (src/content/ui). Este skill solo elimina experimentos.")
        } else {
            $problems.Add("No existe el experimento '$slug' en src/content/experiments.")
        }
        continue
    }

    $mdRaw = Get-Content -LiteralPath $mdPath -Raw -ErrorAction Stop
    $component = Read-FrontmatterValue -Raw $mdRaw -Key 'component'
    $category = Read-FrontmatterValue -Raw $mdRaw -Key 'category'

    if (-not $component) {
        $problems.Add("'$slug.md' no tiene un valor 'component' en el frontmatter.")
        continue
    }

    $backgroundSource = Join-Path $repoRoot "src/components/backgrounds/$component.tsx"
    $textSource = Join-Path $repoRoot "src/components/texts/$component.tsx"
    $uiSource = Join-Path $repoRoot "src/components/ui/$component.tsx"

    $existingSources = @(
        @($backgroundSource, $textSource) | Where-Object { Test-Path -LiteralPath $_ }
    )

    if ($existingSources.Count -gt 1) {
        $problems.Add("El componente '$component' existe en backgrounds y texts. Resuelve la ambigüedad antes de eliminar '$slug'.")
        continue
    }

    $source = if ($existingSources.Count -eq 1) { $existingSources[0] } else { $null }

    if (-not $source -and (Test-Path -LiteralPath $uiSource)) {
        $problems.Add("'$component' parece una pieza de interfaz (src/components/ui), no un experimento.")
        continue
    }

    $companions = New-Object System.Collections.Generic.List[string]

    if ($source) {
        $sourceDir = Split-Path -Parent $source

        $componentCss = Join-Path $sourceDir "$component.css"
        if (Test-Path -LiteralPath $componentCss) {
            $companions.Add($componentCss)
        }

        # Component-specific CSS modules such as Name.module.css.
        Get-ChildItem -LiteralPath $sourceDir -File -Filter "$component.*.css" -ErrorAction SilentlyContinue |
            ForEach-Object { $companions.Add($_.FullName) }
    }

    $companionList = @($companions | Select-Object -Unique)
    $excluded = @(
        $registryPath
        $mdPath
        $source
        $companionList
    ) | Where-Object { $_ }

    $references = @(Get-ReferenceFiles -RepoRoot $repoRoot -Component $component -Excluded $excluded)

    if ($references.Count -gt 0 -and -not $Force) {
        $relativeRefs = $references |
            ForEach-Object { [IO.Path]::GetRelativePath($repoRoot, $_) } |
            Sort-Object
        $problems.Add("'$component' todavía se referencia fuera de sus archivos propios: $($relativeRefs -join ', '). Revisa esas referencias o usa -Force solo si son ajenas.")
        continue
    }

    $plans.Add([pscustomobject]@{
        Slug        = $slug
        Component   = $component
        Category    = $category
        Markdown    = $mdPath
        Source      = $source
        Companions  = $companionList
        References  = $references
    })
}

if ($problems.Count -gt 0) {
    Write-Host 'No se ha modificado nada.' -ForegroundColor Yellow
    foreach ($problem in $problems) {
        Write-Host "ERROR: $problem" -ForegroundColor Red
    }
    exit 1
}

Write-Host 'Plan de eliminación:' -ForegroundColor Cyan
foreach ($plan in $plans) {
    $categoryText = if ($plan.Category) { " [$($plan.Category)]" } else { '' }
    Write-Host "  $($plan.Slug): $($plan.Component)$categoryText"
    Write-Host "    borrar  $( [IO.Path]::GetRelativePath($repoRoot, $plan.Markdown) )"

    if ($plan.Source) {
        Write-Host "    borrar  $( [IO.Path]::GetRelativePath($repoRoot, $plan.Source) )"
    } else {
        Write-Host '    aviso   no se encontró el .tsx del componente; se limpiará el registro y la página' -ForegroundColor Yellow
    }

    foreach ($companion in $plan.Companions) {
        Write-Host "    borrar  $( [IO.Path]::GetRelativePath($repoRoot, $companion) )"
    }

    Write-Host "    editar  src/lib/registry.tsx (import + entrada de $($plan.Component))"

    if ($plan.References.Count -gt 0) {
        Write-Host '    aviso   referencias externas ignoradas por -Force:' -ForegroundColor Yellow
        foreach ($reference in $plan.References) {
            Write-Host "            $( [IO.Path]::GetRelativePath($repoRoot, $reference) )"
        }
    }
}

if ($DryRun) {
    Write-Host ''
    Write-Host 'DRY RUN: no se ha modificado ningún archivo.' -ForegroundColor Green
    exit 0
}

$registryRaw = Get-Content -LiteralPath $registryPath -Raw -ErrorAction Stop
$registryChanged = $false

foreach ($plan in $plans) {
    $escaped = [regex]::Escape($plan.Component)
    $before = $registryRaw

    $importPattern = "(?m)^[ \t]*import\s+$escaped\s+from\s+[`"'][^`"']+[`"'];?[ \t]*\r?\n?"
    $entryPattern = "(?m)^[ \t]*$escaped[ \t]*,[ \t]*\r?\n?"

    $registryRaw = [regex]::Replace($registryRaw, $importPattern, '')
    $registryRaw = [regex]::Replace($registryRaw, $entryPattern, '')

    if ($registryRaw -ne $before) {
        $registryChanged = $true
        Write-Host "  registro: eliminado $($plan.Component)" -ForegroundColor Green
    } else {
        Write-Host "  registro: $($plan.Component) ya no estaba" -ForegroundColor DarkGray
    }
}

if ($registryChanged) {
    Set-Content -LiteralPath $registryPath -Value $registryRaw -NoNewline -Encoding utf8
}

foreach ($plan in $plans) {
    $files = @($plan.Markdown, $plan.Source) + $plan.Companions
    foreach ($file in $files) {
        if (-not $file) { continue }
        if (-not (Test-Path -LiteralPath $file)) { continue }

        Remove-Item -LiteralPath $file -Force
        Write-Host "  borrado: $( [IO.Path]::GetRelativePath($repoRoot, $file) )" -ForegroundColor Green
    }
}

Write-Host ''
Write-Host "Eliminados $($plans.Count) experimento(s)." -ForegroundColor Green
Write-Host 'Verifica con: npm run check && npm run build && npm run build:lib' -ForegroundColor Cyan
