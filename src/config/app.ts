import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if(!value) {
        throw new Error(`Variável de ambiente obrigatória não encontrada: ${key}`);
    }
    return value;
};

export const config = {
    server: {
        port: parseInt(process.env.PORT || '3000'),
        nodeEnv: process.env.NODE_ENV || 'development'
    },
    blockchain: {
        rpcUrl: getRequiredEnv('RPC_URL'),
        chainId: parseInt(getRequiredEnv('CHAIN_ID')),
        addressDiscoveryAddress: getRequiredEnv('ADDRESS_DISCOVERY_ADDRESS') as `0x${string}` 
    }
};

export const createChain = () => ({
  id: config.blockchain.chainId,
  name: config.blockchain.chainId === 1337 ? 'Hardhat Local' : 
        config.blockchain.chainId === 31337 ? 'Hardhat Alternative' : 
        'Custom Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { 
    default: { http: [config.blockchain.rpcUrl] } 
  }
});

console.log('Configurações carregadas:', {
    port: config.server.port,
    network: config.blockchain.chainId === 1337 ? 'Hardhat Local' : 'Outra rede',
    addressDiscoveryAddress: config.blockchain.addressDiscoveryAddress
})