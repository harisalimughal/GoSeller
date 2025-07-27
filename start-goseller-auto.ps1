Write-Host "🚀 Starting EHB GoSeller Platform..." -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "📦 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Backend
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Admin Panel
Write-Host "🎨 Starting Admin Panel..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-panel; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🌐 Opening GoSeller Platform in browser..." -ForegroundColor Green

# Open Frontend
Start-Process "http://localhost:4000"
Start-Sleep -Seconds 2

# Open Admin Panel
Start-Process "http://localhost:4001"
Start-Sleep -Seconds 2

# Open Backend API
Start-Process "http://localhost:5001"

Write-Host ""
Write-Host "✅ EHB GoSeller Platform is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:4000" -ForegroundColor White
Write-Host "🔧 Admin Panel: http://localhost:4001" -ForegroundColor White
Write-Host "⚙️ Backend API: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
Read-Host
