Write-Host "Opening EHB GoSeller Platform..." -ForegroundColor Green

# Open all GoSeller URLs
Start-Process "http://localhost:4000"
Start-Sleep -Seconds 2
Start-Process "http://localhost:4001"
Start-Sleep -Seconds 2
Start-Process "http://localhost:5001"

Write-Host "GoSeller Platform opened in browser!" -ForegroundColor Green
