import { getContract, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { publicClient } from '../../config/blockchain';
import { config, createChain } from '../../config/app';

export abstract class BlockchainService {
    protected abstract contractAddress: `0x${string}`;
    protected abstract contractAbi: any[];

    protected getReadContract() {
        return getContract({
            address: this.contractAddress,
            abi: this.contractAbi,
            client: publicClient
        });
    }

    protected getWalletClient(privateKey: string) {
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        
        return createWalletClient({
            account,
            chain: createChain(),
            transport: http(config.blockchain.rpcUrl)
        });
    }

    protected getWriteContract(privateKey: string) {
        const walletClient = this.getWalletClient(privateKey);
        
        return getContract({
            address: this.contractAddress,
            abi: this.contractAbi,
            client: walletClient
        });
    }

    protected async waitForTransaction(txHash: `0x${string}`) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        console.log(`Transação confirmada no bloco: ${receipt.blockNumber}`);
        return receipt;
    }

    protected handleBlockchainError(error: any, operation: string) {
        console.error(`Erro em ${operation}:`, error instanceof Error ? error.message : error);

        if (error instanceof Error) {
            if (error.message.includes('ContractNotRegistered')) {
                return { type: 'CONTRACT_NOT_REGISTERED', message: 'Contrato não está registrado' };
            }
            if (error.message.includes('InvalidAddress')) {
                return { type: 'INVALID_ADDRESS', message: 'Endereço fornecido é inválido' };
            }
            if (error.message.includes('rejected')) {
                return { type: 'TRANSACTION_REJECTED', message: 'Transação rejeitada pelo usuário' };
            }
        }

        return { 
            type: 'UNKNOWN_ERROR', 
            message: `Erro em ${operation}: ${error instanceof Error ? error.message : error}` 
        };
    }
}