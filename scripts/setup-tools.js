#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🛠️ Setting up Goseller development tools...');

// Create TypeScript configuration files
const createTsConfig = (projectPath, isReact = false) => {
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: isReact ? "react-jsx" : "preserve",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      baseUrl: ".",
      paths: {
        "@/*": ["src/*"],
        "@/components/*": ["src/components/*"],
        "@/pages/*": ["src/pages/*"],
        "@/services/*": ["src/services/*"],
        "@/utils/*": ["src/utils/*"],
        "@/types/*": ["src/types/*"],
        "@/hooks/*": ["src/hooks/*"],
        "@/store/*": ["src/store/*"]
      }
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }]
  };

  const tsConfigPath = path.join(projectPath, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    console.log(`✅ Created tsconfig.json in ${path.basename(projectPath)}`);
  }

  // Create tsconfig.node.json for Vite
  if (isReact) {
    const tsConfigNode = {
      compilerOptions: {
        composite: true,
        skipLibCheck: true,
        module: "ESNext",
        moduleResolution: "bundler",
        allowSyntheticDefaultImports: true
      },
      include: ["vite.config.ts"]
    };

    const tsConfigNodePath = path.join(projectPath, 'tsconfig.node.json');
    if (!fs.existsSync(tsConfigNodePath)) {
      fs.writeFileSync(tsConfigNodePath, JSON.stringify(tsConfigNode, null, 2));
      console.log(`✅ Created tsconfig.node.json in ${path.basename(projectPath)}`);
    }
  }
};

// Create Vite configuration
const createViteConfig = (projectPath) => {
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})`;

  const viteConfigPath = path.join(projectPath, 'vite.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    fs.writeFileSync(viteConfigPath, viteConfig);
    console.log(`✅ Created vite.config.ts in ${path.basename(projectPath)}`);
  }
};

// Create ESLint configuration
const createEslintConfig = (projectPath) => {
  const eslintConfig = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  };

  const eslintConfigPath = path.join(projectPath, '.eslintrc.cjs');
  if (!fs.existsSync(eslintConfigPath)) {
    fs.writeFileSync(eslintConfigPath, `module.exports = ${JSON.stringify(eslintConfig, null, 2)}`);
    console.log(`✅ Created .eslintrc.cjs in ${path.basename(projectPath)}`);
  }
};

// Create Tailwind configuration
const createTailwindConfig = (projectPath) => {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}`;

  const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
  if (!fs.existsSync(tailwindConfigPath)) {
    fs.writeFileSync(tailwindConfigPath, tailwindConfig);
    console.log(`✅ Created tailwind.config.js in ${path.basename(projectPath)}`);
  }

  // Create PostCSS configuration
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  const postcssConfigPath = path.join(projectPath, 'postcss.config.js');
  if (!fs.existsSync(postcssConfigPath)) {
    fs.writeFileSync(postcssConfigPath, postcssConfig);
    console.log(`✅ Created postcss.config.js in ${path.basename(projectPath)}`);
  }
};

// Create Jest configuration for backend
const createJestConfig = (projectPath) => {
  const jestConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
      'src/**/*.ts',
      '!src/**/*.d.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
  };

  const jestConfigPath = path.join(projectPath, 'jest.config.js');
  if (!fs.existsSync(jestConfigPath)) {
    fs.writeFileSync(jestConfigPath, `module.exports = ${JSON.stringify(jestConfig, null, 2)}`);
    console.log(`✅ Created jest.config.js in ${path.basename(projectPath)}`);
  }
};

// Create nodemon configuration for backend
const createNodemonConfig = (projectPath) => {
  const nodemonConfig = {
    watch: ['src'],
    ext: 'ts,js',
    ignore: ['src/**/*.spec.ts'],
    exec: 'ts-node ./src/index.ts',
  };

  const nodemonConfigPath = path.join(projectPath, 'nodemon.json');
  if (!fs.existsSync(nodemonConfigPath)) {
    fs.writeFileSync(nodemonConfigPath, JSON.stringify(nodemonConfig, null, 2));
    console.log(`✅ Created nodemon.json in ${path.basename(projectPath)}`);
  }
};

// Setup frontend tools
const frontendPath = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(frontendPath)) {
  createTsConfig(frontendPath, true);
  createViteConfig(frontendPath);
  createEslintConfig(frontendPath);
  createTailwindConfig(frontendPath);
}

// Setup backend tools
const backendPath = path.join(__dirname, '..', 'backend');
if (fs.existsSync(backendPath)) {
  createTsConfig(backendPath);
  createJestConfig(backendPath);
  createNodemonConfig(backendPath);
}

// Setup admin panel tools
const adminPath = path.join(__dirname, '..', 'admin-panel');
if (fs.existsSync(adminPath)) {
  createTsConfig(adminPath, true);
  createViteConfig(adminPath);
  createEslintConfig(adminPath);
  createTailwindConfig(adminPath);
}

// Create Docker configuration
const createDockerConfig = () => {
  const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY admin-panel/package*.json ./admin-panel/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build applications
RUN npm run build

# Expose ports
EXPOSE 3000 3001 3002

# Start the application
CMD ["npm", "start"]`;

  const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) {
    fs.writeFileSync(dockerfilePath, dockerfile);
    console.log('✅ Created Dockerfile');
  }

  const dockerCompose = `version: '3.8'

services:
  goseller-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - goseller-backend

  goseller-backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/goseller_db
    depends_on:
      - postgres
      - redis

  goseller-admin:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
    depends_on:
      - goseller-backend

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: goseller_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:`;

  const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
  if (!fs.existsSync(dockerComposePath)) {
    fs.writeFileSync(dockerComposePath, dockerCompose);
    console.log('✅ Created docker-compose.yml');
  }
};

createDockerConfig();

console.log('🎉 Tools setup completed successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Install dependencies: npm run install:all');
console.log('2. Start development: npm run dev');
console.log('3. Run tests: npm run test');
console.log('4. Build for production: npm run build');
