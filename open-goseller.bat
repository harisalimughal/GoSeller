@echo off
echo 🚀 Opening Goseller in your browser...
echo.
echo 🏪 Goseller URL: http://localhost:8080
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo ⚙️ Admin Panel: http://localhost:3002
echo.

timeout /t 3 /nobreak >nul

start http://localhost:8080

echo ✅ Goseller opened in your browser!
echo.
pause
