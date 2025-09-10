export interface ErrorResult {
    type: string;
    message: string;
}

export class ContractErrorHandler {
    
    /**
     * Handle errors from AccessChannelManager contract
     */
    static handleChannelManagerError(error: Error): ErrorResult | null {
        if (!(error instanceof Error)) return null;

        const message = error.message;

        if (message.includes('0x45c908fa')) {
            return { type: 'CHANNEL_ALREADY_EXISTS', message: 'Canal já existe com esse nome' };
        }
        if (message.includes('0x33344045')) {
            return { type: 'CHANNEL_DOES_NOT_EXIST', message: 'Canal não existe' };
        }
        if (message.includes('0x2e54ecf4')) {
            return { type: 'CHANNEL_ALREADY_ACTIVE', message: 'Canal já está ativo' };
        }
        if (message.includes('0x13b8c48c')) {
            return { type: 'CHANNEL_ALREADY_DEACTIVATED', message: 'Canal já está desativado' };
        }
        if (message.includes('0x357f102a')) {
            return { type: 'CHANNEL_NOT_ACTIVE', message: 'Canal não está ativo' };
        }
        if (message.includes('0xf112a7ea')) {
            return { type: 'MEMBER_ALREADY_IN_CHANNEL', message: 'Membro já está no canal' };
        }
        if (message.includes('0x75f30fdd')) {
            return { type: 'MEMBER_NOT_IN_CHANNEL', message: 'Membro não está no canal' };
        }
        if (message.includes('0x6c7a64a9')) {
            return { type: 'CHANNEL_MEMBER_LIMIT_EXCEEDED', message: 'Limite de membros do canal excedido' };
        }
        if (message.includes('0x1f2a2005')) {
            return { type: 'EMPTY_MEMBER_ARRAY', message: 'Array de membros não pode estar vazio' };
        }
        if (message.includes('0x3ec6f93e')) {
            return { type: 'BATCH_SIZE_EXCEEDED', message: 'Tamanho do lote excedido' };
        }
        if (message.includes('0x38e4b7aa')) {
            return { type: 'INVALID_PAGE_NUMBER', message: 'Número da página inválido' };
        }
        if (message.includes('0x6f15cc97')) {
            return { type: 'INVALID_PAGE_SIZE', message: 'Tamanho da página inválido' };
        }

        return null;
    }

    /**
     * Handle errors from SchemaRegistry contract
     */
    static handleSchemaRegistryError(error: Error): ErrorResult | null {
        if (!(error instanceof Error)) return null;

        const message = error.message;

        if (message.includes('SchemaAlreadyExistsCannotRecreate')) {
            return { type: 'SCHEMA_ALREADY_EXISTS', message: 'Schema já existe e não pode ser recriado' };
        }
        if (message.includes('InvalidSchemaId')) {
            return { type: 'INVALID_SCHEMA_ID', message: 'ID do schema é inválido' };
        }
        if (message.includes('InvalidSchemaName')) {
            return { type: 'INVALID_SCHEMA_NAME', message: 'Nome do schema é inválido' };
        }
        if (message.includes('DescriptionTooLong')) {
            return { type: 'DESCRIPTION_TOO_LONG', message: 'Descrição muito longa' };
        }
        if (message.includes('SchemaNotFoundInChannel')) {
            return { type: 'SCHEMA_NOT_FOUND', message: 'Schema não encontrado no canal' };
        }
        if (message.includes('SchemaVersionNotFoundInChannel')) {
            return { type: 'SCHEMA_VERSION_NOT_FOUND', message: 'Versão do schema não encontrada' };
        }
        if (message.includes('SchemaNotActive')) {
            return { type: 'SCHEMA_NOT_ACTIVE', message: 'Schema não está ativo' };
        }
        if (message.includes('NoActiveSchemaVersion')) {
            return { type: 'SCHEMA_NOT_ACTIVE', message: 'Schema não está ativo' };
        }
        if (message.includes('NotSchemaOwner')) {
            return { type: 'NOT_SCHEMA_OWNER', message: 'Não é o proprietário do schema' };
        }
        if (message.includes('InvalidStatusTransition')) {
            return { type: 'INVALID_STATUS_TRANSITION', message: 'Transição de status inválida' };
        }

        return null;
    }

    /**
     * Handle errors from ProcessRegistry contract
     */
    static handleProcessRegistryError(error: Error): ErrorResult | null {
        if (!(error instanceof Error)) return null;

        const message = error.message;

        if (message.includes('InvalidProcessId')) {
            return { type: 'INVALID_PROCESS_ID', message: 'ID do processo é inválido' };
        }
        if (message.includes('InvalidNatureId')) {
            return { type: 'INVALID_NATURE_ID', message: 'ID da natureza é inválido' };
        }
        if (message.includes('InvalidStageId')) {
            return { type: 'INVALID_STAGE_ID', message: 'ID do estágio é inválido' };
        }
        if (message.includes('ProcessAlreadyExists')) {
            return { type: 'PROCESS_ALREADY_EXISTS', message: 'Processo já existe com essas características' };
        }
        if (message.includes('ProcessNotFound')) {
            return { type: 'PROCESS_NOT_FOUND', message: 'Processo não encontrado' };
        }
        if (message.includes('ProcessAlreadyInactive')) {
            return { type: 'PROCESS_ALREADY_INACTIVE', message: 'Processo já está inativo' };
        }
        if (message.includes('NotProcessOwner')) {
            return { type: 'NOT_PROCESS_OWNER', message: 'Não é o proprietário do processo' };
        }
        if (message.includes('SchemasRequiredForAction')) {
            return { type: 'SCHEMAS_REQUIRED_FOR_ACTION', message: 'Schemas são obrigatórios para esta ação' };
        }
        if (message.includes('DuplicateSchemaInList')) {
            return { type: 'DUPLICATE_SCHEMA_IN_LIST', message: 'Schema duplicado na lista' };
        }
        if (message.includes('SchemaNotActiveInChannel')) {
            return { type: 'SCHEMA_NOT_ACTIVE_IN_CHANNEL', message: 'Schema não está ativo no canal' };
        }
        if (message.includes('SchemaNotFoundInChannel')) {
            return { type: 'SCHEMA_NOT_FOUND_IN_CHANNEL', message: 'Schema não encontrado no canal' };
        }
        if (message.includes('InvalidProcessStatusTransition')) {
            return { type: 'INVALID_PROCESS_STATUS_TRANSITION', message: 'Transição de status de processo inválida' };
        }

        return null;
    }

    /**
     * Handle errors from AssetRegistry contract
     */
    static handleAssetRegistryError(error: Error): ErrorResult | null {
        if (!(error instanceof Error)) return null;

        const message = error.message;

        // Asset existence and state errors
        if (message.includes('InvalidAssetId')) {
            return { type: 'INVALID_ASSET_ID', message: 'ID do asset é inválido' };
        }
        if (message.includes('AssetNotFound')) {
            return { type: 'ASSET_NOT_FOUND', message: 'Asset não encontrado' };
        }
        if (message.includes('AssetNotActive')) {
            return { type: 'ASSET_NOT_ACTIVE', message: 'Asset não está ativo' };
        }
        if (message.includes('AssetAlreadyExists')) {
            return { type: 'ASSET_ALREADY_EXISTS', message: 'Asset já existe' };
        }

        // Ownership and permissions
        if (message.includes('NotAssetOwner')) {
            return { type: 'NOT_ASSET_OWNER', message: 'Não é o proprietário do asset' };
        }
        if (message.includes('OnlyTransactionOrchestrator')) {
            return { type: 'ONLY_TRANSACTION_ORCHESTRATOR', message: 'Apenas o TransactionOrchestrator pode executar esta operação' };
        }

        // Transfer errors
        if (message.includes('TransferToSameOwner')) {
            return { type: 'TRANSFER_TO_SAME_OWNER', message: 'Não é possível transferir para o mesmo proprietário' };
        }

        // Location and data validation
        if (message.includes('EmptyLocation')) {
            return { type: 'EMPTY_LOCATION', message: 'Localização não pode estar vazia' };
        }

        // Split operation errors
        if (message.includes('EmptyAmountsArray')) {
            return { type: 'EMPTY_AMOUNTS_ARRAY', message: 'Array de quantidades não pode estar vazio' };
        }
        if (message.includes('ArrayLengthMismatch')) {
            return { type: 'ARRAY_LENGTH_MISMATCH', message: 'Arrays têm tamanhos diferentes' };
        }
        if (message.includes('InvalidSplitAmount')) {
            return { type: 'INVALID_SPLIT_AMOUNT', message: 'Quantidade para divisão é inválida' };
        }
        if (message.includes('SplitAmountTooSmall')) {
            return { type: 'SPLIT_AMOUNT_TOO_SMALL', message: 'Quantidade muito pequena para divisão' };
        }
        if (message.includes('AmountConservationViolated')) {
            return { type: 'AMOUNT_CONSERVATION_VIOLATED', message: 'Conservação de quantidade violada na divisão' };
        }
        if (message.includes('InsufficientSplitParts')) {
            return { type: 'INSUFFICIENT_SPLIT_PARTS', message: 'Número insuficiente de partes para divisão' };
        }

        // Group operation errors
        if (message.includes('InvalidGroupAmount')) {
            return { type: 'INVALID_GROUP_AMOUNT', message: 'Quantidade do grupo é inválida' };
        }
        if (message.includes('InsufficientAssetsToGroup')) {
            return { type: 'INSUFFICIENT_ASSETS_TO_GROUP', message: 'Número insuficiente de assets para agrupar' };
        }
        if (message.includes('GroupAssetAlreadyExists')) {
            return { type: 'GROUP_ASSET_ALREADY_EXISTS', message: 'Asset do grupo já existe' };
        }
        if (message.includes('DuplicateAssetsInGroup')) {
            return { type: 'DUPLICATE_ASSETS_IN_GROUP', message: 'Assets duplicados no grupo' };
        }
        if (message.includes('SelfReferenceInGroup')) {
            return { type: 'SELF_REFERENCE_IN_GROUP', message: 'Asset não pode referenciar a si mesmo no grupo' };
        }
        if (message.includes('MixedOwnershipNotAllowed')) {
            return { type: 'MIXED_OWNERSHIP_NOT_ALLOWED', message: 'Não é permitido agrupar assets de proprietários diferentes' };
        }
        if (message.includes('AssetNotGrouped')) {
            return { type: 'ASSET_NOT_GROUPED', message: 'Asset não está agrupado' };
        }
        if (message.includes('AssetAlreadyUngrouped')) {
            return { type: 'ASSET_ALREADY_UNGROUPED', message: 'Asset já foi desagrupado' };
        }
        if (message.includes('TooManyAssetsForDuplicateCheck')) {
            return { type: 'TOO_MANY_ASSETS_FOR_DUPLICATE_CHECK', message: 'Muitos assets para verificação de duplicatas' };
        }

        // Transformation errors
        if (message.includes('TransformationChainTooDeep')) {
            return { type: 'TRANSFORMATION_CHAIN_TOO_DEEP', message: 'Cadeia de transformação muito profunda' };
        }

        return null;
    }

    /**
     * Handle common access control errors
     */
    static handleAccessControlError(error: Error): ErrorResult | null {
        if (!(error instanceof Error)) return null;

        const message = error.message;

        if (message.includes('0xe6c4247b')) {
            return { type: 'INVALID_ADDRESS_ERROR', message: 'Endereço inválido fornecido' };
        }
        if (message.includes('0xe2517d3f')) {
            return { type: 'ACCESS_CONTROL_INVALID_ACCOUNT', message: 'Carteira inválida para executar essa transação' };
        }

        return null;
    }

    /**
     * Try to handle any contract error by testing all handlers
     */
    static handleContractError(error: Error): ErrorResult | null {
        if (!(error instanceof Error)) return null;

        return (
            this.handleChannelManagerError(error) ||
            this.handleSchemaRegistryError(error) ||
            this.handleProcessRegistryError(error) ||
            this.handleAssetRegistryError(error) ||
            this.handleAccessControlError(error)
        );
    }
}