# Complete setup script for WriterSquire MVP
param(
    [string]$DatabaseUrl
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 WriterSquire MVP - Complete Setup`n" -ForegroundColor Cyan

# Step 1: Update DATABASE_URL if provided
if ($DatabaseUrl) {
    Write-Host "📝 Step 1: Updating DATABASE_URL..." -ForegroundColor Yellow
    & "$PSScriptRoot\update-database-url.ps1" -ConnectionString $DatabaseUrl
    Write-Host ""
}

# Step 2: Generate Prisma Client
Write-Host "📦 Step 2: Generating Prisma Client..." -ForegroundColor Yellow
Set-Location $PSScriptRoot\..
try {
    npx prisma generate
    Write-Host "  ✅ Prisma Client generated`n" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

# Step 3: Run migrations
Write-Host "🗄️  Step 3: Running database migrations..." -ForegroundColor Yellow
try {
    npx prisma migrate dev --name init
    Write-Host "  ✅ Migrations completed`n" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Migrations failed" -ForegroundColor Red
    Write-Host "  💡 Check DATABASE_URL is correct in backend/.env" -ForegroundColor Yellow
    exit 1
}

# Step 4: Build
Write-Host "🔨 Step 4: Building backend..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "  ✅ Build successful`n" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Setup complete! MVP is ready.`n" -ForegroundColor Green
Write-Host "🚀 Start servers:" -ForegroundColor Cyan
Write-Host "   Terminal 1: cd backend && npm run dev"
Write-Host "   Terminal 2: cd frontend && npm run dev`n"
Write-Host "📊 Test endpoints:" -ForegroundColor Cyan
Write-Host "   Backend: http://localhost:3001/api/health"
Write-Host "   Frontend: http://localhost:5173`n"

Set-Location $PSScriptRoot
