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

            // Erros do AccessChannelManager por signature
            if (error.message.includes('0x45c908fa')) {
                return { type: 'CHANNEL_ALREADY_EXISTS', message: 'Canal já existe com esse nome' };
            }
            if (error.message.includes('0x33344045')) {
                return { type: 'CHANNEL_DOES_NOT_EXIST', message: 'Canal não existe' };
            }
            if (error.message.includes('0x2e54ecf4')) {
                return { type: 'CHANNEL_ALREADY_ACTIVE', message: 'Canal já está ativo' };
            }
            if (error.message.includes('0x13b8c48c')) {
                return { type: 'CHANNEL_ALREADY_DEACTIVATED', message: 'Canal já está desativado' };
            }
            if (error.message.includes('0x357f102a')) {
                return { type: 'CHANNEL_NOT_ACTIVE', message: 'Canal não está ativo' };
            }
            if (error.message.includes('0xf112a7ea')) {
                return { type: 'MEMBER_ALREADY_IN_CHANNEL', message: 'Membro já está no canal' };
            }
            if (error.message.includes('0x75f30fdd')) {
                return { type: 'MEMBER_NOT_IN_CHANNEL', message: 'Membro não está no canal' };
            }
            if (error.message.includes('0x6c7a64a9')) {
                return { type: 'CHANNEL_MEMBER_LIMIT_EXCEEDED', message: 'Limite de membros do canal excedido' };
            }
            if (error.message.includes('0x1f2a2005')) {
                return { type: 'EMPTY_MEMBER_ARRAY', message: 'Array de membros não pode estar vazio' };
            }
            if (error.message.includes('0x3ec6f93e')) {
                return { type: 'BATCH_SIZE_EXCEEDED', message: 'Tamanho do lote excedido' };
            }
            if (error.message.includes('0x38e4b7aa')) {
                return { type: 'INVALID_PAGE_NUMBER', message: 'Número da página inválido' };
            }
            if (error.message.includes('0x6f15cc97')) {
                return { type: 'INVALID_PAGE_SIZE', message: 'Tamanho da página inválido' };
            }
            if (error.message.includes('0xe6c4247b')) {
                return { type: 'INVALID_ADDRESS_ERROR', message: 'Endereço inválido fornecido' };
            }
            if (error.message.includes('0xe2517d3f')) {
                return { type: 'ACCESS_CONTROL_INVALID_ACCOUNT', message: 'Carteira inválida para executar essa transação' };
            }

            // Erros do Schema
            if (error.message.includes('SchemaAlreadyExistsCannotRecreate')) {
                return { type: 'SCHEMA_ALREADY_EXISTS', message: 'Schema já existe e não pode ser recriado' };
            }
            if (error.message.includes('InvalidSchemaId')) {
                return { type: 'INVALID_SCHEMA_ID', message: 'ID do schema é inválido' };
            }
            if (error.message.includes('InvalidSchemaName')) {
                return { type: 'INVALID_SCHEMA_NAME', message: 'Nome do schema é inválido' };
            }
            if (error.message.includes('DescriptionTooLong')) {
                return { type: 'DESCRIPTION_TOO_LONG', message: 'Descrição muito longa' };
            }
            if (error.message.includes('SchemaNotFoundInChannel')) {
                return { type: 'SCHEMA_NOT_FOUND', message: 'Schema não encontrado no canal' };
            }
            if (error.message.includes('SchemaVersionNotFoundInChannel')) {
                return { type: 'SCHEMA_VERSION_NOT_FOUND', message: 'Versão do schema não encontrada' };
            }
            if (error.message.includes('SchemaNotActive')) {
                return { type: 'SCHEMA_NOT_ACTIVE', message: 'Schema não está ativo' };
            }
            if (error.message.includes('NoActiveSchemaVersion')) {
                return { type: 'SCHEMA_NOT_ACTIVE', message: 'Schema não está ativo' };
            }
            if (error.message.includes('NotSchemaOwner')) {
                return { type: 'NOT_SCHEMA_OWNER', message: 'Não é o proprietário do schema' };
            }
            if (error.message.includes('InvalidStatusTransition')) {
                return { type: 'INVALID_STATUS_TRANSITION', message: 'Transição de status inválida' };
            }

            // Erros de Process
            if (error.message.includes('InvalidProcessId')) {
                return { type: 'INVALID_PROCESS_ID', message: 'ID do processo é inválido' };
            }
            if (error.message.includes('InvalidNatureId')) {
                return { type: 'INVALID_NATURE_ID', message: 'ID da natureza é inválido' };
            }
            if (error.message.includes('InvalidStageId')) {
                return { type: 'INVALID_STAGE_ID', message: 'ID do estágio é inválido' };
            }
            if (error.message.includes('ProcessAlreadyExists')) {
                return { type: 'PROCESS_ALREADY_EXISTS', message: 'Processo já existe com essas características' };
            }
            if (error.message.includes('ProcessNotFound')) {
                return { type: 'PROCESS_NOT_FOUND', message: 'Processo não encontrado' };
            }
            if (error.message.includes('ProcessAlreadyInactive')) {
                return { type: 'PROCESS_ALREADY_INACTIVE', message: 'Processo já está inativo' };
            }
            if (error.message.includes('NotProcessOwner')) {
                return { type: 'NOT_PROCESS_OWNER', message: 'Não é o proprietário do processo' };
            }
            if (error.message.includes('SchemasRequiredForAction')) {
                return { type: 'SCHEMAS_REQUIRED_FOR_ACTION', message: 'Schemas são obrigatórios para esta ação' };
            }
            if (error.message.includes('DuplicateSchemaInList')) {
                return { type: 'DUPLICATE_SCHEMA_IN_LIST', message: 'Schema duplicado na lista' };
            }
            if (error.message.includes('SchemaNotActiveInChannel')) {
                return { type: 'SCHEMA_NOT_ACTIVE_IN_CHANNEL', message: 'Schema não está ativo no canal' };
            }
            if (error.message.includes('SchemaNotFoundInChannel')) {
                return { type: 'SCHEMA_NOT_FOUND_IN_CHANNEL', message: 'Schema não encontrado no canal' };
            }
            if (error.message.includes('InvalidProcessStatusTransition')) {
                return { type: 'INVALID_PROCESS_STATUS_TRANSITION', message: 'Transição de status de processo inválida' };
            }
        }

        return { 
            type: 'BLOCKCHAIN_ERROR', 
            message: `Erro em ${operation}: ${error instanceof Error ? error.message : error}` 
        };
    }
}