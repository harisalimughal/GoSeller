# EHB-GOSELLER Setup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EHB-GOSELLER Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Starting Goseller setup..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing admin panel dependencies..." -ForegroundColor Yellow
Set-Location admin-panel
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install admin panel dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Admin panel dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "🔧 Setting up environment..." -ForegroundColor Yellow
npm run setup:env
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup environment" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Environment setup completed" -ForegroundColor Green

Write-Host ""
Write-Host "🛠️ Setting up development tools..." -ForegroundColor Yellow
npm run setup:tools
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup development tools" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Development tools setup completed" -ForegroundColor Green

Write-Host ""
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
npm run setup:db
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database setup completed" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Goseller setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Start development: npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 for frontend" -ForegroundColor White
Write-Host "4. Open http://localhost:3001 for backend API" -ForegroundColor White
Write-Host "5. Open http://localhost:3002 for admin panel" -ForegroundColor White
Write-Host ""
Write-Host "Default credentials:" -ForegroundColor White
Write-Host "- Email: seller@goseller.com" -ForegroundColor White
Write-Host "- Password: password123" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
