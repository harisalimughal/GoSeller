# 🌐 Universal Website Cloner Guide

## 📋 Overview

The **Universal Website Cloner** is an advanced tool that can extract data from any website and integrate it into the EHB-GOSELLER ecommerce platform. This tool uses web scraping, data extraction, and intelligent transformation to clone website content.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd services/EHB-GOSELLER
npm install
```

### 2. Run Universal Cloner

```bash
npm run clone:universal
```

### 3. Follow Interactive Prompts

The tool will guide you through:
- Website URL input
- Data type selection
- Cloning depth configuration
- Rate limiting settings
- Output format selection

## 🛠️ Features

### 🌐 Universal Website Support
- **Any Website**: Works with any publicly accessible website
- **Multiple Formats**: Supports HTML, JSON APIs, XML feeds
- **Smart Detection**: Automatically detects website structure
- **Rate Limiting**: Respects website policies and robots.txt

### 📦 Data Extraction
- **Products**: Names, prices, descriptions, images, variants
- **Categories**: Hierarchical category structure
- **Customers**: User profiles and contact information
- **Orders**: Transaction history and order details
- **Pages**: Website content and structure
- **Assets**: Images, CSS, JavaScript files

### 🔄 Data Transformation
- **Format Conversion**: Converts any data format to EHB-GOSELLER format
- **Data Cleaning**: Removes duplicates and invalid data
- **Field Mapping**: Maps source fields to target fields
- **Validation**: Ensures data integrity and completeness

## 📊 Supported Website Types

### 🛒 Ecommerce Websites
- **Shopify**: Automatic detection and extraction
- **WooCommerce**: WordPress ecommerce sites
- **Magento**: Enterprise ecommerce platforms
- **Custom Ecommerce**: Any custom-built online stores

### 📰 Content Websites
- **Blogs**: Article content and metadata
- **News Sites**: News articles and categories
- **Portfolio Sites**: Project showcases and descriptions
- **Corporate Sites**: Company information and products

### 🎨 Modern Web Applications
- **SPA (Single Page Apps)**: React, Vue, Angular sites
- **API-Driven Sites**: Sites with JSON APIs
- **Dynamic Content**: JavaScript-rendered content
- **Progressive Web Apps**: PWA-enabled sites

## 🔧 Advanced Configuration

### Custom Data Extractors

```javascript
// Create custom extractor for specific website
const customExtractor = {
    name: 'MyCustomExtractor',
    patterns: {
        products: '[data-product]',
        prices: '[data-price]',
        images: '[data-image]'
    },
    transformations: {
        price: (value) => parseFloat(value.replace(/[^\d.]/g, '')),
        image: (value) => new URL(value, baseUrl).href
    }
};
```

### Rate Limiting Configuration

```javascript
const config = {
    rateLimit: {
        requests: 100,        // Requests per window
        window: 60000,        // Time window in ms
        delay: 1000          // Delay between requests
    },
    respectRobotsTxt: true,
    userAgent: 'EHB-GOSELLER-Bot/1.0'
};
```

### Depth Control

```javascript
const depthConfig = {
    surface: 1,      // Main pages only
    medium: 2,       // Main + sub pages
    deep: 3          // All accessible pages
};
```

## 📈 Performance Optimization

### Batch Processing
```javascript
// Process data in batches for better performance
const batchSize = 100;
for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await processBatch(batch);
    await delay(1000); // Rate limiting
}
```

### Parallel Processing
```javascript
// Process multiple data types in parallel
const promises = [
    extractProducts(sourceUrl),
    extractCategories(sourceUrl),
    extractCustomers(sourceUrl)
];
const results = await Promise.all(promises);
```

### Memory Management
```javascript
// Stream large datasets to avoid memory issues
const stream = createReadStream('large-dataset.json');
const parser = JSONStream.parse('*');
stream.pipe(parser).on('data', processItem);
```

## 🛡️ Security & Ethics

### Legal Compliance
- **Terms of Service**: Always check website terms
- **Robots.txt**: Respect robots.txt directives
- **Rate Limiting**: Don't overwhelm servers
- **Data Privacy**: Handle sensitive data appropriately

### Best Practices
```javascript
const ethicalConfig = {
    respectRobotsTxt: true,
    rateLimit: 1000, // 1 second delay
    userAgent: 'EHB-GOSELLER-Bot/1.0',
    maxRequests: 1000, // Limit total requests
    timeout: 30000 // 30 second timeout
};
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```bash
   # Increase timeout in configuration
   config.timeout = 60000; // 60 seconds
   ```

2. **Rate Limiting**
   ```bash
   # Add longer delays between requests
   config.delay = 2000; // 2 seconds
   ```

3. **JavaScript Rendering**
   ```bash
   # Enable JavaScript rendering
   config.renderJavaScript = true;
   ```

4. **Authentication Required**
   ```bash
   # Add authentication headers
   config.headers = {
       'Authorization': 'Bearer your-token'
   };
   ```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm run clone:universal

# Save debug logs to file
DEBUG=* npm run clone:universal > debug.log 2>&1
```

## 📋 Use Cases

### 1. Ecommerce Migration
```bash
# Clone entire ecommerce store
npm run clone:universal
# Enter: https://old-store.com
# Select: products,categories,customers,orders
```

### 2. Product Catalog Import
```bash
# Import only product data
npm run clone:universal -- --data-types=products
```

### 3. Content Migration
```bash
# Migrate blog content
npm run clone:universal -- --data-types=pages
```

### 4. Asset Extraction
```bash
# Download website assets
npm run clone:universal -- --data-types=assets
```

## 🎯 Advanced Features

### AI-Powered Extraction
```javascript
// Use AI to identify product patterns
const aiExtractor = {
    useAI: true,
    model: 'gpt-4',
    patterns: ['product', 'item', 'goods']
};
```

### Multi-Language Support
```javascript
// Extract content in multiple languages
const languageConfig = {
    languages: ['en', 'es', 'fr', 'de'],
    detectLanguage: true,
    translateContent: true
};
```

### Real-time Monitoring
```javascript
// Monitor cloning progress
const monitor = {
    progress: (percent) => console.log(`${percent}% complete`),
    error: (error) => console.error('Error:', error),
    success: (data) => console.log('Success:', data)
};
```

## 📊 Data Output Formats

### JSON Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "https://example.com",
  "data": {
    "products": [...],
    "categories": [...],
    "customers": [...],
    "orders": [...]
  }
}
```

### CSV Format
```csv
product_name,price,description,category
Product 1,99.99,Description 1,Category A
Product 2,149.99,Description 2,Category B
```

### Database Import
```sql
INSERT INTO products (name, price, description)
VALUES ('Product 1', 99.99, 'Description 1');
```

## 🔄 Integration with EHB-GOSELLER

### Automatic Import
```bash
# Clone and import automatically
npm run clone:universal -- --auto-import
```

### Manual Import
```bash
# Clone first, then import
npm run clone:universal
npm run import:products
npm run import:customers
```

### Scheduled Cloning
```javascript
// Set up scheduled cloning
const schedule = require('node-cron');
schedule.schedule('0 2 * * *', () => {
    // Clone website daily at 2 AM
    runUniversalCloner();
});
```

## 📞 Support

For technical support:
- Check the troubleshooting section
- Review error logs in `/logs`
- Contact the development team
- Create an issue in the repository

---

**Note**: Always ensure you have proper authorization before cloning website data. Respect the terms of service and privacy policies of the source websites.
