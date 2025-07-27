Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Complete Goseller Platform" -ForegroundColor Cyan
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
Write-Host "🚀 Starting all Goseller services..." -ForegroundColor Yellow
Write-Host ""

# Start Main Goseller Server (Port 8080)
Write-Host "1. Starting Main Goseller Server (Port 8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'services\EHB-GOSELLER'; node simple-goseller.js" -WindowStyle Normal

# Start Backend API Server (Port 3001)
Write-Host "2. Starting Backend API Server (Port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'services\EHB-GOSELLER'; node backend\simple-backend.js" -WindowStyle Normal

# Start Admin Panel Server (Port 3002)
Write-Host "3. Starting Admin Panel Server (Port 3002)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'services\EHB-GOSELLER'; node admin-server.js" -WindowStyle Normal

# Start Store & Payment Server (Port 3004)
Write-Host "4. Starting Store & Payment Server (Port 3004)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'services\EHB-GOSELLER'; `$env:PORT=3004; node store-server.js" -WindowStyle Normal

Write-Host ""
Write-Host "✅ All Goseller services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  Main Goseller: http://localhost:8080" -ForegroundColor White
Write-Host "  Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "  Admin Panel: http://localhost:3002" -ForegroundColor White
Write-Host "  Customer Store: http://localhost:3004" -ForegroundColor White
Write-Host ""

# Wait a moment for servers to start
Write-Host "📱 Opening main Goseller page in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:8080"

Write-Host ""
Write-Host "🎉 Goseller platform is ready!" -ForegroundColor Green
Write-Host "Press Enter to continue..." -ForegroundColor Yellow
Read-Host
