@echo off
echo 🌟 Starting World's Best E-commerce Backend - GoSellr 🌟
echo ================================================================
echo.
echo 🚀 Installing dependencies...
npm install
echo.
echo 📊 Setting up environment...
if not exist .env (
  echo Creating .env file...
  copy .env.example .env
  echo Please configure your .env file with your database and API keys
)
echo.
echo 🔗 Starting backend server...
echo 🌐 API URL: http://localhost:5000/api
echo 🏥 Health Check: http://localhost:5000/health
echo.
echo ✨ World's Best E-commerce Backend is starting!
echo.
npm run dev
