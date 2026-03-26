Get-ChildItem -Path "node_modules" -Recurse -Include "*.gradle","*.properties" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "1\.5\.10") {
        Write-Host "수정 중: $($_.FullName)"
        $content -replace "1\.5\.10", "1.9.25" | Set-Content $_.FullName
    }
}
