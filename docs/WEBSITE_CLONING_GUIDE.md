# 🌐 Website Cloning & Data Integration Guide

## 📋 Overview

EHB-GOSELLER provides comprehensive tools for cloning website data and integrating it into the ecommerce platform. This guide explains how to clone any website's data and import it into the EHB system.

## 🚀 Quick Start

### 1. Basic Website Cloning

```bash
# Navigate to EHB-GOSELLER directory
cd services/EHB-GOSELLER

# Run the website cloner
npm run clone:website
```

### 2. Interactive Cloning Process

The cloning process will ask you for:
- **Source Website URL**: The website you want to clone
- **Data Types**: What data to extract (products, customers, orders, categories)
- **Batch Size**: How many items to process at once
- **Overwrite**: Whether to overwrite existing data

## 🛠️ Supported Data Types

### 📦 Products
- Product names and descriptions
- Prices and inventory levels
- Product images and variants
- Categories and tags
- Product specifications

### 👥 Customers
- Customer profiles and contact information
- Purchase history
- Addresses and shipping preferences
- Customer reviews and ratings

### 🛒 Orders
- Order details and line items
- Payment information
- Shipping and delivery data
- Order status and tracking

### 📂 Categories
- Product categories and subcategories
- Category descriptions and images
- Hierarchical category structure

## 🔧 Advanced Configuration

### Custom Data Extraction

```javascript
const WebsiteDataMigrator = require('./scripts/data-migration');

const migrator = new WebsiteDataMigrator();

// Custom configuration
const config = {
    dataTypes: ['products', 'customers'],
    batchSize: 50,
    overwrite: false,
    customFields: {
        products: ['name', 'price', 'description'],
        customers: ['email', 'name', 'phone']
    }
};

await migrator.cloneWebsiteData('https://example.com', config);
```

### API-Based Extraction

For websites with APIs, you can create custom extractors:

```javascript
// Custom product extractor
async extractProductsFromAPI(sourceUrl) {
    const response = await axios.get(`${sourceUrl}/api/products`);
    return response.data.map(product => ({
        name: product.title,
        description: product.description,
        price: product.price,
        category_id: product.category,
        inventory: product.stock,
        images: product.images
    }));
}
```

## 📊 Data Transformation

### Product Data Mapping

| Source Field | EHB-GOSELLER Field | Description |
|--------------|-------------------|-------------|
| `title` | `name` | Product name |
| `description` | `description` | Product description |
| `price` | `price` | Product price |
| `stock` | `inventory` | Available quantity |
| `images` | `images` | Product images array |
| `category` | `category_id` | Category reference |

### Customer Data Mapping

| Source Field | EHB-GOSELLER Field | Description |
|--------------|-------------------|-------------|
| `email` | `email` | Customer email |
| `name` | `name` | Customer name |
| `phone` | `phone` | Contact number |
| `address` | `address` | Shipping address |

## 🔄 Migration Workflow

### Step 1: Data Extraction
```bash
# Extract data from source website
npm run migrate:data -- --extract-only
```

### Step 2: Data Validation
```bash
# Validate extracted data
npm run migrate:data -- --validate
```

### Step 3: Data Import
```bash
# Import validated data
npm run migrate:data -- --import-only
```

## 🛡️ Security Considerations

### Data Privacy
- Ensure you have permission to clone website data
- Respect robots.txt and rate limiting
- Handle sensitive customer data appropriately
- Comply with data protection regulations

### Rate Limiting
```javascript
// Configure rate limiting for API calls
const config = {
    rateLimit: {
        requests: 100,
        window: 60000 // 1 minute
    }
};
```

## 📈 Performance Optimization

### Batch Processing
```javascript
// Process data in batches
const batchSize = 100;
for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await processBatch(batch);
}
```

### Parallel Processing
```javascript
// Process multiple data types in parallel
const promises = [
    extractProducts(sourceUrl),
    extractCustomers(sourceUrl),
    extractOrders(sourceUrl)
];
const results = await Promise.all(promises);
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```bash
   # Increase timeout in configuration
   config.timeout = 30000; // 30 seconds
   ```

2. **Rate Limiting**
   ```bash
   # Add delays between requests
   config.delay = 1000; // 1 second delay
   ```

3. **Data Format Issues**
   ```bash
   # Enable detailed logging
   config.verbose = true;
   ```

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run clone:website
```

## 📋 Best Practices

### 1. Data Validation
- Always validate extracted data before import
- Check for required fields and data types
- Handle missing or corrupted data gracefully

### 2. Incremental Updates
- Use timestamps to track last update
- Only import new or changed data
- Maintain data integrity during updates

### 3. Backup Strategy
- Create backups before major imports
- Test migration on staging environment
- Keep rollback procedures ready

### 4. Monitoring
- Monitor migration progress
- Log all operations for audit
- Set up alerts for failures

## 🎯 Use Cases

### Ecommerce Migration
```bash
# Clone entire ecommerce store
npm run clone:website
# Enter: https://old-store.com
# Select: products,customers,orders,categories
```

### Product Catalog Import
```bash
# Import only products
npm run import:products -- --source=https://catalog.com
```

### Customer Data Migration
```bash
# Import customer data
npm run import:customers -- --source=https://old-system.com
```

## 📞 Support

For technical support:
- Check the troubleshooting section
- Review error logs in `/logs`
- Contact the development team
- Create an issue in the repository

---

**Note**: Always ensure you have proper authorization before cloning website data. Respect the terms of service and privacy policies of the source websites.
