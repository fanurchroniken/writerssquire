# PowerShell script to update DATABASE_URL in backend/.env
param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString
)

$envPath = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Updating DATABASE_URL in backend/.env..." -ForegroundColor Yellow

# Read current .env
$content = Get-Content $envPath -Raw

# Check if DATABASE_URL exists
if ($content -match "DATABASE_URL=") {
    # Replace existing DATABASE_URL
    $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=$ConnectionString"
    Write-Host "  ✅ Updated existing DATABASE_URL" -ForegroundColor Green
} else {
    # Append DATABASE_URL
    $content += "`nDATABASE_URL=$ConnectionString"
    Write-Host "  ✅ Added DATABASE_URL" -ForegroundColor Green
}

# Write back to file
Set-Content -Path $envPath -Value $content -NoNewline

Write-Host "`n✅ DATABASE_URL updated successfully!" -ForegroundColor Green
Write-Host "   New value: DATABASE_URL=$ConnectionString" -ForegroundColor Cyan
