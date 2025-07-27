const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class PlatformDataExtractor {
    constructor() {
        this.extractedData = {
            amazon: [],
            shopify: [],
            ebay: [],
            fiverr: [],
            opensea: [],
            binance: []
        };
        this.browser = null;
    }

    /**
     * Extract data from world's best platforms for GoSellr
     */
    async extractAllPlatformData() {
        console.log('🌍 Starting data extraction from world\'s best platforms...');

        try {
            await this.initializeBrowser();

            // Extract from major platforms
            await this.extractAmazonData();
            await this.extractShopifyData();
            await this.extractEbayData();
            await this.extractFiverrData();
            await this.extractOpenSeaData();
            await this.extractBinanceData();

            // Transform data for GoSellr
            const transformedData = await this.transformForGoSellr();

            console.log('✅ Platform data extraction completed!');
            return transformedData;

        } catch (error) {
            console.error('❌ Data extraction failed:', error.message);
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
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    /**
     * Extract Amazon data (Product catalog, pricing, reviews)
     */
    async extractAmazonData() {
        console.log('📦 Extracting Amazon data...');

        const page = await this.browser.newPage();

        // Amazon product categories to extract
        const categories = [
            'electronics',
            'clothing',
            'books',
            'home-garden',
            'sports-outdoors'
        ];

        for (const category of categories) {
            try {
                await page.goto(`https://www.amazon.com/s?k=${category}`, {
                    waitUntil: 'networkidle2'
                });

                const products = await page.evaluate(() => {
                    const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');

                    return Array.from(productElements).map(element => {
                        const title = element.querySelector('h2 a span')?.textContent?.trim();
                        const price = element.querySelector('.a-price-whole')?.textContent?.trim();
                        const rating = element.querySelector('.a-icon-alt')?.textContent?.trim();
                        const reviews = element.querySelector('.a-size-base')?.textContent?.trim();
                        const image = element.querySelector('img')?.src;

                        return {
                            title,
                            price: price ? `$${price}` : null,
                            rating: rating ? parseFloat(rating.split(' ')[0]) : null,
                            reviews: reviews ? parseInt(reviews.replace(/[^\d]/g, '')) : 0,
                            image,
                            category: category,
                            platform: 'Amazon'
                        };
                    }).filter(product => product.title && product.price);
                });

                this.extractedData.amazon.push(...products);

                // Rate limiting
                await this.delay(2000);

            } catch (error) {
                console.warn(`⚠️ Failed to extract Amazon ${category}:`, error.message);
            }
        }

        await page.close();
    }

    /**
     * Extract Shopify store templates and themes
     */
    async extractShopifyData() {
        console.log('🏪 Extracting Shopify data...');

        const page = await this.browser.newPage();

        try {
            // Extract Shopify themes
            await page.goto('https://themes.shopify.com/', {
                waitUntil: 'networkidle2'
            });

            const themes = await page.evaluate(() => {
                const themeElements = document.querySelectorAll('[data-testid="theme-card"]');

                return Array.from(themeElements).map(element => {
                    const name = element.querySelector('h3')?.textContent?.trim();
                    const price = element.querySelector('[data-testid="price"]')?.textContent?.trim();
                    const category = element.querySelector('[data-testid="category"]')?.textContent?.trim();
                    const rating = element.querySelector('[data-testid="rating"]')?.textContent?.trim();

                    return {
                        name,
                        price,
                        category,
                        rating: rating ? parseFloat(rating) : null,
                        platform: 'Shopify',
                        type: 'theme'
                    };
                }).filter(theme => theme.name);
            });

            this.extractedData.shopify.push(...themes);

        } catch (error) {
            console.warn('⚠️ Failed to extract Shopify data:', error.message);
        }

        await page.close();
    }

    /**
     * Extract eBay marketplace data
     */
    async extractEbayData() {
        console.log('🏪 Extracting eBay data...');

        const page = await this.browser.newPage();

        // eBay categories to extract
        const categories = [
            'electronics',
            'fashion',
            'collectibles',
            'home-garden',
            'sporting-goods'
        ];

        for (const category of categories) {
            try {
                await page.goto(`https://www.ebay.com/sch/i.html?_nkw=${category}`, {
                    waitUntil: 'networkidle2'
                });

                const listings = await page.evaluate(() => {
                    const listingElements = document.querySelectorAll('.s-item');

                    return Array.from(listingElements).map(element => {
                        const title = element.querySelector('.s-item__title')?.textContent?.trim();
                        const price = element.querySelector('.s-item__price')?.textContent?.trim();
                        const shipping = element.querySelector('.s-item__shipping')?.textContent?.trim();
                        const location = element.querySelector('.s-item__location')?.textContent?.trim();
                        const image = element.querySelector('img')?.src;

                        return {
                            title,
                            price,
                            shipping,
                            location,
                            image,
                            category: category,
                            platform: 'eBay'
                        };
                    }).filter(listing => listing.title && listing.price);
                });

                this.extractedData.ebay.push(...listings);

                await this.delay(2000);

            } catch (error) {
                console.warn(`⚠️ Failed to extract eBay ${category}:`, error.message);
            }
        }

        await page.close();
    }

    /**
     * Extract Fiverr service marketplace data
     */
    async extractFiverrData() {
        console.log('🛠️ Extracting Fiverr data...');

        const page = await this.browser.newPage();

        // Fiverr service categories
        const categories = [
            'graphics-design',
            'digital-marketing',
            'writing-translation',
            'video-animation',
            'programming-tech'
        ];

        for (const category of categories) {
            try {
                await page.goto(`https://www.fiverr.com/categories/${category}`, {
                    waitUntil: 'networkidle2'
                });

                const services = await page.evaluate(() => {
                    const serviceElements = document.querySelectorAll('[data-testid="gig-card"]');

                    return Array.from(serviceElements).map(element => {
                        const title = element.querySelector('h3')?.textContent?.trim();
                        const seller = element.querySelector('[data-testid="seller-name"]')?.textContent?.trim();
                        const price = element.querySelector('[data-testid="starting-price"]')?.textContent?.trim();
                        const rating = element.querySelector('[data-testid="rating"]')?.textContent?.trim();
                        const image = element.querySelector('img')?.src;

                        return {
                            title,
                            seller,
                            price,
                            rating: rating ? parseFloat(rating) : null,
                            image,
                            category: category,
                            platform: 'Fiverr'
                        };
                    }).filter(service => service.title && service.price);
                });

                this.extractedData.fiverr.push(...services);

                await this.delay(2000);

            } catch (error) {
                console.warn(`⚠️ Failed to extract Fiverr ${category}:`, error.message);
            }
        }

        await page.close();
    }

    /**
     * Extract OpenSea NFT marketplace data
     */
    async extractOpenSeaData() {
        console.log('🖼️ Extracting OpenSea NFT data...');

        const page = await this.browser.newPage();

        try {
            await page.goto('https://opensea.io/rankings', {
                waitUntil: 'networkidle2'
            });

            const nfts = await page.evaluate(() => {
                const nftElements = document.querySelectorAll('[data-testid="nft-card"]');

                return Array.from(nftElements).map(element => {
                    const name = element.querySelector('h4')?.textContent?.trim();
                    const collection = element.querySelector('[data-testid="collection-name"]')?.textContent?.trim();
                    const price = element.querySelector('[data-testid="price"]')?.textContent?.trim();
                    const creator = element.querySelector('[data-testid="creator"]')?.textContent?.trim();
                    const image = element.querySelector('img')?.src;

                    return {
                        name,
                        collection,
                        price,
                        creator,
                        image,
                        platform: 'OpenSea',
                        type: 'NFT'
                    };
                }).filter(nft => nft.name && nft.price);
            });

            this.extractedData.opensea.push(...nfts);

        } catch (error) {
            console.warn('⚠️ Failed to extract OpenSea data:', error.message);
        }

        await page.close();
    }

    /**
     * Extract Binance trading data
     */
    async extractBinanceData() {
        console.log('🏪 Extracting Binance data...');

        const page = await this.browser.newPage();

        try {
            await page.goto('https://www.binance.com/en/nft/home', {
                waitUntil: 'networkidle2'
            });

            const nfts = await page.evaluate(() => {
                const nftElements = document.querySelectorAll('[data-testid="nft-item"]');

                return Array.from(nftElements).map(element => {
                    const name = element.querySelector('h3')?.textContent?.trim();
                    const price = element.querySelector('[data-testid="price"]')?.textContent?.trim();
                    const creator = element.querySelector('[data-testid="creator"]')?.textContent?.trim();
                    const image = element.querySelector('img')?.src;

                    return {
                        name,
                        price,
                        creator,
                        image,
                        platform: 'Binance',
                        type: 'NFT'
                    };
                }).filter(nft => nft.name && nft.price);
            });

            this.extractedData.binance.push(...nfts);

        } catch (error) {
            console.warn('⚠️ Failed to extract Binance data:', error.message);
        }

        await page.close();
    }

    /**
     * Transform extracted data for GoSellr format
     */
    async transformForGoSellr() {
        console.log('🔄 Transforming data for GoSellr...');

        return {
            products: this.transformProductData(),
            services: this.transformServiceData(),
            nfts: this.transformNFTData(),
            templates: this.transformTemplateData(),
            analytics: this.generateAnalytics()
        };
    }

    /**
     * Transform product data from Amazon, eBay, Walmart
     */
    transformProductData() {
        const products = [];

        // Amazon products
        this.extractedData.amazon.forEach(item => {
            products.push({
                name: item.title,
                price: item.price,
                category: item.category,
                platform: item.platform,
                rating: item.rating,
                reviews: item.reviews,
                image: item.image,
                type: 'product'
            });
        });

        // eBay products
        this.extractedData.ebay.forEach(item => {
            products.push({
                name: item.title,
                price: item.price,
                category: item.category,
                platform: item.platform,
                shipping: item.shipping,
                location: item.location,
                image: item.image,
                type: 'product'
            });
        });

        return products;
    }

    /**
     * Transform service data from Fiverr, Airbnb
     */
    transformServiceData() {
        const services = [];

        // Fiverr services
        this.extractedData.fiverr.forEach(item => {
            services.push({
                name: item.title,
                provider: item.seller,
                price: item.price,
                category: item.category,
                platform: item.platform,
                rating: item.rating,
                image: item.image,
                type: 'service'
            });
        });

        return services;
    }

    /**
     * Transform NFT data from OpenSea, Binance
     */
    transformNFTData() {
        const nfts = [];

        // OpenSea NFTs
        this.extractedData.opensea.forEach(item => {
            nfts.push({
                name: item.name,
                collection: item.collection,
                price: item.price,
                creator: item.creator,
                platform: item.platform,
                image: item.image,
                type: 'NFT'
            });
        });

        // Binance NFTs
        this.extractedData.binance.forEach(item => {
            nfts.push({
                name: item.name,
                price: item.price,
                creator: item.creator,
                platform: item.platform,
                image: item.image,
                type: 'NFT'
            });
        });

        return nfts;
    }

    /**
     * Transform template data from Shopify
     */
    transformTemplateData() {
        return this.extractedData.shopify.map(item => ({
            name: item.name,
            price: item.price,
            category: item.category,
            platform: item.platform,
            rating: item.rating,
            type: 'template'
        }));
    }

    /**
     * Generate analytics from extracted data
     */
    generateAnalytics() {
        return {
            totalProducts: this.extractedData.amazon.length + this.extractedData.ebay.length,
            totalServices: this.extractedData.fiverr.length,
            totalNFTs: this.extractedData.opensea.length + this.extractedData.binance.length,
            totalTemplates: this.extractedData.shopify.length,
            platforms: {
                amazon: this.extractedData.amazon.length,
                ebay: this.extractedData.ebay.length,
                fiverr: this.extractedData.fiverr.length,
                opensea: this.extractedData.opensea.length,
                binance: this.extractedData.binance.length,
                shopify: this.extractedData.shopify.length
            }
        };
    }

    /**
     * Delay function for rate limiting
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = PlatformDataExtractor;
