// services/AccessChannelManagerService.ts
import { keccak256, toHex } from 'viem';
import { BlockchainService } from './base/blockchainService';
import { AddressDiscoveryService } from './addressDiscoveryService';
import { IACCESS_CHANNEL_MANAGER_ABI } from '../config/abis/IAccessChannelManager';
import { ApiResponse } from '../types/apiTypes';
import { ChannelInfo } from '../types/apiTypes';


export class AccessChannelManagerService extends BlockchainService {

    private addressDiscoveryService: AddressDiscoveryService;
    private cachedContractAddress: `0x${string}` | null = null;
    
    protected contractAddress: `0x${string}` = '0x0000000000000000000000000000000000000000';
    protected contractAbi = [...IACCESS_CHANNEL_MANAGER_ABI];

    constructor() {
        super();
        this.addressDiscoveryService = new AddressDiscoveryService();
    }

    private async ensureContractAddress(): Promise<void> {
        if (this.cachedContractAddress) {
            return;
        }

        const result = await this.addressDiscoveryService.getAddress('ACCESS_CHANNEL_MANAGER');
        
        if (!result.success || !result.data?.addressContract) {
            throw new Error('AccessChannelManager não encontrado no AddressDiscovery');
        }

        this.cachedContractAddress = result.data.addressContract as `0x${string}`;
        this.contractAddress = this.cachedContractAddress;
    }

    private stringToBytes32(str: string): `0x${string}` {
        return keccak256(toHex(str));
    }

    public clearAddressCache(): void {
        this.cachedContractAddress = null;
    }

    //Criar canal    
    async createChannel(channelName: string, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Criando canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);

            const txHash = await contract.write.createChannel([channelHash]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    channelName,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Canal criado com sucesso'
                }
            };

        } catch (error) {
            const errorInfo = this.handleBlockchainError(error, 'criar canal');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    //Ativar canal
    async activateChannel(channelName: string, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Ativando canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);

            const txHash = await contract.write.activateChannel([channelHash]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    channelName,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Canal ativado com sucesso'
                }
            };

        } catch (error) {
            const errorInfo = this.handleBlockchainError(error, 'ativar canal');

            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    //Desativar canal
    async deactivateChannel(channelName: string, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Desativando canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);

            const txHash = await contract.write.desactivateChannel([channelHash]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    channelName,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Canal desativado com sucesso'
                }
            };
            
        } catch (error) {
            const errorInfo = this.handleBlockchainError(error, 'desativar canal');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    //Buscar informações do canal
    async getChannelInfo(channelName: string): Promise<ApiResponse<ChannelInfo>> {
        try {
            console.log(`Buscando informações do canal: ${channelName}`);

            await this.ensureContractAddress();
            
            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);

            const result = await contract.read.getChannelInfo([channelHash]) as any;
            const [exists, isActive, creator, memberCount, createdAt] = result;

            return {
                success: true,
                data: {
                    channelName,
                    exists: Boolean(exists),
                    isActive: Boolean(isActive),
                    creator: creator as string,
                    memberCount: Number(memberCount),
                    createdAt: createdAt.toString(),
                }
            };

        } catch (error) {
            const errorInfo = this.handleBlockchainError(error, 'buscar informações do canal');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }
}