@echo off
echo ========================================
echo 🚀 Starting Goseller Application
echo ========================================
echo.

echo 📦 Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
cd ..

echo ✅ Frontend built successfully
echo.

echo 🚀 Starting backend server...
cd backend
start "Goseller Backend" cmd /k "npm run dev"

echo.
echo ========================================
echo 🎉 Goseller is starting up!
echo ========================================
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo 🏪 Goseller URL: http://localhost:3001
echo.
echo ⏳ Please wait a moment for the server to start...
echo.
echo Press any key to open Goseller in your browser...
pause >nul

start http://localhost:3001

echo.
echo ✅ Goseller is now running!
echo.
pause
