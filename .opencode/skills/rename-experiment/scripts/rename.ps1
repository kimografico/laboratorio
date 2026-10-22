#!/usr/bin/env pwsh
# Renames an experiment's slug, React component, or both, and updates the
# registry, its markdown page and references inside the project.
# Never touches +/, dist/, dist-site/ or src/content/ui/.

param(
    [string] $Slug,
    [string] $Component,
    [string] $NewSlug,
    [string] $NewComponent,
    [string] $Root,
    [switch] $DryRun
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

function Get-TextFiles {
    param(
        [string] $RepoRoot
    )

    $roots = @(
        (Join-Path $RepoRoot 'src')
        (Join-Path $RepoRoot 'README.md')
        (Join-Path $RepoRoot 'AGENTS.md')
    )

    $extensions = @('.ts', '.tsx', '.js', '.jsx', '.astro', '.md', '.css', '.json')
    $excludedUi = Join-Path $RepoRoot 'src/content/ui'
    $files = New-Object System.Collections.Generic.List[object]

    foreach ($root in $roots) {
        if (-not (Test-Path -LiteralPath $root)) { continue }

        $item = Get-Item -LiteralPath $root
        if ($item.PSIsContainer) {
            Get-ChildItem -LiteralPath $root -Recurse -File |
                Where-Object {
                    $extensions -contains $_.Extension -and
                    $_.FullName -notlike "$excludedUi*"
                } |
                ForEach-Object { $files.Add($_) }
        } elseif ($extensions -contains $item.Extension) {
            $files.Add($item)
        }
    }

    return $files.ToArray()
}

function Get-UpdatedContent {
    param(
        [string] $Content,
        [string] $OldComponent,
        [string] $NewComponent,
        [string] $OldSlug,
        [string] $NewSlug
    )

    $updated = $Content

    if ($NewComponent) {
        $escaped = [regex]::Escape($OldComponent)

        # Rename public helper types that carry the component name first.
        foreach ($suffix in @('Props', 'Ref', 'Handle', 'Context')) {
            $typePattern = "\b$escaped$suffix\b"
            $updated = [regex]::Replace($updated, $typePattern, "$NewComponent$suffix")
        }

        $componentPattern = "\b$escaped\b"
        $updated = [regex]::Replace($updated, $componentPattern, $NewComponent)
    }

    if ($NewSlug) {
        $escapedSlug = [regex]::Escape($OldSlug)
        $slugPattern = "/experiment/$escapedSlug(?![a-z0-9-])"
        $updated = [regex]::Replace($updated, $slugPattern, "/experiment/$NewSlug")
    }

    return $updated
}

if (-not $Slug -and -not $Component) {
    throw 'Indica el experimento con -Slug o -Component.'
}
if (-not $NewSlug -and -not $NewComponent) {
    throw 'Indica al menos un nombre nuevo con -NewSlug o -NewComponent.'
}

$Slug = if ($Slug) { $Slug.Trim() } else { $null }
$Component = if ($Component) { $Component.Trim() } else { $null }
$NewSlug = if ($NewSlug) { $NewSlug.Trim() } else { $null }
$NewComponent = if ($NewComponent) { $NewComponent.Trim() } else { $null }

$repoRoot = if ($Root) {
    (Resolve-Path -LiteralPath $Root).Path
} else {
    Find-RepoRoot -Start $PSScriptRoot
}

$experimentsDir = Join-Path $repoRoot 'src/content/experiments'
$uiDir = Join-Path $repoRoot 'src/content/ui'
$backgroundsDir = Join-Path $repoRoot 'src/components/backgrounds'
$textsDir = Join-Path $repoRoot 'src/components/texts'
$uiComponentsDir = Join-Path $repoRoot 'src/components/ui'
$registryPath = Join-Path $repoRoot 'src/lib/registry.tsx'

if (-not (Test-Path -LiteralPath $experimentsDir)) {
    throw "No existe el directorio de experimentos: $experimentsDir"
}
if (-not (Test-Path -LiteralPath $registryPath)) {
    throw "No existe el registro: $registryPath"
}

$oldSlug = $Slug
$oldComponent = $Component
$mdPath = $null

if ($Slug) {
    $candidateMd = Join-Path $experimentsDir "$Slug.md"
    if (-not (Test-Path -LiteralPath $candidateMd)) {
        if (Test-Path -LiteralPath (Join-Path $uiDir "$Slug.md")) {
            throw "'$Slug' es una pieza de interfaz; este skill solo renombra experimentos."
        }
        throw "No existe el experimento '$Slug' en src/content/experiments."
    }

    $mdPath = $candidateMd
    $mdRaw = Get-Content -LiteralPath $mdPath -Raw -ErrorAction Stop
    $componentFromMd = Read-FrontmatterValue -Raw $mdRaw -Key 'component'

    if (-not $componentFromMd) {
        throw "'$Slug.md' no tiene un valor 'component' en el frontmatter."
    }
    if ($Component -and $Component -ne $componentFromMd) {
        throw "El componente de '$Slug' es '$componentFromMd', no '$Component'."
    }

    $oldComponent = $componentFromMd
} else {
    $componentMatches = @()
    foreach ($file in Get-ChildItem -LiteralPath $experimentsDir -Filter '*.md' -File) {
        $raw = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
        $value = Read-FrontmatterValue -Raw $raw -Key 'component'
        if ($value -eq $Component) {
            $componentMatches += $file
        }
    }

    if ($componentMatches.Count -eq 0) {
        throw "No hay ningún experimento con component '$Component'."
    }
    if ($componentMatches.Count -gt 1) {
        $slugs = $componentMatches | ForEach-Object { $_.BaseName }
        throw "El componente '$Component' aparece en varios experimentos: $($slugs -join ', '). Usa -Slug."
    }

    $mdPath = $componentMatches[0].FullName
    $oldSlug = $componentMatches[0].BaseName
    $oldComponent = $Component
}

$componentChanged = $false
if ($NewComponent -and $NewComponent -eq $oldComponent -and $NewComponent -cne $oldComponent) {
    throw "El renombrado '$oldComponent' -> '$NewComponent' solo cambia mayúsculas/minúsculas; no está soportado en Windows. Usa un nombre distinto."
}
if ($NewComponent -and $NewComponent -ne $oldComponent) {
    if ($NewComponent -notmatch '^[A-Z][A-Za-z0-9]*$') {
        throw "El nombre de componente '$NewComponent' debe ser PascalCase alfanumérico (por ejemplo, AuroraBackground)."
    }
    $componentChanged = $true
}

$slugChanged = $false
if ($NewSlug -and $NewSlug -ne $oldSlug) {
    if ($NewSlug -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
        throw "El slug '$NewSlug' debe ser kebab-case en minúsculas (por ejemplo, doble-rendija)."
    }
    $slugChanged = $true
}

if (-not $componentChanged -and -not $slugChanged) {
    throw 'Los nombres nuevos coinciden con los actuales; no hay nada que renombrar.'
}

$oldSourceCandidates = @(
    @(
        (Join-Path $backgroundsDir "$oldComponent.tsx")
        (Join-Path $textsDir "$oldComponent.tsx")
    ) | Where-Object { Test-Path -LiteralPath $_ }
)

if ($oldSourceCandidates.Count -eq 0) {
    if (Test-Path -LiteralPath (Join-Path $uiComponentsDir "$oldComponent.tsx")) {
        throw "'$oldComponent' es una pieza de interfaz; este skill solo renombra experimentos."
    }
    throw "No se encontró el componente '$oldComponent' en backgrounds/ ni texts/."
}
if ($oldSourceCandidates.Count -gt 1) {
    throw "El componente '$oldComponent' existe en backgrounds/ y texts/. Resuelve la ambigüedad antes de renombrar."
}

$oldSource = $oldSourceCandidates[0]
$sourceDir = Split-Path -Parent $oldSource
$otherSourceDir = if ($sourceDir -eq $backgroundsDir) { $textsDir } else { $backgroundsDir }
$newSource = if ($componentChanged) { Join-Path $sourceDir "$NewComponent.tsx" } else { $oldSource }

if ($componentChanged -and (Test-Path -LiteralPath $newSource)) {
    throw "Ya existe el componente '$NewComponent' en $(Split-Path -Leaf $sourceDir)."
}
if ($componentChanged -and (Test-Path -LiteralPath (Join-Path $otherSourceDir "$NewComponent.tsx"))) {
    throw "Ya existe un componente '$NewComponent' en $(Split-Path -Leaf $otherSourceDir)."
}
if ($componentChanged -and (Test-Path -LiteralPath (Join-Path $uiComponentsDir "$NewComponent.tsx"))) {
    throw "Ya existe una pieza de interfaz llamada '$NewComponent'."
}

$registryRaw = Get-Content -LiteralPath $registryPath -Raw -ErrorAction Stop
if ($componentChanged) {
    $escapedNew = [regex]::Escape($NewComponent)
    $registryCollision = "(?m)^[ \t]*import\s+$escapedNew\s+from\b|^[ \t]*$escapedNew[ \t]*,"
    if ([regex]::IsMatch($registryRaw, $registryCollision)) {
        throw "El registro ya contiene una entrada para '$NewComponent'."
    }
}

$newMdPath = if ($slugChanged) { Join-Path $experimentsDir "$NewSlug.md" } else { $mdPath }
if ($slugChanged -and (Test-Path -LiteralPath $newMdPath)) {
    throw "Ya existe una página de experimento con el slug '$NewSlug'."
}
if ($slugChanged -and (Test-Path -LiteralPath (Join-Path $uiDir "$NewSlug.md"))) {
    throw "Ya existe una pieza de interfaz con el slug '$NewSlug'."
}

$oldCssFiles = @(
    Get-ChildItem -LiteralPath $sourceDir -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -eq "$oldComponent.css" -or
            $_.Name -like "$oldComponent.*.css"
        }
)

$cssRenames = @()
if ($componentChanged) {
    foreach ($cssFile in $oldCssFiles) {
        $newCssName = $cssFile.Name -replace "^$([regex]::Escape($oldComponent))", $NewComponent
        $newCssPath = Join-Path $sourceDir $newCssName
        if (Test-Path -LiteralPath $newCssPath) {
            throw "Ya existe el CSS '$newCssName'."
        }
        $cssRenames += [pscustomobject]@{
            Old = $cssFile.FullName
            New = $newCssPath
        }
    }
}

$renames = New-Object System.Collections.Generic.List[object]
if ($slugChanged) {
    $renames.Add([pscustomobject]@{ Old = $mdPath; New = $newMdPath })
}
if ($componentChanged) {
    $renames.Add([pscustomobject]@{ Old = $oldSource; New = $newSource })
    foreach ($cssRename in $cssRenames) {
        $renames.Add($cssRename)
    }
}

$oldEscaped = [regex]::Escape($oldComponent)
$oldSlugEscaped = [regex]::Escape($oldSlug)
$checkComponentPattern = "\b$oldEscaped\b"
$checkSlugPattern = "/experiment/$oldSlugEscaped(?![a-z0-9-])"

# The UI collection is intentionally out of scope. If it references this
# experiment, stop before making a partial rename.
if (Test-Path -LiteralPath $uiDir) {
    $uiReferences = @()
    foreach ($uiFile in Get-ChildItem -LiteralPath $uiDir -Recurse -File) {
        $uiRaw = Get-Content -LiteralPath $uiFile.FullName -Raw -ErrorAction Stop
        $matchesComponent = $componentChanged -and [regex]::IsMatch($uiRaw, $checkComponentPattern)
        $matchesSlug = $slugChanged -and [regex]::IsMatch($uiRaw, $checkSlugPattern)
        if ($matchesComponent -or $matchesSlug) {
            $uiReferences += $uiFile.FullName
        }
    }
    if ($uiReferences.Count -gt 0) {
        $paths = $uiReferences | ForEach-Object { [IO.Path]::GetRelativePath($repoRoot, $_) }
        throw "El experimento se referencia desde src/content/ui, que este skill no modifica: $($paths -join ', '). Resuélvelo manualmente."
    }
}

if ($DryRun) {
    Write-Host 'Plan de renombrado:' -ForegroundColor Cyan
    Write-Host "  experimento: $oldSlug ($oldComponent)"
    if ($slugChanged) { Write-Host "  slug:        $oldSlug -> $NewSlug" }
    if ($componentChanged) { Write-Host "  componente:  $oldComponent -> $NewComponent" }

    foreach ($rename in $renames) {
        Write-Host "  renombrar  $( [IO.Path]::GetRelativePath($repoRoot, $rename.Old) ) -> $( [IO.Path]::GetRelativePath($repoRoot, $rename.New) )"
    }

    $plannedFiles = @(Get-TextFiles -RepoRoot $repoRoot)
    $plannedEdits = 0

    foreach ($file in $plannedFiles) {
        $raw = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
        $updated = Get-UpdatedContent -Content $raw -OldComponent $oldComponent -NewComponent $(if ($componentChanged) { $NewComponent } else { $null }) -OldSlug $oldSlug -NewSlug $(if ($slugChanged) { $NewSlug } else { $null })
        if ($updated -ne $raw) {
            $plannedEdits++
            Write-Host "  editar     $( [IO.Path]::GetRelativePath($repoRoot, $file.FullName) )"
        }
    }

    Write-Host ''
    Write-Host "DRY RUN: $($renames.Count) renombrado(s), $plannedEdits archivo(s) a actualizar. No se ha modificado nada." -ForegroundColor Green
    exit 0
}

# 1. Rename the owned files first, so later reference updates apply to the new
# paths and no stale old paths remain.
foreach ($rename in $renames) {
    Rename-Item -LiteralPath $rename.Old -NewName (Split-Path -Leaf $rename.New)
    Write-Host "  renombrado: $( [IO.Path]::GetRelativePath($repoRoot, $rename.Old) ) -> $( [IO.Path]::GetRelativePath($repoRoot, $rename.New) )" -ForegroundColor Green
}

# 2. Update the component name, helper types and slug links across the project
# source and the two top-level documents.
$edited = 0
foreach ($file in Get-TextFiles -RepoRoot $repoRoot) {
    $raw = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
    $updated = Get-UpdatedContent -Content $raw -OldComponent $oldComponent -NewComponent $(if ($componentChanged) { $NewComponent } else { $null }) -OldSlug $oldSlug -NewSlug $(if ($slugChanged) { $NewSlug } else { $null })

    if ($updated -ne $raw) {
        Set-Content -LiteralPath $file.FullName -Value $updated -NoNewline -Encoding utf8
        $edited++
        Write-Host "  actualizado: $( [IO.Path]::GetRelativePath($repoRoot, $file.FullName) )" -ForegroundColor Green
    }
}

# 3. Fail loudly if an owned code reference survived; do not leave a broken rename.
$remaining = @(
    Get-ChildItem -LiteralPath (Join-Path $repoRoot 'src') -Recurse -File |
        Where-Object { $_.Extension -in @('.ts', '.tsx', '.js', '.jsx', '.astro', '.md', '.css') } |
        Select-String -Pattern $checkComponentPattern -List
)
if ($componentChanged -and $remaining.Count -gt 0) {
    $paths = $remaining | ForEach-Object { [IO.Path]::GetRelativePath($repoRoot, $_.Path) }
    throw "El renombrado dejó referencias a '$oldComponent': $($paths -join ', '). Revisa esos archivos."
}

$remainingSlug = @(
    Get-ChildItem -LiteralPath (Join-Path $repoRoot 'src') -Recurse -File |
        Where-Object { $_.Extension -in @('.ts', '.tsx', '.js', '.jsx', '.astro', '.md', '.css') } |
        Select-String -Pattern $checkSlugPattern -List
)
if ($slugChanged -and $remainingSlug.Count -gt 0) {
    $paths = $remainingSlug | ForEach-Object { [IO.Path]::GetRelativePath($repoRoot, $_.Path) }
    throw "El renombrado dejó enlaces a '/experiment/$oldSlug': $($paths -join ', '). Revisa esos archivos."
}

Write-Host ''
$finalSlug = if ($slugChanged) { $NewSlug } else { $oldSlug }
$finalComponent = if ($componentChanged) { $NewComponent } else { $oldComponent }
Write-Host "Renombrado completado: $oldSlug -> $finalSlug, $oldComponent -> $finalComponent." -ForegroundColor Green
Write-Host "Archivos actualizados: $edited" -ForegroundColor Green
Write-Host 'Verifica con: npm run check && npm run build && npm run build:lib' -ForegroundColor Cyan
