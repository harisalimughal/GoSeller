#!/usr/bin/env node

const AIRecommendationSystem = require('./ai-recommendation-system');

async function runAISystem() {
    console.log('🤖 Starting AI Recommendation System Setup');
    console.log('==========================================');

    try {
        const aiSystem = new AIRecommendationSystem();
        await aiSystem.initialize();

        console.log('\n🎉 AI System setup completed successfully!');
        console.log('\n📋 What was created:');
        console.log('✅ AI Recommendation Engine');
        console.log('✅ AI Components (RecommendationCard, AISearch, etc.)');
        console.log('✅ AI API Routes (/api/ai/*)');
        console.log('✅ AI Dashboard (/ai-dashboard)');
        console.log('✅ Machine Learning Algorithms');
        console.log('✅ User Profiling System');

        console.log('\n🔧 Available Features:');
        console.log('- Collaborative Filtering');
        console.log('- Content-Based Filtering');
        console.log('- Hybrid Recommendations');
        console.log('- AI-Powered Search');
        console.log('- Trending Analysis');
        console.log('- Personalized Feeds');

        console.log('\n🚀 Next Steps:');
        console.log('1. Start your Next.js development server');
        console.log('2. Navigate to /ai-dashboard');
        console.log('3. Test AI recommendations');
        console.log('4. Customize algorithms for your needs');

    } catch (error) {
        console.error('❌ AI System setup failed:', error.message);
        process.exit(1);
    }
}

runAISystem();
