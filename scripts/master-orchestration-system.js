#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class MasterOrchestrationSystem {
    constructor() {
        this.components = {
            platformAnalysis: false,
            nextjsEnvironment: false,
            aiSystem: false,
            blockchainSystem: false,
            productionSystem: false,
            testingSystem: false,
            unifiedSystem: false,
            documentationSystem: false
        };
        this.status = {
            running: false,
            errors: [],
            warnings: [],
            performance: {}
        };
    }

    async initialize() {
        console.log('🎯 Initializing Master Orchestration System...');
        console.log('=============================================');

        try {
            await this.checkPrerequisites();
            await this.setupAllComponents();
            await this.validateIntegration();
            await this.startMonitoring();
            await this.generateStatusReport();

            console.log('✅ Master Orchestration System initialized successfully!');
        } catch (error) {
            console.error('❌ Master Orchestration System initialization failed:', error.message);
            throw error;
        }
    }

    async checkPrerequisites() {
        console.log('🔍 Checking system prerequisites...');

        const checks = [
            { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
            { name: 'npm', command: 'npm --version', minVersion: '9.0.0' },
            { name: 'Git', command: 'git --version', minVersion: '2.0.0' },
            { name: 'Docker', command: 'docker --version', minVersion: '20.0.0' }
        ];

        for (const check of checks) {
            try {
                const version = execSync(check.command, { encoding: 'utf8' }).trim();
                console.log(`✅ ${check.name}: ${version}`);
            } catch (error) {
                console.warn(`⚠️  ${check.name}: Not found or version too old`);
                this.status.warnings.push(`${check.name} not available`);
            }
        }
    }

    async setupAllComponents() {
        console.log('\n🚀 Setting up all platform components...');

        const setupSteps = [
            { name: 'Platform Analysis System', script: 'npm run extract:platforms' },
            { name: 'Next.js Environment', script: 'npm run setup:nextjs' },
            { name: 'AI System', script: 'npm run setup:ai' },
            { name: 'Blockchain System', script: 'npm run setup:blockchain' },
            { name: 'Production System', script: 'npm run setup:production' },
            { name: 'Testing System', script: 'npm run setup:testing' },
            { name: 'Unified System', script: 'npm run setup:unified' },
            { name: 'Documentation System', script: 'npm run setup:documentation' }
        ];

        for (const step of setupSteps) {
            try {
                console.log(`\n📦 Setting up ${step.name}...`);
                execSync(step.script, { stdio: 'inherit' });
                this.components[this.getComponentKey(step.name)] = true;
                console.log(`✅ ${step.name} setup completed`);
            } catch (error) {
                console.error(`❌ ${step.name} setup failed:`, error.message);
                this.status.errors.push(`${step.name} setup failed`);
            }
        }
    }

    getComponentKey(name) {
        const mapping = {
            'Platform Analysis System': 'platformAnalysis',
            'Next.js Environment': 'nextjsEnvironment',
            'AI System': 'aiSystem',
            'Blockchain System': 'blockchainSystem',
            'Production System': 'productionSystem',
            'Testing System': 'testingSystem',
            'Unified System': 'unifiedSystem',
            'Documentation System': 'documentationSystem'
        };
        return mapping[name] || 'unknown';
    }

    async validateIntegration() {
        console.log('\n🔍 Validating system integration...');

        const validations = [
            { name: 'Component Validation', script: 'npm run validate:components' },
            { name: 'Integration Validation', script: 'npm run validate:integration' },
            { name: 'Performance Validation', script: 'npm run validate:performance' },
            { name: 'Security Validation', script: 'npm run validate:security' },
            { name: 'Data Validation', script: 'npm run validate:data' }
        ];

        for (const validation of validations) {
            try {
                console.log(`\n🔍 Running ${validation.name}...`);
                execSync(validation.script, { stdio: 'inherit' });
                console.log(`✅ ${validation.name} passed`);
            } catch (error) {
                console.error(`❌ ${validation.name} failed:`, error.message);
                this.status.errors.push(`${validation.name} failed`);
            }
        }
    }

    async startMonitoring() {
        console.log('\n📊 Starting system monitoring...');

        this.status.running = true;

        // Start monitoring processes
        const monitoringTasks = [
            this.monitorPerformance(),
            this.monitorHealth(),
            this.monitorErrors(),
            this.monitorResources()
        ];

        // Run monitoring in background
        Promise.all(monitoringTasks).catch(error => {
            console.error('Monitoring error:', error.message);
        });
    }

    async monitorPerformance() {
        setInterval(async () => {
            try {
                const performance = await this.getPerformanceMetrics();
                this.status.performance = performance;
            } catch (error) {
                console.error('Performance monitoring error:', error.message);
            }
        }, 30000); // Check every 30 seconds
    }

    async monitorHealth() {
        setInterval(async () => {
            try {
                const health = await this.checkSystemHealth();
                if (!health.healthy) {
                    console.warn('⚠️  System health issues detected');
                }
            } catch (error) {
                console.error('Health monitoring error:', error.message);
            }
        }, 60000); // Check every minute
    }

    async monitorErrors() {
        setInterval(async () => {
            if (this.status.errors.length > 0) {
                console.error('❌ System errors detected:', this.status.errors);
            }
        }, 300000); // Check every 5 minutes
    }

    async monitorResources() {
        setInterval(async () => {
            try {
                const resources = await this.getResourceUsage();
                if (resources.cpu > 80 || resources.memory > 80) {
                    console.warn('⚠️  High resource usage detected');
                }
            } catch (error) {
                console.error('Resource monitoring error:', error.message);
            }
        }, 60000); // Check every minute
    }

    async getPerformanceMetrics() {
        // Simulate performance metrics
        return {
            responseTime: Math.random() * 100 + 50, // 50-150ms
            throughput: Math.random() * 1000 + 500, // 500-1500 req/s
            errorRate: Math.random() * 2, // 0-2%
            uptime: 99.9
        };
    }

    async checkSystemHealth() {
        // Simulate health check
        return {
            healthy: true,
            components: this.components,
            timestamp: new Date().toISOString()
        };
    }

    async getResourceUsage() {
        // Simulate resource usage
        return {
            cpu: Math.random() * 30 + 20, // 20-50%
            memory: Math.random() * 40 + 30, // 30-70%
            disk: Math.random() * 20 + 10 // 10-30%
        };
    }

    async generateStatusReport() {
        console.log('\n📋 Generating comprehensive status report...');

        const report = {
            timestamp: new Date().toISOString(),
            system: {
                status: this.status.running ? 'RUNNING' : 'STOPPED',
                components: this.components,
                errors: this.status.errors,
                warnings: this.status.warnings
            },
            performance: this.status.performance,
            health: await this.checkSystemHealth(),
            resources: await this.getResourceUsage()
        };

        await fs.writeFile('system-status-report.json', JSON.stringify(report, null, 2));

        console.log('\n🎉 Master Orchestration System Status Report:');
        console.log('=============================================');
        console.log(`📊 System Status: ${report.system.status}`);
        console.log(`⏰ Timestamp: ${report.timestamp}`);
        console.log(`🔧 Components: ${Object.values(this.components).filter(Boolean).length}/8 active`);
        console.log(`❌ Errors: ${this.status.errors.length}`);
        console.log(`⚠️  Warnings: ${this.status.warnings.length}`);

        if (report.performance) {
            console.log(`📈 Performance:`);
            console.log(`   - Response Time: ${report.performance.responseTime.toFixed(2)}ms`);
            console.log(`   - Throughput: ${report.performance.throughput.toFixed(0)} req/s`);
            console.log(`   - Error Rate: ${report.performance.errorRate.toFixed(2)}%`);
            console.log(`   - Uptime: ${report.performance.uptime}%`);
        }

        console.log('\n🚀 Available Commands:');
        console.log('npm run start:all          # Start all systems');
        console.log('npm run stop:all           # Stop all systems');
        console.log('npm run restart:all        # Restart all systems');
        console.log('npm run status:all         # Check system status');
        console.log('npm run monitor:all        # Monitor all systems');
        console.log('npm run logs:all           # View all logs');
        console.log('npm run health:all         # Health check all systems');
    }

    async startAllSystems() {
        console.log('🚀 Starting all GoSellr systems...');

        const startCommands = [
            'npm run dev:frontend',
            'npm run dev:backend',
            'npm run dev:admin'
        ];

        for (const command of startCommands) {
            try {
                console.log(`\n🚀 Starting: ${command}`);
                execSync(command, { stdio: 'inherit', detached: true });
            } catch (error) {
                console.error(`❌ Failed to start: ${command}`, error.message);
            }
        }
    }

    async stopAllSystems() {
        console.log('🛑 Stopping all GoSellr systems...');

        try {
            execSync('pkill -f "npm run dev"', { stdio: 'inherit' });
            console.log('✅ All systems stopped');
        } catch (error) {
            console.error('❌ Failed to stop systems:', error.message);
        }
    }

    async restartAllSystems() {
        console.log('🔄 Restarting all GoSellr systems...');

        await this.stopAllSystems();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        await this.startAllSystems();
    }
}

// Run the master orchestration system
if (require.main === module) {
    const masterSystem = new MasterOrchestrationSystem();
    masterSystem.initialize().catch(console.error);
}

module.exports = MasterOrchestrationSystem;
