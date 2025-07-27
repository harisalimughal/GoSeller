# 🚀 Goseller Quick Start Guide

## 📋 Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 9.0.0 or higher)
- **PostgreSQL** (version 14 or higher) - Optional for development
- **Redis** (version 6.0 or higher) - Optional for development

## ⚡ Quick Setup

### Option 1: Automated Setup (Recommended)

1. **Navigate to the project directory:**
   ```bash
   cd services/EHB-GOSELLER
   ```

2. **Run the automated setup script:**

   **Windows (PowerShell):**
   ```powershell
   .\setup.ps1
   ```

   **Windows (Command Prompt):**
   ```cmd
   setup.bat
   ```

   **Linux/Mac:**
   ```bash
   npm run setup
   ```

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Setup environment:**
   ```bash
   npm run setup:env
   ```

3. **Setup development tools:**
   ```bash
   npm run setup:tools
   ```

4. **Setup database (optional):**
   ```bash
   npm run setup:db
   ```

## 🔧 Configuration

1. **Edit the environment file:**
   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit the .env file with your configuration
   notepad .env  # Windows
   nano .env     # Linux/Mac
   ```

2. **Configure your database (if using PostgreSQL):**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/goseller_db
   ```

3. **Configure your Redis (if using Redis):**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

## 🚀 Start Development

### Start All Services
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3002

### Start Individual Services

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

**Admin panel only:**
```bash
npm run dev:admin
```

## 🔐 Default Credentials

After setup, you can use these default credentials:

- **Email**: `seller@goseller.com`
- **Password**: `password123`

## 📁 Project Structure

```
EHB-GOSELLER/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── admin-panel/       # Admin dashboard
├── scripts/           # Setup and utility scripts
├── docs/              # Documentation
├── .env.example       # Environment template
├── package.json       # Root package.json
└── README.md         # Project documentation
```

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Setup database
npm run setup:db
```

## 🔍 Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the port in `.env` file
   - Kill the process using the port

2. **Database connection failed:**
   - Make sure PostgreSQL is running
   - Check your database credentials in `.env`

3. **Dependencies not found:**
   - Run `npm run install:all` again
   - Clear npm cache: `npm cache clean --force`

4. **Build errors:**
   - Make sure all dependencies are installed
   - Check TypeScript configuration

### Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Look at the [docs/](docs/) folder for specific guides
- Create an issue in the repository

## 🎯 Next Steps

1. **Explore the application:**
   - Visit http://localhost:3000
   - Log in with default credentials
   - Explore the dashboard

2. **Customize the application:**
   - Edit the environment variables
   - Modify the database schema
   - Customize the UI components

3. **Deploy to production:**
   - Build the application: `npm run build`
   - Set up production environment
   - Configure your hosting platform

## 📞 Support

If you need help:

1. Check the documentation in the `docs/` folder
2. Look at the main [README.md](README.md)
3. Create an issue in the repository
4. Contact the development team

---

**Happy coding! 🎉**
