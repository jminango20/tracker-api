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
        
        if (!request.operationData.initialAmount || request.operationData.initialAmount <= 0) {
            return { isValid: false, error: 'initialAmount é obrigatório para CREATE_ASSET' };
        }
        
        if (!request.operationData.initialLocation) {
            return { isValid: false, error: 'initialLocation é obrigatório para CREATE_ASSET' };
        }
        
        if (!request.dataHash) {
            return { isValid: false, error: 'dataHash é obrigatório para CREATE_ASSET' };
        }
        
        return { isValid: true };
    }

    static validateUpdateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'UPDATE_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.newLocation && !request.operationData.newAmount && !request.dataHash) {
            return { isValid: false, error: 'UPDATE_ASSET deve ter pelo menos newLocation, newAmount ou dataHash' };
        }
        
        return { isValid: true };
    }

    static validateTransferAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'TRANSFER_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.targetOwner) {
            return { isValid: false, error: 'targetOwner é obrigatório para TRANSFER_ASSET' };
        }
        
        return { isValid: true };
    }

    static validateSplitAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'SPLIT_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.splitAmounts || request.operationData.splitAmounts.length < 2) {
            return { isValid: false, error: 'splitAmounts deve ter pelo menos 2 valores para SPLIT_ASSET' };
        }
        
        if (!request.dataHashes || request.dataHashes.length !== request.operationData.splitAmounts.length) {
            return { isValid: false, error: 'dataHashes deve ter o mesmo tamanho que splitAmounts' };
        }
        
        return { isValid: true };
    }

    static validateGroupAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length < 2) {
            return { isValid: false, error: 'GROUP_ASSET deve ter pelo menos 2 targetAssetIds' };
        }
        
        return { isValid: true };
    }

    static validateUngroupAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'UNGROUP_ASSET deve ter exatamente 1 targetAssetId (grupo)' };
        }
        
        return { isValid: true };
    }

    static validateTransformAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'TRANSFORM_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        if (!request.operationData.newAssetId) {
            return { isValid: false, error: 'newAssetId é obrigatório para TRANSFORM_ASSET' };
        }
        
        return { isValid: true };
    }

    static validateInactivateAsset(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length !== 1) {
            return { isValid: false, error: 'INACTIVATE_ASSET deve ter exatamente 1 targetAssetId' };
        }
        
        return { isValid: true };
    }

    static validateCreateDocument(request: TransactionRequest): { isValid: boolean; error?: string } {
        if (request.targetAssetIds.length > 0) {
            return { isValid: false, error: 'CREATE_DOCUMENT não deve ter targetAssetIds' };
        }
        
        if (!request.dataHash) {
            return { isValid: false, error: 'dataHash é obrigatório para CREATE_DOCUMENT' };
        }
        
        return { isValid: true };
    }
}