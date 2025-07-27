@echo off
echo Starting EHB GoSeller Platform...
echo.

REM Start the services
start "GoSeller Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

start "GoSeller Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

start "GoSeller Admin" cmd /k "cd admin-panel && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo Opening GoSeller Platform in browser...
start http://localhost:4000
timeout /t 2 /nobreak >nul

start http://localhost:4001
timeout /t 2 /nobreak >nul

start http://localhost:5001

echo.
echo EHB GoSeller Platform is now running!
echo.
echo Frontend: http://localhost:4000
echo Admin Panel: http://localhost:4001
echo Backend API: http://localhost:5001
echo.
pause
