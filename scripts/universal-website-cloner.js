const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class UniversalWebsiteCloner {
    constructor() {
        this.browser = null;
        this.extractedData = {
            products: [],
            customers: [],
            orders: [],
            categories: [],
            pages: [],
            images: [],
            styles: [],
            scripts: []
        };
    }

    /**
     * Universal website cloning system
     * @param {string} targetUrl - Website to clone
     * @param {Object} options - Cloning options
     */
    async cloneWebsite(targetUrl, options = {}) {
        console.log('🌐 Starting Universal Website Cloner...');
        console.log(`Target: ${targetUrl}`);

        try {
            // Initialize browser
            await this.initializeBrowser();

            // Extract website structure
            await this.extractWebsiteStructure(targetUrl);

            // Extract different data types
            await this.extractProducts(targetUrl);
            await this.extractCategories(targetUrl);
            await this.extractCustomers(targetUrl);
            await this.extractOrders(targetUrl);

            // Download assets
            await this.downloadAssets(targetUrl);

            // Transform data for EHB-GOSELLER
            const transformedData = await this.transformDataForEHB();

            // Import into EHB-GOSELLER
            await this.importToEHBSystem(transformedData);

            console.log('✅ Website cloning completed successfully!');
            return this.extractedData;

        } catch (error) {
            console.error('❌ Cloning failed:', error.message);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    /**
     * Initialize Puppeteer browser
     */
    async initializeBrowser() {
        console.log('🚀 Initializing browser...');
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    /**
     * Extract website structure and pages
     */
    async extractWebsiteStructure(baseUrl) {
        console.log('📋 Extracting website structure...');

        const page = await this.browser.newPage();
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });

        // Get all internal links
        const links = await page.evaluate(() => {
            const anchors = document.querySelectorAll('a[href]');
            return Array.from(anchors).map(anchor => anchor.href);
        });

        // Filter internal links
        const internalLinks = links.filter(link =>
            link.startsWith(baseUrl) && !link.includes('#')
        );

        // Extract page data
        for (const link of internalLinks.slice(0, 10)) { // Limit to 10 pages
            try {
                await page.goto(link, { waitUntil: 'networkidle2' });
                const pageData = await this.extractPageData(page);
                this.extractedData.pages.push(pageData);
            } catch (error) {
                console.warn(`⚠️ Failed to extract page: ${link}`);
            }
        }

        await page.close();
    }

    /**
     * Extract product data from website
     */
    async extractProducts(baseUrl) {
        console.log('📦 Extracting products...');

        const page = await this.browser.newPage();

        // Common product page patterns
        const productPatterns = [
            '/product/', '/products/', '/item/', '/shop/',
            'product-detail', 'product-page', 'item-detail'
        ];

        for (const pattern of productPatterns) {
            try {
                const productUrl = `${baseUrl}${pattern}`;
                await page.goto(productUrl, { waitUntil: 'networkidle2' });

                const products = await page.evaluate(() => {
                    const productElements = document.querySelectorAll('[class*="product"], [class*="item"], [id*="product"]');

                    return Array.from(productElements).map(element => {
                        const name = element.querySelector('[class*="title"], [class*="name"], h1, h2, h3')?.textContent?.trim();
                        const price = element.querySelector('[class*="price"], [class*="cost"]')?.textContent?.trim();
                        const description = element.querySelector('[class*="description"], [class*="desc"], p')?.textContent?.trim();
                        const image = element.querySelector('img')?.src;

                        return { name, price, description, image };
                    }).filter(product => product.name && product.price);
                });

                this.extractedData.products.push(...products);

            } catch (error) {
                console.warn(`⚠️ Failed to extract products from pattern: ${pattern}`);
            }
        }

        await page.close();
    }

    /**
     * Extract category data
     */
    async extractCategories(baseUrl) {
        console.log('📂 Extracting categories...');

        const page = await this.browser.newPage();
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });

        const categories = await page.evaluate(() => {
            const categoryElements = document.querySelectorAll('[class*="category"], [class*="menu"], nav a');

            return Array.from(categoryElements).map(element => {
                const name = element.textContent?.trim();
                const link = element.href;

                return { name, link };
            }).filter(category => category.name && category.name.length > 2);
        });

        this.extractedData.categories = categories;
        await page.close();
    }

    /**
     * Extract customer data (if available)
     */
    async extractCustomers(baseUrl) {
        console.log('👥 Extracting customer data...');

        // This would typically require admin access
        // For demo purposes, we'll create sample customer data
        this.extractedData.customers = [
            {
                name: 'Sample Customer',
                email: 'customer@example.com',
                phone: '+1234567890',
                address: 'Sample Address'
            }
        ];
    }

    /**
     * Extract order data (if available)
     */
    async extractOrders(baseUrl) {
        console.log('🛒 Extracting order data...');

        // This would typically require admin access
        // For demo purposes, we'll create sample order data
        this.extractedData.orders = [
            {
                id: 'ORD-001',
                customer_id: 1,
                total_amount: 99.99,
                status: 'completed',
                items: ['Product 1', 'Product 2']
            }
        ];
    }

    /**
     * Download website assets
     */
    async downloadAssets(baseUrl) {
        console.log('📥 Downloading assets...');

        const page = await this.browser.newPage();
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });

        // Extract CSS and JS files
        const assets = await page.evaluate(() => {
            const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .map(link => link.href);

            const scripts = Array.from(document.querySelectorAll('script[src]'))
                .map(script => script.src);

            const images = Array.from(document.querySelectorAll('img'))
                .map(img => img.src);

            return { stylesheets, scripts, images };
        });

        this.extractedData.styles = assets.stylesheets;
        this.extractedData.scripts = assets.scripts;
        this.extractedData.images = assets.images;

        await page.close();
    }

    /**
     * Transform extracted data for EHB-GOSELLER format
     */
    async transformDataForEHB() {
        console.log('🔄 Transforming data for EHB-GOSELLER...');

        return {
            products: this.extractedData.products.map(product => ({
                name: product.name,
                description: product.description || '',
                price: this.parsePrice(product.price),
                category_id: this.findCategoryId(product.name),
                inventory: Math.floor(Math.random() * 100) + 1,
                images: product.image ? [product.image] : [],
                created_at: new Date(),
                updated_at: new Date()
            })),

            categories: this.extractedData.categories.map(category => ({
                name: category.name,
                description: `Category: ${category.name}`,
                parent_id: null,
                created_at: new Date(),
                updated_at: new Date()
            })),

            customers: this.extractedData.customers.map(customer => ({
                email: customer.email,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                created_at: new Date(),
                updated_at: new Date()
            })),

            orders: this.extractedData.orders.map(order => ({
                customer_id: order.customer_id,
                total_amount: order.total_amount,
                status: order.status,
                items: order.items,
                created_at: new Date(),
                updated_at: new Date()
            }))
        };
    }

    /**
     * Import data into EHB-GOSELLER system
     */
    async importToEHBSystem(transformedData) {
        console.log('📤 Importing data into EHB-GOSELLER...');

        // Here you would integrate with the EHB-GOSELLER database
        // For now, we'll save the data to a JSON file
        const importData = {
            timestamp: new Date().toISOString(),
            source: 'Universal Website Cloner',
            data: transformedData
        };

        await fs.writeFile(
            path.join(__dirname, '../data/imported-data.json'),
            JSON.stringify(importData, null, 2)
        );

        console.log('✅ Data imported successfully!');
    }

    /**
     * Extract page data
     */
    async extractPageData(page) {
        return await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                content: document.body.innerText.substring(0, 1000),
                meta: {
                    description: document.querySelector('meta[name="description"]')?.content,
                    keywords: document.querySelector('meta[name="keywords"]')?.content
                }
            };
        });
    }

    /**
     * Parse price from string
     */
    parsePrice(priceString) {
        if (!priceString) return 0;
        const price = priceString.replace(/[^\d.]/g, '');
        return parseFloat(price) || 0;
    }

    /**
     * Find category ID for product
     */
    findCategoryId(productName) {
        // Simple category matching logic
        const categories = this.extractedData.categories;
        for (let i = 0; i < categories.length; i++) {
            if (productName.toLowerCase().includes(categories[i].name.toLowerCase())) {
                return i + 1;
            }
        }
        return 1; // Default category
    }
}

module.exports = UniversalWebsiteCloner;
