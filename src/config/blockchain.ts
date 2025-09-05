import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { config } from './app';

export const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(config.blockchain.rpcUrl),
});

export async function checkConnection(): Promise<boolean> {
    try {
        const blockNumber = await publicClient.getBlockNumber();
        console.log(`Conectado ao blockchain - Bloco: ${blockNumber}`);
        return true;
    } catch (error) {
        console.error('Erro na conexão:', error);
        return false;
    }
}