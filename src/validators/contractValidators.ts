export class ContractValidators {
    static validateContractName(contractName: any) {
        if (!contractName || typeof contractName !== 'string') {
            return {
                isValid: false,
                error: 'Nome do contrato é obrigatório e deve ser uma string'
            };
        }

        if (contractName.trim().length === 0) {
            return {
                isValid: false,
                error: 'Nome do contrato não pode estar vazio'
            };
        }

        return { isValid: true };
    }

    static validateAddress(address: any) {
        if (!address || typeof address !== 'string') {
            return {
                isValid: false,
                error: 'Endereço é obrigatório e deve ser uma string'
            };
        }

        if (!address.startsWith('0x') || address.length !== 42) {
            return {
                isValid: false,
                error: 'Endereço inválido. Deve ter formato 0x... com 42 caracteres'
            };
        }

        return { isValid: true };
    }

    static validatePrivateKey(privateKey: any) {
        if (!privateKey || typeof privateKey !== 'string') {
            return {
                isValid: false,
                error: 'Private key é obrigatória'
            };
        }

        if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
            return {
                isValid: false,
                error: 'Private key deve ter formato 0x... com 66 caracteres'
            };
        }

        return { isValid: true };
    }

    static validateAddressArray(addresses: any) {
        if (!Array.isArray(addresses)) {
            return {
                isValid: false,
                error: 'Lista de endereços deve ser um array'
            };
        }

        if (addresses.length === 0) {
            return {
                isValid: false,
                error: 'Lista de endereços não pode estar vazia'
            };
        }

        if (addresses.length > 50) {
            return {
                isValid: false,
                error: 'Máximo de 50 endereços por operação'
            };
        }

        for (let i = 0; i < addresses.length; i++) {
            const addressValidation = this.validateAddress(addresses[i]);
            if (!addressValidation.isValid) {
                return {
                    isValid: false,
                    error: `Endereço na posição ${i + 1} é inválido: ${addresses[i]}`
                };
            }
        }

        return { isValid: true };
    }

    static validatePagination(page: any, pageSize: any) {
        if (!page || isNaN(page) || parseInt(page) < 1) {
            return {
                isValid: false,
                error: 'Página deve ser um número maior que 0'
            };
        }

        if (!pageSize || isNaN(pageSize) || parseInt(pageSize) < 1 || parseInt(pageSize) > 100) {
            return {
                isValid: false,
                error: 'Tamanho da página deve ser entre 1 e 100'
            };
        }

        return { 
            isValid: true,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        };
    }

    // Validation for Schemas
    static validateSchemaId(schemaId: any) {
    if (!schemaId || typeof schemaId !== 'string') {
        return {
            isValid: false,
            error: 'ID do schema é obrigatório e deve ser uma string'
        };
    }

    if (schemaId.trim().length === 0) {
        return {
            isValid: false,
            error: 'ID do schema não pode estar vazio'
        };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(schemaId)) {
        return {
            isValid: false,
            error: 'ID do schema deve conter apenas letras, números, underscore e hífen'
        };
    }

    return { isValid: true };
    }

    static validateSchemaName(schemaName: any) {
        if (!schemaName || typeof schemaName !== 'string') {
            return {
                isValid: false,
                error: 'Nome do schema é obrigatório e deve ser uma string'
            };
        }

        if (schemaName.trim().length === 0) {
            return {
                isValid: false,
                error: 'Nome do schema não pode estar vazio'
            };
        }

        if (schemaName.length > 100) {
            return {
                isValid: false,
                error: 'Nome do schema não pode ter mais de 100 caracteres'
            };
        }

        return { isValid: true };
    }

    static validateDataHash(dataHash: any) {
        if (!dataHash || typeof dataHash !== 'string') {
            return {
                isValid: false,
                error: 'Hash dos dados é obrigatório e deve ser uma string'
            };
        }

        if (dataHash.trim().length === 0) {
            return {
                isValid: false,
                error: 'Hash dos dados não pode estar vazio'
            };
        }

        if (dataHash.length > 100) {
            return {
                isValid: false,
                error: 'Hash dos dados não pode ter mais de 100 caracteres'
            };
        }
        
        return { isValid: true };
    }

    static validateDescription(description: any) {
        if (!description || typeof description !== 'string') {
            return {
                isValid: false,
                error: 'Descrição é obrigatória e deve ser uma string'
            };
        }

        if (description.trim().length === 0) {
            return {
                isValid: false,
                error: 'Descrição não pode estar vazia'
            };
        }

        if (description.length > 500) {
            return {
                isValid: false,
                error: 'Descrição não pode ter mais de 500 caracteres'
            };
        }

        return { isValid: true };
    }

    static validateSchemaInput(schemaInput: any) {
        if (!schemaInput || typeof schemaInput !== 'object') {
            return {
                isValid: false,
                error: 'Dados do schema são obrigatórios'
            };
        }

        const idValidation = this.validateSchemaId(schemaInput.id);
        if (!idValidation.isValid) {
            return idValidation;
        }

        const nameValidation = this.validateSchemaName(schemaInput.name);
        if (!nameValidation.isValid) {
            return nameValidation;
        }

        const channelValidation = this.validateContractName(schemaInput.channelName);
        if (!channelValidation.isValid) {
            return {
                isValid: false,
                error: 'Nome do canal: ' + channelValidation.error
            };
        }

        const dataHashValidation = this.validateDataHash(schemaInput.dataHash);
        if (!dataHashValidation.isValid) {
            return dataHashValidation;
        }

        const descriptionValidation = this.validateDescription(schemaInput.description);
        if (!descriptionValidation.isValid) {
            return descriptionValidation;
        }

        return { isValid: true };
    }
}