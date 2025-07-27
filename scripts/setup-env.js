#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Goseller environment...');

// Create .env file from template
const envTemplatePath = path.join(__dirname, '..', 'env.example');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envTemplatePath)) {
    fs.copyFileSync(envTemplatePath, envPath);
    console.log('✅ Created .env file from template');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Create necessary directories
const directories = [
  'uploads',
  'logs',
  'frontend/src',
  'frontend/public',
  'backend/src',
  'backend/tests',
  'admin-panel/src',
  'admin-panel/public',
  'docs'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .gitignore files
const gitignoreContent = `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
out/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Uploads
uploads/
public/uploads/

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;

const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, gitignoreContent.trim());
  console.log('✅ Created .gitignore file');
}

console.log('🎉 Environment setup completed successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Run: npm run install:all');
console.log('3. Run: npm run setup:db');
console.log('4. Run: npm run dev');
