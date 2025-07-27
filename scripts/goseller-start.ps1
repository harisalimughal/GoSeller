Write-Host "Starting Goseller Store Server..." -ForegroundColor Green
Set-Location "services\EHB-GOSELLER"
node store-server.js
