#!/usr/bin/env node

const BlockchainIntegrationSystem = require('./blockchain-integration-system');

async function runBlockchainSystem() {
    console.log('⛓️ Starting Blockchain Integration System Setup');
    console.log('==============================================');

    try {
        const blockchainSystem = new BlockchainIntegrationSystem();
        await blockchainSystem.initialize();

        console.log('\n🎉 Blockchain System setup completed successfully!');
        console.log('\n📋 What was created:');
        console.log('✅ Smart Contracts (GoSellrToken, Marketplace, NFT)');
        console.log('✅ Wallet Integration (MetaMask, WalletConnect)');
        console.log('✅ Blockchain Components (WalletConnect, TokenBalance)');
        console.log('✅ Blockchain APIs (/api/blockchain/*)');
        console.log('✅ Blockchain Dashboard (/blockchain-dashboard)');
        console.log('✅ NFT Marketplace Integration');
        console.log('✅ Staking & Governance Contracts');

        console.log('\n🔧 Available Features:');
        console.log('- ERC-20 Token (GSLR)');
        console.log('- Decentralized Marketplace');
        console.log('- NFT Creation & Trading');
        console.log('- Wallet Connection & Management');
        console.log('- Transaction History');
        console.log('- Staking Interface');
        console.log('- Governance System');

        console.log('\n🚀 Next Steps:');
        console.log('1. Deploy smart contracts to Ethereum');
        console.log('2. Configure wallet providers');
        console.log('3. Test blockchain functionality');
        console.log('4. Integrate with your marketplace');

        console.log('\n📜 Smart Contracts:');
        console.log('- GoSellrToken.sol (ERC-20 Token)');
        console.log('- GoSellrMarketplace.sol (DEX)');
        console.log('- GoSellrNFT.sol (NFT Collection)');
        console.log('- GoSellrStaking.sol (Staking)');
        console.log('- GoSellrGovernance.sol (DAO)');

    } catch (error) {
        console.error('❌ Blockchain System setup failed:', error.message);
        process.exit(1);
    }
}

runBlockchainSystem();
