$ErrorActionPreference = "Stop"

$aabPath = "d:\Layang\mahirku development\mahirku\mobile\android\app\build\outputs\bundle\release\app-release.aab"
$extractPath = "d:\Layang\mahirku development\mahirku\mobile\temp_aab"

Write-Host "Extracting AAB..."
if (Test-Path $extractPath) { Remove-Item -Path $extractPath -Recurse -Force }
# Using .NET ZipFile to avoid Expand-Archive issues with deep paths
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($aabPath, $extractPath)

$readelf = "C:\Users\user\AppData\Local\Android\Sdk\ndk\27.1.12297006\toolchains\llvm\prebuilt\windows-x86_64\bin\llvm-readelf.exe"

if (-not (Test-Path $readelf)) {
    Write-Host "readelf not found at $readelf"
    exit
}

$soFiles = Get-ChildItem -Path $extractPath -Filter "*.so" -Recurse
$unaligned = @()
$total = $soFiles.Count
$checked = 0

Write-Host "Checking $total .so files for 16KB alignment..."

foreach ($file in $soFiles) {
    if ($file.FullName -match "armeabi-v7a" -or $file.FullName -match "x86\\") {
        # 16KB alignment is primarily for arm64-v8a and x86_64, but we can check all
        # Actually, let's just check them anyway, but maybe note if they fail.
        # But wait, 32-bit libs might be 4KB aligned. Let's still check but output warnings.
    }
    
    $output = & $readelf -l -W $file.FullName 2>&1
    
    $isAligned = $true
    foreach ($line in $output) {
        if ($line -match "^\s*LOAD\s+") {
            # Example:  LOAD           0x000000 0x00000000 0x00000000 0x0283f0 0x0283f0 R E 0x4000
            $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
            if ($parts.Count -ge 7) {
                # The last column is Align, or sometimes second to last if Flg is split.
                $alignStr = $parts[-1]
                if ($alignStr -match "^0x([0-9a-fA-F]+)$") {
                    $alignHex = $matches[1]
                    $align = [Convert]::ToInt64($alignHex, 16)
                    if ($align -lt 16384) {
                        $isAligned = $false
                        break
                    }
                }
            }
        }
    }
    
    if (-not $isAligned) {
        $unaligned += $file
        Write-Host "FAIL ($($alignHex)): $($file.FullName.Substring($extractPath.Length))"
    }
    $checked++
}

Write-Host "`n--- SUMMARY ---"
Write-Host "Total checked: $checked"
Write-Host "Unaligned: $($unaligned.Count)"

# Cleanup
Remove-Item -Path $extractPath -Recurse -Force
