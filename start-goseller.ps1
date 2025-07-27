# Simple EHB GoSeller Starter
Write-Host "🚀 Starting EHB GoSeller Platform..." -ForegroundColor Green

# Start backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 2

# Start frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "✅ EHB GoSeller is starting!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor White

# Open browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "Press any key to exit..." -ForegroundColor Gray
Read-Host
