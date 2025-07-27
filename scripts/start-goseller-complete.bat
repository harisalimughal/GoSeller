@echo off
echo ========================================
echo 🚀 Starting Complete Goseller Platform
echo ========================================
echo.

echo 📦 Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

echo 🚀 Starting all Goseller services...
echo.

echo 1. Starting Main Goseller Server (Port 8080)...
start "Goseller Main" cmd /k "cd services\EHB-GOSELLER && node simple-goseller.js"

echo 2. Starting Backend API Server (Port 3001)...
start "Goseller Backend" cmd /k "cd services\EHB-GOSELLER && node backend\simple-backend.js"

echo 3. Starting Admin Panel Server (Port 3002)...
start "Goseller Admin" cmd /k "cd services\EHB-GOSELLER && node admin-server.js"

echo 4. Starting Store & Payment Server (Port 3004)...
start "Goseller Store" cmd /k "cd services\EHB-GOSELLER && set PORT=3004 && node store-server.js"

echo.
echo ✅ All Goseller services are starting!
echo.
echo 🌐 URLs:
echo   Main Goseller: http://localhost:8080
echo   Backend API: http://localhost:3001
echo   Admin Panel: http://localhost:3002
echo   Customer Store: http://localhost:3004
echo.
echo 📱 Opening main Goseller page in browser...
timeout /t 3 >nul
start http://localhost:8080

echo.
echo 🎉 Goseller platform is ready!
echo Press any key to close this window...
pause >nul
