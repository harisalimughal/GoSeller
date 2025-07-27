#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class GoSellrNextJSSetup {
    constructor() {
        this.projectName = 'gosellr-nextjs';
        this.projectPath = path.join(process.cwd(), this.projectName);
    }

    /**
     * Complete Next.js project setup for GoSellr
     */
    async setupCompleteProject() {
        console.log('🚀 Setting up GoSellr Next.js project...');

        try {
            // 1. Create project directory
            await this.createProjectDirectory();

            // 2. Initialize Next.js project
            await this.initializeNextJS();

            // 3. Install dependencies
            await this.installDependencies();

            // 4. Create project structure
            await this.createProjectStructure();

            // 5. Generate components from platform data
            await this.generateComponents();

            // 6. Generate pages
            await this.generatePages();

            // 7. Generate API routes
            await this.generateAPIRoutes();

            // 8. Generate blockchain integration
            await this.generateBlockchainIntegration();

            // 9. Generate configuration files
            await this.generateConfigFiles();

            // 10. Generate sample data
            await this.generateSampleData();

            // 11. Create deployment configuration
            await this.createDeploymentConfig();

            console.log('✅ GoSellr Next.js project setup completed successfully!');
            console.log('📁 Project created at:', this.projectPath);
            console.log('🚀 To start development:');
            console.log(`   cd ${this.projectName}`);
            console.log('   npm run dev');

        } catch (error) {
            console.error('❌ Project setup failed:', error.message);
            throw error;
        }
    }

    /**
     * Create project directory
     */
    async createProjectDirectory() {
        console.log('📁 Creating project directory...');
        await fs.mkdir(this.projectPath, { recursive: true });
        process.chdir(this.projectPath);
    }

    /**
     * Initialize Next.js project
     */
    async initializeNextJS() {
        console.log('⚛️ Initializing Next.js project...');

        try {
            execSync('npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes', {
                stdio: 'inherit'
            });
        } catch (error) {
            console.log('⚠️ Next.js initialization failed, creating manually...');
            await this.createNextJSManually();
        }
    }

    /**
     * Create Next.js project manually
     */
    async createNextJSManually() {
        const packageJson = {
            name: this.projectName,
            version: "0.1.0",
            private: true,
            scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint"
            },
            dependencies: {
                next: "14.0.0",
                react: "18.2.0",
                react-dom: "18.2.0",
                typescript: "5.0.0",
                "@types/node": "20.0.0",
                "@types/react": "18.0.0",
                "@types/react-dom": "18.0.0",
                "ethers": "6.0.0",
                "axios": "1.6.0",
                "tailwindcss": "3.3.0",
                "autoprefixer": "10.4.0",
                "postcss": "8.4.0"
            },
            devDependencies: {
                "eslint": "8.0.0",
                "eslint-config-next": "14.0.0"
            }
        };

        await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    }

    /**
     * Install dependencies
     */
    async installDependencies() {
        console.log('📦 Installing dependencies...');

        try {
            execSync('npm install', { stdio: 'inherit' });
        } catch (error) {
            console.log('⚠️ npm install failed, continuing...');
        }
    }

    /**
     * Create project structure
     */
    async createProjectStructure() {
        console.log('🏗️ Creating project structure...');

        const directories = [
            'src/components',
            'src/pages',
            'src/styles',
            'src/utils',
            'src/hooks',
            'src/context',
            'src/services',
            'src/types',
            'src/lib',
            'public/images',
            'public/icons',
            'public/data',
            'docs',
            'scripts'
        ];

        for (const dir of directories) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Generate React components
     */
    async generateComponents() {
        console.log('📦 Generating React components...');

        const components = [
            this.createProductCard(),
            this.createServiceCard(),
            this.createNFTCard(),
            this.createStoreCard(),
            this.createCartComponent(),
            this.createSearchComponent(),
            this.createFilterComponent(),
            this.createPaginationComponent(),
            this.createHeader(),
            this.createFooter(),
            this.createSidebar()
        ];

        for (const component of components) {
            await fs.writeFile(
                `src/components/${component.name}.tsx`,
                component.code
            );
        }
    }

    /**
     * Create ProductCard component
     */
    createProductCard() {
        return {
            name: 'ProductCard',
            code: `'use client';

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  rating?: number;
  reviews?: number;
  platform: string;
  category: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
          {product.platform}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-green-600">
            {product.price}
          </span>
          {product.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600">
                {product.rating} ({product.reviews})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
          <button
            onClick={() => addToCart(product)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-medium"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
`
        };
    }

    /**
     * Create ServiceCard component
     */
    createServiceCard() {
        return {
            name: 'ServiceCard',
            code: `'use client';

import React from 'react';
import Image from 'next/image';

interface Service {
  id: string;
  name: string;
  provider: string;
  price: string;
  rating?: number;
  image: string;
  category: string;
  platform: string;
  description?: string;
}

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
          {service.platform}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {service.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3">
          by <span className="font-medium">{service.provider}</span>
        </p>

        {service.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {service.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-purple-600">
            {service.price}
          </span>
          {service.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-600">
                {service.rating}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {service.category}
          </span>
          <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors font-medium">
            Book Service
          </button>
        </div>
      </div>
    </div>
  );
};
`
        };
    }

    /**
     * Create NFTCard component
     */
    createNFTCard() {
        return {
            name: 'NFTCard',
            code: `'use client';

import React from 'react';
import Image from 'next/image';

interface NFT {
  id: string;
  name: string;
  collection?: string;
  price: string;
  creator: string;
  image: string;
  platform: string;
  description?: string;
}

interface NFTCardProps {
  nft: NFT;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={nft.image}
          alt={nft.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
          {nft.platform}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {nft.name}
        </h3>

        {nft.collection && (
          <p className="text-sm text-gray-600 mb-2">
            Collection: <span className="font-medium">{nft.collection}</span>
          </p>
        )}

        <p className="text-sm text-gray-600 mb-3">
          Creator: <span className="font-medium">{nft.creator}</span>
        </p>

        {nft.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {nft.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">
            {nft.price}
          </span>
          <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors font-medium">
            Buy NFT
          </button>
        </div>
      </div>
    </div>
  );
};
`
        };
    }

    /**
     * Generate pages
     */
    async generatePages() {
        console.log('📄 Generating Next.js pages...');

        const pages = [
            this.createHomePage(),
            this.createProductsPage(),
            this.createServicesPage(),
            this.createNFTsPage(),
            this.createCartPage(),
            this.createSearchPage(),
            this.createAboutPage(),
            this.createContactPage()
        ];

        for (const page of pages) {
            await fs.writeFile(
                `src/app/${page.name}/page.tsx`,
                page.code
            );
        }
    }

    /**
     * Create Home page
     */
    createHomePage() {
        return {
            name: '',
            code: `import React from 'react';
import { ProductCard } from '@/components/ProductCard';
import { ServiceCard } from '@/components/ServiceCard';
import { NFTCard } from '@/components/NFTCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              GoSellr
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              World's First AI + Blockchain Powered Marketplace
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Connect with verified products and services using decentralized supply chain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Shopping
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product cards will be rendered here */}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Featured Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service cards will be rendered here */}
          </div>
        </div>
      </section>

      {/* Featured NFTs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Featured NFTs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* NFT cards will be rendered here */}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
`
        };
    }

    /**
     * Generate API routes
     */
    async generateAPIRoutes() {
        console.log('🔌 Generating API routes...');

        const apiRoutes = [
            this.createProductsAPI(),
            this.createServicesAPI(),
            this.createNFTsAPI(),
            this.createCartAPI(),
            this.createSearchAPI()
        ];

        for (const route of apiRoutes) {
            await fs.mkdir(`src/app/api/${route.name}`, { recursive: true });
            await fs.writeFile(
                `src/app/api/${route.name}/route.ts`,
                route.code
            );
        }
    }

    /**
     * Create Products API
     */
    createProductsAPI() {
        return {
            name: 'products',
            code: `import { NextRequest, NextResponse } from 'next/server';

// Mock data from platform extraction
const products = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    price: "$999",
    image: "/images/iphone.jpg",
    rating: 4.8,
    reviews: 1250,
    platform: "Amazon",
    category: "Electronics",
    description: "Latest iPhone with advanced features"
  },
  {
    id: "2",
    name: "Nike Air Max",
    price: "$129",
    image: "/images/nike.jpg",
    rating: 4.6,
    reviews: 890,
    platform: "eBay",
    category: "Fashion",
    description: "Comfortable running shoes"
  },
  {
    id: "3",
    name: "MacBook Pro",
    price: "$1999",
    image: "/images/macbook.jpg",
    rating: 4.9,
    reviews: 2100,
    platform: "Amazon",
    category: "Electronics",
    description: "Professional laptop for developers"
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const platform = searchParams.get('platform');
  const search = searchParams.get('search');

  let filteredProducts = products;

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  if (platform) {
    filteredProducts = filteredProducts.filter(p => p.platform === platform);
  }

  if (search) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    data: filteredProducts,
    total: filteredProducts.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Here you would save to database
    const newProduct = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
`
        };
    }

    /**
     * Generate blockchain integration
     */
    async generateBlockchainIntegration() {
        console.log('⛓️ Generating blockchain integration...');

        const blockchainFiles = [
            this.createSmartContract(),
            this.createWalletIntegration(),
            this.createTransactionHandler()
        ];

        for (const file of blockchainFiles) {
            await fs.writeFile(
                `src/lib/blockchain/${file.name}.ts`,
                file.code
            );
        }
    }

    /**
     * Create smart contract integration
     */
    createSmartContract() {
        return {
            name: 'gosellr-contract',
            code: `'use client';

import { ethers } from 'ethers';

export class GoSellrContract {
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  // Connect wallet
  async connectWallet() {
    try {
      if (!this.provider) {
        throw new Error('No provider available');
      }

      await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
      return true;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      return false;
    }
  }

  // Get wallet address
  async getAddress() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }

  // Create order with blockchain payment
  async createOrder(orderData: {
    seller: string;
    productId: string;
    amount: string;
  }) {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const order = {
        buyer: await this.signer.getAddress(),
        seller: orderData.seller,
        productId: orderData.productId,
        amount: ethers.parseEther(orderData.amount),
        timestamp: Date.now()
      };

      // Here you would interact with your smart contract
      // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.signer);
      // const tx = await contract.createOrder(order);
      // await tx.wait();

      return {
        success: true,
        orderId: Date.now().toString(),
        transactionHash: '0x...' // Mock transaction hash
      };
    } catch (error) {
      console.error('Order creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's NFT collection
  async getUserNFTs(address: string) {
    try {
      // Mock NFT data from OpenSea/Binance
      return [
        {
          name: "GoSellr Badge #1",
          collection: "GoSellr Collection",
          image: "/images/nft1.jpg",
          tokenId: "1"
        }
      ];
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      return [];
    }
  }

  // Verify seller identity
  async verifySeller(sellerAddress: string) {
    try {
      if (!this.provider) {
        throw new Error('No provider available');
      }

      // Check if seller has required tokens/NFTs
      const balance = await this.provider.getBalance(sellerAddress);
      const hasRequiredBalance = balance >= ethers.parseEther("0.1");

      return {
        verified: hasRequiredBalance,
        balance: ethers.formatEther(balance)
      };
    } catch (error) {
      console.error('Seller verification failed:', error);
      return { verified: false, error: error.message };
    }
  }
}

export const gosellrContract = new GoSellrContract();
`
        };
    }

    /**
     * Generate configuration files
     */
    async generateConfigFiles() {
        console.log('⚙️ Generating configuration files...');

        const configFiles = [
            this.createNextConfig(),
            this.createTailwindConfig(),
            this.createTypeScriptConfig(),
            this.createESLintConfig(),
            this.createPostCSSConfig()
        ];

        for (const file of configFiles) {
            await fs.writeFile(file.name, file.code);
        }
    }

    /**
     * Create Next.js config
     */
    createNextConfig() {
        return {
            name: 'next.config.js',
            code: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'picsum.photos'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
`
        };
    }

    /**
     * Create Tailwind config
     */
    createTailwindConfig() {
        return {
            name: 'tailwind.config.ts',
            code: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
`
        };
    }

    /**
     * Generate sample data
     */
    async generateSampleData() {
        console.log('📊 Generating sample data...');

        const sampleData = {
            products: [
                {
                    id: "1",
                    name: "iPhone 15 Pro",
                    price: "$999",
                    image: "https://picsum.photos/400/300?random=1",
                    rating: 4.8,
                    reviews: 1250,
                    platform: "Amazon",
                    category: "Electronics",
                    description: "Latest iPhone with advanced features"
                },
                {
                    id: "2",
                    name: "Nike Air Max",
                    price: "$129",
                    image: "https://picsum.photos/400/300?random=2",
                    rating: 4.6,
                    reviews: 890,
                    platform: "eBay",
                    category: "Fashion",
                    description: "Comfortable running shoes"
                }
            ],
            services: [
                {
                    id: "1",
                    name: "Logo Design",
                    provider: "DesignMaster",
                    price: "$50",
                    rating: 4.9,
                    image: "https://picsum.photos/400/300?random=3",
                    category: "Graphics & Design",
                    platform: "Fiverr",
                    description: "Professional logo design service"
                }
            ],
            nfts: [
                {
                    id: "1",
                    name: "GoSellr Badge #1",
                    collection: "GoSellr Collection",
                    price: "0.1 ETH",
                    creator: "GoSellr Team",
                    image: "https://picsum.photos/400/300?random=4",
                    platform: "OpenSea",
                    description: "Exclusive GoSellr badge NFT"
                }
            ]
        };

        await fs.writeFile(
            'public/data/sample-data.json',
            JSON.stringify(sampleData, null, 2)
        );
    }

    /**
     * Create deployment configuration
     */
    async createDeploymentConfig() {
        console.log('🚀 Creating deployment configuration...');

        const vercelConfig = {
            name: 'vercel.json',
            code: `{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}`
        };

        await fs.writeFile(vercelConfig.name, vercelConfig.code);
    }
}

// Run the setup
if (require.main === module) {
    const setup = new GoSellrNextJSSetup();
    setup.setupCompleteProject().catch(console.error);
}

module.exports = GoSellrNextJSSetup;
