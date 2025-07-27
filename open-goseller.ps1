Write-Host "🚀 Opening Goseller in your browser..." -ForegroundColor Green
Write-Host ""
Write-Host "🏪 Goseller URL: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "⚙️ Admin Panel: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 3

Start-Process "http://localhost:8080"

Write-Host "✅ Goseller opened in your browser!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"
