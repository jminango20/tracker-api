import { TransactionRequest } from '../types/transactionOrchestratorTypes';

export class TransactionRequestValidator {
    
    static validateByAction(action: string, request: TransactionRequest): { isValid: boolean; error?: string } {
        switch (action) {
            case 'CREATE_ASSET':
                return this.validateCreateAsset(request);
            
            case 'UPDATE_ASSET':
                return this.validateUpdateAsset(request);
            
            case 'TRANSFER_ASSET':
                return this.validateTransferAsset(request);
            
            case 'SPLIT_ASSET':
                return this.validateSplitAsset(request);
            
            case 'GROUP_ASSET':
                return this.validateGroupAsset(request);
            
            case 'UNGROUP_ASSET':
                return this.validateUngroupAsset(request);
            
            case 'TRANSFORM_ASSET':
                return this.validateTransformAsset(request);
            
            case 'INACTIVATE_ASSET':
                return this.validateInactivateAsset(request);
            
            case 'CREATE_DOCUMENT':
                return this.validateCreateDocument(request);
            
            default:
                return { isValid: false, error: `Action '${action}' não suportada` };
        }
    }

    // Validações específicas por action
    static validateCreateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length > 0) {
            return { isValid: false, error: 'CREATE_ASSET não deve ter targetAssetIds' };
        }
        
        if (!request.operationData.amount || request.operationData.amount <= 0) {
            return { isValid: false, error: 'Campo amount é obrigatório para CREATE_ASSET' };
        }
        
        if (!request.operationData.idLocal) {
            return { isValid: false, error: 'Campo idLocal é obrigatório para CREATE_ASSET' };
        }
        
        if (!request.operationData.dataHash) {
            return { isValid: false, error: 'Campo dataHash é obrigatório para CREATE_ASSET' };
        }
        
        return { isValid: true };
    }

    static validateUpdateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'UPDATE_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        // Pelo menos um campo deve estar presente para update
        const hasNewIdLocal = request.operationData.newIdLocal && request.operationData.newIdLocal.trim().length > 0;
        const hasNewAmount = request.operationData.newAmount && request.operationData.newAmount > 0;
        const hasNewDataHash = request.operationData.newDataHash && request.operationData.newDataHash.trim().length > 0;
        
        if (!hasNewIdLocal && !hasNewAmount && !hasNewDataHash) {
            return { isValid: false, error: 'UPDATE_ASSET deve ter pelo menos newIdLocal, newAmount ou newDataHash' };
        }
        
        return { isValid: true };
    }

    static validateTransferAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'TRANSFER_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.newOwner) {
            return { isValid: false, error: 'Campo newOwner é obrigatório para TRANSFER_ASSET' };
        }
        
        // Validar formato de endereço Ethereum
        if (!/^0x[a-fA-F0-9]{40}$/.test(request.operationData.newOwner)) {
            return { isValid: false, error: 'newOwner deve ser um endereço Ethereum válido' };
        }
        
        if (!request.operationData.newIdLocal) {
            return { isValid: false, error: 'Campo newIdLocal é obrigatório para TRANSFER_ASSET' };
        }
        
        return { isValid: true };
    }

    static validateTransformAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'TRANSFORM_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.newAssetId) {
            return { isValid: false, error: 'Campo newAssetId é obrigatório para TRANSFORM_ASSET' };
        }
        
        // Validar que newAssetId é diferente do asset original
        if (request.targetAssetIds[0] === request.operationData.newAssetId) {
            return { isValid: false, error: 'newAssetId deve ser diferente do assetId original' };
        }
                
        // newAmount é opcional - se não fornecido ou 0, herda do original
        if (request.operationData.newAmount && request.operationData.newAmount < 0) {
            return { isValid: false, error: 'Campo newAmount deve ser maior ou igual a 0' };
        }
        
        return { isValid: true };
    }

    static validateSplitAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'SPLIT_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.amounts || request.operationData.amounts.length < 2) {
            return { isValid: false, error: 'Campo amounts deve ter pelo menos 2 valores para SPLIT_ASSET' };
        }
        
        for (let i = 0; i < request.operationData.amounts.length; i++) {
            if (request.operationData.amounts[i] <= 0) {
                return { isValid: false, error: `Amount ${i + 1} deve ser maior que zero` };
            }
        }
            
        return { isValid: true };
    }

    static validateGroupAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length < 2) {
            return { isValid: false, error: 'GROUP_ASSET deve ter pelo menos 2 targetAssetIds' };
        }
        
        if (!request.operationData.newIdLocal) {
            return { isValid: false, error: 'Campo newIdLocal é obrigatório para GROUP_ASSET' };
        }
        
        // Validar que não há assetIds duplicados
        const uniqueAssetIds = new Set(request.targetAssetIds);
        if (uniqueAssetIds.size !== request.targetAssetIds.length) {
            return { isValid: false, error: 'GROUP_ASSET não pode ter assetIds duplicados' };
        }
        
        // Validar que todos os assetIds são válidos (não vazios)
        for (let i = 0; i < request.targetAssetIds.length; i++) {
            if (!request.targetAssetIds[i] || request.targetAssetIds[i].trim().length === 0) {
                return { isValid: false, error: `AssetId ${i + 1} não pode estar vazio` };
            }
        }
                
        return { isValid: true };
    }

    static validateUngroupAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'UNGROUP_ASSET deve ter exatamente 1 targetAssetId (grupo)' };
        }
        
        if (!request.targetAssetIds[0] || request.targetAssetIds[0].trim().length === 0) {
            return { isValid: false, error: 'AssetId do grupo não pode estar vazio' };
        }
                
        return { isValid: true };
    }

    static validateInactivateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'INACTIVATE_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.targetAssetIds[0] || request.targetAssetIds[0].trim().length === 0) {
            return { isValid: false, error: 'AssetId não pode estar vazio' };
        }
                
        return { isValid: true };
    }

    //TODO
    static validateCreateDocument(request: TransactionRequest): { isValid: boolean; error?: string } {        
        return { isValid: true };
    }
}