@echo off
echo ========================================
echo 🔍 Goseller Platform Status Check
echo ========================================
echo.

echo 🏪 Checking Main Server (Port 8080)...
curl -s http://localhost:8080/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Main Server: RUNNING
    echo    URL: http://localhost:8080
) else (
    echo ❌ Main Server: NOT RUNNING
)

echo.
echo 🔧 Checking Backend Server (Port 3001)...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend Server: RUNNING
    echo    URL: http://localhost:3001
) else (
    echo ❌ Backend Server: NOT RUNNING
)

echo.
echo ========================================
echo 📊 Summary
echo ========================================

curl -s http://localhost:8080/api/health >nul 2>&1
set main_status=%errorlevel%

curl -s http://localhost:3001/api/health >nul 2>&1
set backend_status=%errorlevel%

if %main_status% equ 0 (
    if %backend_status% equ 0 (
        echo 🎉 ALL SERVERS RUNNING!
        echo.
        echo 🌐 Opening Goseller in browser...
        start http://localhost:8080
    ) else (
        echo ⚠️ Main server running, but backend is down
        echo 💡 Run: start-goseller-complete.bat
    )
) else (
    if %backend_status% equ 0 (
        echo ⚠️ Backend running, but main server is down
        echo 💡 Run: start-goseller-complete.bat
    ) else (
        echo ❌ NO SERVERS RUNNING
        echo 💡 Run: start-goseller-complete.bat
    )
)

echo.
echo 📋 Available URLs:
echo    🏪 Main: http://localhost:8080
echo    🔧 Backend: http://localhost:3001
echo    📊 API Health: http://localhost:3001/api/health
echo    📋 Backend Info: http://localhost:3001/api/goseller/backend
echo.
pause
