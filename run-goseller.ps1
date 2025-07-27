# Goseller Application Runner
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Goseller Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Set-Location ..
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Yellow
Set-Location backend

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the backend server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Goseller is starting up!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "🏪 Goseller URL: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Please wait a moment for the server to start..." -ForegroundColor Yellow
Write-Host ""

# Wait a bit for the server to start
Start-Sleep -Seconds 3

# Open the browser
Write-Host "🌐 Opening Goseller in your browser..." -ForegroundColor Green
Start-Process "http://localhost:3001"

Write-Host ""
Write-Host "✅ Goseller is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
Read-Host
