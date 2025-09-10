// services/AccessChannelManagerService.ts
import { keccak256, toHex } from 'viem';
import { BlockchainService } from './base/blockchainService';
import { AddressDiscoveryService } from './addressDiscoveryService';
import { IACCESS_CHANNEL_MANAGER_ABI } from '../config/abis/IAccessChannelManager';
import { ApiResponse } from '../types/apiTypes';
import { ChannelInfo } from '../types/apiTypes';
import { ContractErrorHandler } from '../errors/contractErrorHandler';

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
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'criar canal');
            
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
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'ativar canal');

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
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'desativar canal');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    //Adicionar membro ao canal
    async addChannelMember(channelName: string, memberAddress: string, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Adicionando membro ${memberAddress} ao canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);

            const txHash = await contract.write.addChannelMember([
                channelHash, 
                memberAddress as `0x${string}`
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    channelName,
                    memberAddress,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Membro adicionado com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'adicionar membro');
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }
    
    //Remover membro do canal
    async removeChannelMember(channelName: string, memberAddress: string, privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Removendo membro ${memberAddress} do canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);

            const txHash = await contract.write.removeChannelMember([
                channelHash, 
                memberAddress as `0x${string}`
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    channelName,
                    memberAddress,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: 'Membro removido com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'remover membro');
                        
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    //Adicionar membros ao canal
    async addChannelMembers(channelName: string, memberAddresses: string[], privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Adicionando ${memberAddresses.length} membros ao canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);

            // Converter array de strings para array de addresses
            const addresses = memberAddresses.map(addr => addr as `0x${string}`);

            const txHash = await contract.write.addChannelMembers([
                channelHash, 
                addresses
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    channelName,
                    memberAddresses,
                    addedCount: memberAddresses.length,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: `${memberAddresses.length} membros adicionados com sucesso`
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'adicionar membros');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Remover membros do canal
    async removeChannelMembers(channelName: string, memberAddresses: string[], privateKey: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Removendo ${memberAddresses.length} membros do canal: ${channelName}`);

            await this.ensureContractAddress();

            const contract = this.getWriteContract(privateKey);
            const channelHash = this.stringToBytes32(channelName);

            // Converter array de strings para array de addresses
            const addresses = memberAddresses.map(addr => addr as `0x${string}`);

            const txHash = await contract.write.removeChannelMembers([
                channelHash, 
                addresses
            ]) as any;
            
            console.log(`Transação enviada: ${txHash}`);
            
            const receipt = await this.waitForTransaction(txHash);

            return {
                success: true,
                data: {
                    channelName,
                    memberAddresses,
                    removedCount: memberAddresses.length,
                    transactionHash: txHash,
                    blockNumber: receipt.blockNumber?.toString(),
                    gasUsed: receipt.gasUsed?.toString(),
                    message: `${memberAddresses.length} membros removidos com sucesso`
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'remover membros');
                                    
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Verificar se um membro é membro do canal
    async isChannelMember(channelName: string, memberAddress: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Verificando se ${memberAddress} é membro do canal: ${channelName}`);

            await this.ensureContractAddress();
            
            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);

            const isMember = await contract.read.isChannelMember([
                channelHash, 
                memberAddress as `0x${string}`
            ]) as any;

            console.log(`Status de membro: ${isMember}`);

            return {
                success: true,
                data: {
                    channelName,
                    memberAddress,
                    isMember: Boolean(isMember),
                    message: `${memberAddress} ${Boolean(isMember) ? 'é' : 'não é'} membro do canal '${channelName}'`
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'verificar membro');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Obter membros do canal
    async getChannelMembersPaginated(channelName: string, page: number, pageSize: number): Promise<ApiResponse<any>> {
        try {
            console.log(`Buscando membros do canal ${channelName} - página ${page}, tamanho ${pageSize}`);

            await this.ensureContractAddress();
            
            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);

            const result = await contract.read.getChannelMembersPaginated([
                channelHash, 
                page, 
                pageSize
            ]) as any;
            
            const [members, totalMembers, totalPages, hasNextPage] = result;

            console.log(`Encontrados ${members.length} membros na página ${page}`);

            return {
                success: true,
                data: {
                    channelName,
                    members: members.map((addr: any) => addr as string),
                    totalMembers: Number(totalMembers),
                    totalPages: Number(totalPages),
                    hasNextPage: Boolean(hasNextPage),
                    currentPage: page,
                    pageSize: pageSize,
                    message: 'Membros obtidos com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter membros paginados');
            
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
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'buscar informações do canal');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Obter total de canais
    async getChannelCount(): Promise<ApiResponse<any>> {
        try {
            console.log('Buscando total de canais');

            await this.ensureContractAddress();
            
            const contract = this.getReadContract();

            const totalChannels = await contract.read.getChannelCount([]) as any;

            console.log(`Total de canais: ${totalChannels}`);

            return {
                success: true,
                data: {
                    totalChannels: Number(totalChannels),
                    message: 'Total de canais obtido com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter total de canais');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Obter canais paginados
    async getAllChannelsPaginated(page: number, pageSize: number): Promise<ApiResponse<any>> {
        try {
            console.log(`Buscando canais - página ${page}, tamanho ${pageSize}`);

            await this.ensureContractAddress();
            
            const contract = this.getReadContract();

            const result = await contract.read.getAllChannelsPaginated([page, pageSize]) as any;
            const [channels, totalChannels, totalPages, hasNextPage] = result;

            console.log(`Encontrados ${channels.length} canais na página ${page}`);

            return {
                success: true,
                data: {
                    channels: channels.map((hash: any) => hash as string),
                    totalChannels: Number(totalChannels),
                    totalPages: Number(totalPages),
                    hasNextPage: Boolean(hasNextPage),
                    currentPage: page,
                    pageSize: pageSize,
                    message: 'Canais obtidos com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter canais paginados');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Obter total de membros
    async getChannelMemberCount(channelName: string): Promise<ApiResponse<any>> {
        try {
            console.log(`Buscando total de membros do canal: ${channelName}`);

            await this.ensureContractAddress();
            
            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);

            const memberCount = await contract.read.getChannelMemberCount([channelHash]) as any;

            console.log(`Canal ${channelName} tem ${memberCount} membros`);

            return {
                success: true,
                data: {
                    channelName,
                    memberCount: Number(memberCount),
                    message: 'Total de membros obtido com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'obter total de membros');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }

    // Verificar múltiplos membros
    async areChannelMembers(channelName: string, memberAddresses: string[]): Promise<ApiResponse<any>> {
        try {
            console.log(`Verificando ${memberAddresses.length} membros do canal: ${channelName}`);

            await this.ensureContractAddress();
            
            const contract = this.getReadContract();
            const channelHash = this.stringToBytes32(channelName);
            const addresses = memberAddresses.map(addr => addr as `0x${string}`);

            const results = await contract.read.areChannelMembers([channelHash, addresses]) as any;

            const memberStatus = memberAddresses.map((address, index) => ({
                address,
                isMember: Boolean(results[index])
            }));

            console.log(`Verificação completa para ${memberAddresses.length} endereços`);

            return {
                success: true,
                data: {
                    channelName,
                    memberStatus,
                    totalChecked: memberAddresses.length,
                    message: 'Status de membros verificado com sucesso'
                }
            };

        } catch (error) {
            const contractError = ContractErrorHandler.handleContractError(error as Error);
            const errorInfo = contractError || this.handleBlockchainError(error, 'verificar múltiplos membros');
            
            return {
                success: false,
                error: errorInfo.message
            };
        }
    }
}