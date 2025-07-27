#!/usr/bin/env node

const WebsiteDataMigrator = require('./data-migration');
const readline = require('readline');

class WebsiteCloner {
    constructor() {
        this.migrator = new WebsiteDataMigrator();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log('🛒 EHB-GOSELLER Website Cloner');
        console.log('================================');

        try {
            const sourceUrl = await this.promptForUrl();
            const config = await this.promptForConfig();

            console.log('\n🚀 Starting website cloning process...');
            console.log(`Source: ${sourceUrl}`);

            await this.migrator.cloneWebsiteData(sourceUrl, config);

            console.log('\n✅ Website cloning completed successfully!');
            console.log('📊 Data has been imported into EHB-GOSELLER');

        } catch (error) {
            console.error('\n❌ Cloning failed:', error.message);
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }

    async promptForUrl() {
        return new Promise((resolve) => {
            this.rl.question('\n🌐 Enter the source website URL: ', (url) => {
                resolve(url.trim());
            });
        });
    }

    async promptForConfig() {
        const config = {};

        // Ask for data types to clone
        const dataTypes = await new Promise((resolve) => {
            this.rl.question('\n📦 What data do you want to clone? (products,customers,orders,categories): ', (types) => {
                resolve(types.trim().split(',').map(t => t.trim()));
            });
        });

        config.dataTypes = dataTypes;

        // Ask for batch size
        const batchSize = await new Promise((resolve) => {
            this.rl.question('\n📊 Batch size for processing (default: 100): ', (size) => {
                resolve(parseInt(size) || 100);
            });
        });

        config.batchSize = batchSize;

        // Ask for overwrite existing data
        const overwrite = await new Promise((resolve) => {
            this.rl.question('\n🔄 Overwrite existing data? (y/n, default: n): ', (answer) => {
                resolve(answer.toLowerCase() === 'y');
            });
        });

        config.overwrite = overwrite;

        return config;
    }
}

// CLI Usage
if (require.main === module) {
    const cloner = new WebsiteCloner();
    cloner.start().catch(console.error);
}

module.exports = WebsiteCloner;
