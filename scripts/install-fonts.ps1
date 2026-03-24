#
# Install fonts for glissando themes (Windows).
#
# Auto-downloads (free, OFL):
#   - DM Serif Display  (headings)
#   - Inter              (body)
#   - JetBrains Mono     (code)
#
# Optional premium upgrades (commercial — user provides files):
#   - Tiempos Headline, Styrene A
#
# Usage:
#   .\scripts\install-fonts.ps1                # defaults to claude-doc
#   .\scripts\install-fonts.ps1 claude-doc     # explicit theme
#
# Run as Administrator for system-wide, or as normal user for per-user.
#

param(
    [string]$Theme = "claude-doc"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$FontsDir = Join-Path $ProjectRoot "src" "themes" $Theme "fonts"

if (-not (Test-Path $FontsDir)) {
    Write-Error "Theme font directory not found: $FontsDir"
    exit 1
}

$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($IsAdmin) {
    $InstallDir = "$env:SystemRoot\Fonts"
    $RegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
    Write-Host "Install mode: System-wide (Administrator)"
} else {
    $InstallDir = "$env:LOCALAPPDATA\Microsoft\Windows\Fonts"
    $RegistryPath = "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
    Write-Host "Install mode: Per-user"
}

Write-Host "=== glissando Font Installer (Windows) ==="
Write-Host "Theme:      $Theme"
Write-Host "Fonts dir:  $FontsDir"
Write-Host "Install to: $InstallDir"
Write-Host ""

function Install-FontFile {
    param ([string]$FontPath)
    $FontName = [System.IO.Path]::GetFileName($FontPath)
    $Dest = Join-Path $InstallDir $FontName
    Copy-Item -Path $FontPath -Destination $Dest -Force
    $NameNoExt = [System.IO.Path]::GetFileNameWithoutExtension($FontPath)
    $Ext = [System.IO.Path]::GetExtension($FontPath).ToLower()
    $FontType = if ($Ext -eq ".otf") { "OpenType" } else { "TrueType" }
    $RegValue = if ($IsAdmin) { $FontName } else { $Dest }
    New-ItemProperty -Path $RegistryPath -Name "$NameNoExt ($FontType)" -Value $RegValue -PropertyType String -Force | Out-Null
}

function Install-GoogleFont {
    param (
        [string]$DisplayName,
        [string]$Slug,
        [string]$CheckPattern
    )
    $Existing = Get-ChildItem -Path $InstallDir -Filter "${CheckPattern}*" -ErrorAction SilentlyContinue
    if ($Existing) {
        Write-Host "[OK] $DisplayName - already installed"
        return
    }
    Write-Host "[DL] Downloading $DisplayName..."
    $ZipFile = Join-Path $FontsDir "${CheckPattern}.zip"
    $TmpDir = Join-Path $FontsDir "${CheckPattern}_tmp"
    Invoke-WebRequest -Uri "https://fonts.google.com/download?family=$Slug" -OutFile $ZipFile -UseBasicParsing
    Expand-Archive -Path $ZipFile -DestinationPath $TmpDir -Force
    $ttfFiles = Get-ChildItem -Path $TmpDir -Filter "*.ttf" -Recurse
    foreach ($f in $ttfFiles) {
        Install-FontFile $f.FullName
    }
    if ($ttfFiles.Count -gt 0) {
        Write-Host "[OK] $DisplayName - installed"
    } else {
        Write-Host "[!!] $DisplayName - no TTF files found"
    }
    Remove-Item -Recurse -Force $TmpDir, $ZipFile -ErrorAction SilentlyContinue
}

# --- 1. DM Serif Display ---
Install-GoogleFont "DM Serif Display" "DM+Serif+Display" "DMSerifDisplay"

# --- 2. Inter ---
Install-GoogleFont "Inter" "Inter" "Inter"

# --- 3. JetBrains Mono ---
$JBMonoVersion = "2.304"
$JBMonoUrl = "https://github.com/JetBrains/JetBrainsMono/releases/download/v$JBMonoVersion/JetBrainsMono-$JBMonoVersion.zip"
$Existing = Get-ChildItem -Path $InstallDir -Filter "JetBrainsMono*" -ErrorAction SilentlyContinue
if ($Existing) {
    Write-Host "[OK] JetBrains Mono - already installed"
} else {
    Write-Host "[DL] Downloading JetBrains Mono v$JBMonoVersion..."
    $ZipFile = Join-Path $FontsDir "JetBrainsMono.zip"
    $TmpDir = Join-Path $FontsDir "jbmono_tmp"
    Invoke-WebRequest -Uri $JBMonoUrl -OutFile $ZipFile -UseBasicParsing
    Expand-Archive -Path $ZipFile -DestinationPath $TmpDir -Force
    $StaticDir = Join-Path $TmpDir "fonts\ttf"
    if (Test-Path $StaticDir) {
        Get-ChildItem -Path $StaticDir -Filter "JetBrainsMono-*.ttf" | ForEach-Object {
            Install-FontFile $_.FullName
        }
        Write-Host "[OK] JetBrains Mono - installed"
    } else {
        Write-Host "[!!] JetBrains Mono - could not find TTF files"
    }
    Remove-Item -Recurse -Force $TmpDir, $ZipFile -ErrorAction SilentlyContinue
}

Write-Host ""

# --- 4. Optional: Tiempos Headline ---
$TiemposFound = $false
Get-ChildItem -Path $FontsDir -Include "TiemposHeadline*", "Tiempos_Headline*" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match "\.(otf|ttf)$" } |
    ForEach-Object { Install-FontFile $_.FullName; $TiemposFound = $true }
if ($TiemposFound) {
    Write-Host "[OK] Tiempos Headline - installed (premium upgrade)"
} else {
    Write-Host "[..] Tiempos Headline - not provided (using DM Serif Display)"
}

# --- 5. Optional: Styrene A ---
$StyreneFound = $false
Get-ChildItem -Path $FontsDir -Include "StyreneA*", "Styrene_A*" -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match "\.(otf|ttf)$" } |
    ForEach-Object { Install-FontFile $_.FullName; $StyreneFound = $true }
if ($StyreneFound) {
    Write-Host "[OK] Styrene A - installed (premium upgrade)"
} else {
    Write-Host "[..] Styrene A - not provided (using Inter)"
}

Write-Host ""
Write-Host "=== Done ==="
