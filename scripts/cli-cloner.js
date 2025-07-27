#!/usr/bin/env node

const UniversalWebsiteCloner = require('./universal-website-cloner');
const readline = require('readline');
const chalk = require('chalk');

class CLICloner {
    constructor() {
        this.cloner = new UniversalWebsiteCloner();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async start() {
        console.log(chalk.blue.bold('🌐 EHB-GOSELLER Universal Website Cloner'));
        console.log(chalk.gray('================================================'));
        console.log();

        try {
            const config = await this.getConfiguration();
            await this.runCloning(config);

        } catch (error) {
            console.error(chalk.red('❌ Error:'), error.message);
            process.exit(1);
        } finally {
            this.rl.close();
        }
    }

    async getConfiguration() {
        const config = {};

        // Get target website URL
        config.targetUrl = await this.prompt('🌐 Enter the website URL to clone:', 'https://example.com');

        // Get cloning options
        config.dataTypes = await this.promptMultiChoice(
            '📦 What data do you want to extract?',
            ['products', 'categories', 'customers', 'orders', 'pages', 'assets'],
            ['products', 'categories']
        );

        // Get depth of cloning
        config.depth = await this.promptChoice(
            '🔍 How deep should we crawl?',
            [
                { value: 1, label: 'Surface level (main pages only)' },
                { value: 2, label: 'Medium depth (main + sub pages)' },
                { value: 3, label: 'Deep crawl (all accessible pages)' }
            ],
            1
        );

        // Get rate limiting
        config.rateLimit = await this.promptNumber(
            '⏱️  Delay between requests (ms):',
            1000
        );

        // Get output format
        config.outputFormat = await this.promptChoice(
            '📤 Output format:',
            [
                { value: 'json', label: 'JSON file' },
                { value: 'csv', label: 'CSV files' },
                { value: 'database', label: 'Direct to database' }
            ],
            'json'
        );

        return config;
    }

    async runCloning(config) {
        console.log(chalk.yellow('\n🚀 Starting website cloning process...'));
        console.log(chalk.gray(`Target: ${config.targetUrl}`));
        console.log(chalk.gray(`Data types: ${config.dataTypes.join(', ')}`));
        console.log(chalk.gray(`Depth: ${config.depth}`));
        console.log();

        const startTime = Date.now();

        try {
            const result = await this.cloner.cloneWebsite(config.targetUrl, config);

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;

            console.log(chalk.green('\n✅ Cloning completed successfully!'));
            console.log(chalk.gray(`Duration: ${duration.toFixed(2)} seconds`));

            // Display results summary
            this.displayResults(result);

            // Ask if user wants to import to EHB-GOSELLER
            const importToEHB = await this.promptYesNo(
                '🔄 Do you want to import this data into EHB-GOSELLER?'
            );

            if (importToEHB) {
                await this.importToEHBSystem(result);
            }

        } catch (error) {
            console.error(chalk.red('\n❌ Cloning failed:'), error.message);
            throw error;
        }
    }

    displayResults(result) {
        console.log(chalk.blue('\n📊 Cloning Results:'));
        console.log(chalk.gray('─'.repeat(50)));

        console.log(chalk.green(`📦 Products: ${result.products.length}`));
        console.log(chalk.green(`📂 Categories: ${result.categories.length}`));
        console.log(chalk.green(`👥 Customers: ${result.customers.length}`));
        console.log(chalk.green(`🛒 Orders: ${result.orders.length}`));
        console.log(chalk.green(`📄 Pages: ${result.pages.length}`));
        console.log(chalk.green(`🖼️  Images: ${result.images.length}`));
        console.log(chalk.green(`🎨 Styles: ${result.styles.length}`));
        console.log(chalk.green(`📜 Scripts: ${result.scripts.length}`));

        // Show sample data
        if (result.products.length > 0) {
            console.log(chalk.yellow('\n📦 Sample Products:'));
            result.products.slice(0, 3).forEach((product, index) => {
                console.log(chalk.gray(`  ${index + 1}. ${product.name} - ${product.price}`));
            });
        }

        if (result.categories.length > 0) {
            console.log(chalk.yellow('\n📂 Sample Categories:'));
            result.categories.slice(0, 5).forEach((category, index) => {
                console.log(chalk.gray(`  ${index + 1}. ${category.name}`));
            });
        }
    }

    async importToEHBSystem(result) {
        console.log(chalk.blue('\n🔄 Importing to EHB-GOSELLER...'));

        try {
            // Transform data for EHB-GOSELLER
            const transformedData = await this.cloner.transformDataForEHB();

            // Import to database
            await this.cloner.importToEHBSystem(transformedData);

            console.log(chalk.green('✅ Data imported to EHB-GOSELLER successfully!'));

        } catch (error) {
            console.error(chalk.red('❌ Import failed:'), error.message);
        }
    }

    // Helper methods for user input
    async prompt(question, defaultValue = '') {
        return new Promise((resolve) => {
            const promptText = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
            this.rl.question(chalk.cyan(promptText), (answer) => {
                resolve(answer.trim() || defaultValue);
            });
        });
    }

    async promptYesNo(question) {
        return new Promise((resolve) => {
            this.rl.question(chalk.cyan(`${question} (y/n): `), (answer) => {
                resolve(answer.toLowerCase().startsWith('y'));
            });
        });
    }

    async promptNumber(question, defaultValue = 0) {
        return new Promise((resolve) => {
            this.rl.question(chalk.cyan(`${question} (${defaultValue}): `), (answer) => {
                const num = parseInt(answer.trim());
                resolve(isNaN(num) ? defaultValue : num);
            });
        });
    }

    async promptMultiChoice(question, options, defaultValues = []) {
        console.log(chalk.cyan(`\n${question}`));
        options.forEach((option, index) => {
            const isDefault = defaultValues.includes(option);
            const marker = isDefault ? chalk.green('✓') : chalk.gray('○');
            console.log(`  ${marker} ${index + 1}. ${option}`);
        });

        return new Promise((resolve) => {
            this.rl.question(chalk.cyan('\nEnter numbers separated by commas: '), (answer) => {
                if (!answer.trim()) {
                    resolve(defaultValues);
                    return;
                }

                const selected = answer.split(',').map(num => {
                    const index = parseInt(num.trim()) - 1;
                    return options[index];
                }).filter(Boolean);

                resolve(selected.length > 0 ? selected : defaultValues);
            });
        });
    }

    async promptChoice(question, choices, defaultValue) {
        console.log(chalk.cyan(`\n${question}`));
        choices.forEach((choice, index) => {
            const isDefault = choice.value === defaultValue;
            const marker = isDefault ? chalk.green('✓') : chalk.gray('○');
            console.log(`  ${marker} ${index + 1}. ${choice.label}`);
        });

        return new Promise((resolve) => {
            this.rl.question(chalk.cyan('\nEnter choice number: '), (answer) => {
                const index = parseInt(answer.trim()) - 1;
                const selected = choices[index];
                resolve(selected ? selected.value : defaultValue);
            });
        });
    }
}

// CLI Usage
if (require.main === module) {
    const cli = new CLICloner();
    cli.start().catch(console.error);
}

module.exports = CLICloner;
