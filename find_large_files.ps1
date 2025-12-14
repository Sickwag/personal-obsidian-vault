# Find the largest files in Git history
Write-Host "Finding large files in Git history..."

# Get all objects in Git history
$objects = git rev-list --all --objects

# For each commit, get file sizes
$largeFiles = @()
foreach ($commit in $(git rev-list --all)) {
    $files = git ls-tree -r --long $commit | Where-Object {$_ -match "^100... (\S+) (\S+) (\S+)	(.+)$"}
    foreach ($line in $files) {
        $matches = $line -split "`t", 2
        $info = $matches[0] -split '\s+'
        if ($info.Length -ge 4) {
            $size = [int]$info[3]
            if ($size -gt 1MB) {  # Only files larger than 1MB
                $fileName = $matches[1]
                $largeFiles += [PSCustomObject]@{
                    Size = $size
                    File = $fileName
                    Commit = $commit
                }
            }
        }
    }
}

# Sort by size and show top results
$largeFiles | Sort-Object Size -Descending | Select-Object -First 20 @{Name="Size(MB)";Expression={[math]::Round($_.Size/1MB, 2)}}, File, Commit | Format-Table -AutoSize