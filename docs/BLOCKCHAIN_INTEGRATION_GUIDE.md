# ⛓️ Blockchain Integration Guide

## 📋 Overview

This guide covers the complete blockchain integration system for GoSellr, including smart contracts, wallet integration, NFT marketplace, and decentralized features.

## 🎯 What You'll Get

### **✅ Complete Blockchain System**
- **Smart Contracts**: ERC-20 token, marketplace, NFT collection, staking, governance
- **Wallet Integration**: MetaMask, WalletConnect support
- **Blockchain Components**: React components for blockchain functionality
- **API Routes**: RESTful APIs for blockchain operations
- **Dashboard**: Interactive blockchain dashboard

### **✅ Smart Contracts**
- **GoSellrToken**: ERC-20 token with minting and burning
- **GoSellrMarketplace**: Decentralized exchange for products/services
- **GoSellrNFT**: NFT collection with metadata
- **GoSellrStaking**: Staking rewards system
- **GoSellrGovernance**: DAO governance system

### **✅ Wallet Features**
- **Multi-wallet Support**: MetaMask, WalletConnect, Coinbase Wallet
- **Transaction Management**: Send, receive, track transactions
- **Balance Tracking**: Real-time token and ETH balances
- **Network Switching**: Support for multiple networks

## 🚀 Quick Start

### **Step 1: Setup Blockchain System**
```bash
cd services/EHB-GOSELLER
npm run setup:blockchain
```

### **Step 2: Deploy Smart Contracts**
```bash
cd contracts
npx hardhat compile
npx hardhat deploy --network mainnet
```

### **Step 3: Start Development**
```bash
cd gosellr-nextjs
npm run dev
```

### **Step 4: Access Blockchain Dashboard**
Open [http://localhost:3000/blockchain-dashboard](http://localhost:3000/blockchain-dashboard)

## 📜 Smart Contracts

### **1. GoSellrToken (ERC-20)**
```solidity
contract GoSellrToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18;
    uint256 public constant MAX_SUPPLY = 2000000000 * 10**18;

    mapping(address => bool) public authorizedMinters;

    function mint(address to, uint256 amount) external onlyMinter;
    function burn(uint256 amount) external;
}
```

**Features:**
- 1 billion initial supply
- 2 billion maximum supply
- Minting and burning capabilities
- Pausable functionality
- Authorized minter system

### **2. GoSellrMarketplace (DEX)**
```solidity
contract GoSellrMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
        uint256 createdAt;
        string metadata;
    }

    function createListing(uint256 price, string memory metadata) external;
    function createOrder(uint256 listingId) external nonReentrant;
    function completeOrder(uint256 orderId) external;
}
```

**Features:**
- Decentralized product/service listings
- Secure order processing
- Platform fee system
- Metadata support
- Reentrancy protection

### **3. GoSellrNFT (NFT Collection)**
```solidity
contract GoSellrNFT is ERC721, Ownable {
    string public baseURI;
    uint256 public maxSupply;
    uint256 public mintPrice;

    function mint() external payable;
    function setBaseURI(string memory _baseURI) external onlyOwner;
}
```

**Features:**
- ERC-721 standard compliance
- Metadata URI support
- Minting with payment
- Supply control
- Royalty system

## 💼 Wallet Integration

### **1. Wallet Service**
```typescript
export class WalletService {
  async connectWallet(): Promise<WalletInfo>;
  async disconnectWallet(): Promise<void>;
  async sendTransaction(to: string, amount: string): Promise<Transaction>;
  async signMessage(message: string): Promise<string>;
  async getTransactionHistory(address: string): Promise<Transaction[]>;
}
```

**Features:**
- MetaMask integration
- Transaction signing
- Message signing
- Balance tracking
- Transaction history

### **2. Wallet Provider (React Context)**
```typescript
interface WalletContextType {
  walletInfo: WalletInfo | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<any>;
}
```

**Features:**
- React context for wallet state
- Automatic connection management
- Error handling
- Loading states

### **3. Wallet Connect Component**
```typescript
export const WalletConnect: React.FC<WalletConnectProps> = ({ className }) => {
  const { walletInfo, isConnected, connect, disconnect } = useWallet();

  // Connect/disconnect functionality
  // Address display
  // Balance display
};
```

**Features:**
- One-click wallet connection
- Address formatting
- Balance display
- Connection status

## 📦 Blockchain Components

### **1. TokenBalance Component**
```typescript
interface TokenBalanceProps {
  tokenAddress: string;
  symbol: string;
  decimals: number;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({
  tokenAddress,
  symbol,
  decimals
}) => {
  // Display token balance
  // Real-time updates
  // Transfer functionality
};
```

### **2. TransactionHistory Component**
```typescript
interface TransactionHistoryProps {
  address: string;
  limit?: number;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  address,
  limit = 10
}) => {
  // Display transaction list
  // Transaction details
  // Status indicators
};
```

### **3. NFTGallery Component**
```typescript
interface NFTGalleryProps {
  address?: string;
  collection?: string;
}

export const NFTGallery: React.FC<NFTGalleryProps> = ({
  address,
  collection
}) => {
  // Display NFT grid
  // NFT details
  // Trading functionality
};
```

## 🔌 Blockchain APIs

### **1. Blockchain Info API (`/api/blockchain/info`)**
```typescript
GET /api/blockchain/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "network": "Ethereum Mainnet",
    "chainId": 1,
    "blockHeight": 18500000,
    "gasPrice": "25 Gwei",
    "totalSupply": "1,000,000,000 GSLR",
    "marketCap": "$50,000,000",
    "price": "$0.05"
  }
}
```

### **2. NFT API (`/api/blockchain/nfts`)**
```typescript
GET /api/blockchain/nfts?address=0x123...&collection=GoSellr
POST /api/blockchain/nfts
```

**Features:**
- NFT listing
- NFT creation
- Collection filtering
- Metadata management

### **3. Staking API (`/api/blockchain/staking`)**
```typescript
GET /api/blockchain/staking?address=0x123...
POST /api/blockchain/staking/stake
POST /api/blockchain/staking/unstake
```

**Features:**
- Staking positions
- Reward calculation
- Stake/unstake operations
- APY tracking

## 🖼️ NFT Marketplace

### **1. NFT Creation**
```typescript
const createNFT = async (metadata: NFTMetadata) => {
  const response = await fetch('/api/blockchain/nfts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata)
  });
  return response.json();
};
```

### **2. NFT Trading**
```typescript
const listNFT = async (tokenId: string, price: string) => {
  // List NFT for sale
};

const buyNFT = async (listingId: string) => {
  // Purchase NFT
};
```

### **3. NFT Gallery**
- Grid display of NFTs
- Filtering by collection
- Search functionality
- Trading interface

## 🔒 Staking System

### **1. Staking Interface**
```typescript
interface StakingInterfaceProps {
  tokenAddress: string;
  stakingAddress: string;
}

export const StakingInterface: React.FC<StakingInterfaceProps> = ({
  tokenAddress,
  stakingAddress
}) => {
  // Staking form
  // Unstaking form
  // Reward display
  // APY calculation
};
```

### **2. Staking Features**
- Token staking
- Reward distribution
- APY calculation
- Unstaking with cooldown
- Emergency withdrawal

## 🗳️ Governance System

### **1. Proposal Creation**
```typescript
const createProposal = async (proposal: GovernanceProposal) => {
  // Create governance proposal
};
```

### **2. Voting System**
```typescript
const vote = async (proposalId: string, support: boolean) => {
  // Vote on proposal
};
```

### **3. Execution**
```typescript
const executeProposal = async (proposalId: string) => {
  // Execute approved proposal
};
```

## 📊 Blockchain Dashboard

### **Dashboard Features:**
- **Overview Tab**: Network stats, token info, market data
- **Wallet Tab**: Balance, transactions, wallet management
- **NFTs Tab**: NFT gallery, creation, trading
- **Staking Tab**: Staking interface, rewards, APY
- **Governance Tab**: Proposals, voting, execution

### **Interactive Elements:**
- Real-time blockchain data
- Transaction status tracking
- Wallet connection management
- NFT trading interface
- Staking operations

## 🚀 Deployment

### **1. Smart Contract Deployment**
```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat deploy --network goerli

# Deploy to mainnet
npx hardhat deploy --network mainnet
```

### **2. Environment Configuration**
```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/...
NEXT_PUBLIC_CHAIN_ID=1
```

### **3. Production Setup**
- Contract verification on Etherscan
- Multi-network support
- Gas optimization
- Security audits

## 🔧 Configuration

### **1. Network Configuration**
```typescript
const networks = {
  mainnet: {
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/...',
    explorer: 'https://etherscan.io'
  },
  polygon: {
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com'
  }
};
```

### **2. Contract Addresses**
```typescript
const contracts = {
  token: '0x...',
  marketplace: '0x...',
  nft: '0x...',
  staking: '0x...',
  governance: '0x...'
};
```

### **3. Wallet Configuration**
```typescript
const walletConfig = {
  supportedChains: [1, 137, 56],
  defaultChain: 1,
  rpcUrls: {
    1: 'https://mainnet.infura.io/v3/...',
    137: 'https://polygon-rpc.com'
  }
};
```

## 🔍 Testing

### **1. Smart Contract Tests**
```bash
npm run test:contracts
```

### **2. Integration Tests**
```bash
npm run test:blockchain
```

### **3. Frontend Tests**
```bash
npm run test:components
```

## 🆘 Troubleshooting

### **Common Issues:**
1. **Wallet connection fails**: Check MetaMask installation and network
2. **Transaction fails**: Verify gas settings and balance
3. **Contract calls fail**: Check contract addresses and ABI
4. **Network issues**: Verify RPC URL and chain ID

### **Debug Tools:**
- Etherscan for transaction tracking
- Hardhat console for contract interaction
- MetaMask developer tools
- Network monitoring

## 🎯 Next Steps

### **Phase 1: Basic Blockchain (Week 1)**
1. ✅ Smart contract development
2. ✅ Wallet integration
3. ✅ Basic blockchain dashboard
4. ✅ Token functionality

### **Phase 2: Advanced Features (Week 2)**
1. 🔄 NFT marketplace
2. 🔄 Staking system
3. 🔄 Governance implementation
4. 🔄 Multi-chain support

### **Phase 3: Production Ready (Week 3)**
1. 🔄 Security audits
2. 🔄 Gas optimization
3. 🔄 Contract verification
4. 🔄 Production deployment

### **Phase 4: Ecosystem Expansion (Week 4)**
1. 🔄 DeFi integrations
2. 🔄 Cross-chain bridges
3. 🔄 Advanced governance
4. 🔄 DAO implementation

---

**🎉 Your Blockchain Integration System is now ready!**

Start building decentralized applications with smart contracts, wallet integration, and NFT marketplace functionality.
