@echo off
echo ========================================
echo EHB-GOSELLER Setup Script
echo ========================================
echo.

echo 🚀 Starting Goseller setup...
echo.

echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

echo ✅ Root dependencies installed
echo.

echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Frontend dependencies installed
echo.

echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Backend dependencies installed
echo.

echo 📦 Installing admin panel dependencies...
cd admin-panel
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install admin panel dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Admin panel dependencies installed
echo.

echo 🔧 Setting up environment...
call npm run setup:env
if %errorlevel% neq 0 (
    echo ❌ Failed to setup environment
    pause
    exit /b 1
)

echo ✅ Environment setup completed
echo.

echo 🛠️ Setting up development tools...
call npm run setup:tools
if %errorlevel% neq 0 (
    echo ❌ Failed to setup development tools
    pause
    exit /b 1
)

echo ✅ Development tools setup completed
echo.

echo 🗄️ Setting up database...
call npm run setup:db
if %errorlevel% neq 0 (
    echo ❌ Failed to setup database
    pause
    exit /b 1
)

echo ✅ Database setup completed
echo.

echo ========================================
echo 🎉 Goseller setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Start development: npm run dev
echo 3. Open http://localhost:3000 for frontend
echo 4. Open http://localhost:3001 for backend API
echo 5. Open http://localhost:3002 for admin panel
echo.
echo Default credentials:
echo - Email: seller@goseller.com
echo - Password: password123
echo.
pause
