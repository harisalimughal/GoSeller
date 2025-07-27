@echo off
echo ========================================
echo 🔍 Goseller Services Status Check
echo ========================================
echo.

echo Checking if services are running...
echo.

echo 1. Main Goseller Server (Port 8080):
netstat -an | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ✅ Running - http://localhost:8080
) else (
    echo ❌ Not running
)

echo.
echo 2. Backend API Server (Port 3001):
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo ✅ Running - http://localhost:3001
) else (
    echo ❌ Not running
)

echo.
echo 3. Admin Panel Server (Port 3002):
netstat -an | findstr :3002 >nul
if %errorlevel% equ 0 (
    echo ✅ Running - http://localhost:3002
) else (
    echo ❌ Not running
)

echo.
echo 4. Store & Payment Server (Port 3004):
netstat -an | findstr :3004 >nul
if %errorlevel% equ 0 (
    echo ✅ Running - http://localhost:3004
) else (
    echo ❌ Not running
)

echo.
echo ========================================
echo 💡 To start all services, run: start-goseller-complete.bat
echo ========================================
echo.
pause
