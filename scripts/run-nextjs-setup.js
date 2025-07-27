#!/usr/bin/env node

const GoSellrNextJSSetup = require('./setup-nextjs-project');

async function runSetup() {
    console.log('🚀 Starting GoSellr Next.js Project Setup');
    console.log('==========================================');

    try {
        const setup = new GoSellrNextJSSetup();
        await setup.setupCompleteProject();

        console.log('\n🎉 Setup completed successfully!');
        console.log('\n📋 Next Steps:');
        console.log('1. cd gosellr-nextjs');
        console.log('2. npm run dev');
        console.log('3. Open http://localhost:3000');

        console.log('\n🔧 Available Scripts:');
        console.log('- npm run dev (Start development server)');
        console.log('- npm run build (Build for production)');
        console.log('- npm run start (Start production server)');
        console.log('- npm run lint (Run ESLint)');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

runSetup();
