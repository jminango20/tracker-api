import { 
    SchemaInput,
    SchemaStatusInput,  
    SchemaUpdateInput 
} from "../types/apiTypes";

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

    static validateSchemaInput(schemaInput: SchemaInput) {
        if (!schemaInput || typeof schemaInput !== 'object') {
            return {
                isValid: false,
                error: 'Dados do schema são obrigatórios'
            };
        }

        const idValidation = this.validateSchemaId(schemaInput.schemaId);
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

    static validateSchemaUpdate(schemaUpdate: SchemaUpdateInput) {
        if (!schemaUpdate || typeof schemaUpdate !== 'object') {
            return {
                isValid: false,
                error: 'Dados do schema são obrigatórios'
            };
        }

        const idValidation = this.validateSchemaId(schemaUpdate.schemaId);
        if (!idValidation.isValid) {
            return idValidation;
        }

        const channelValidation = this.validateContractName(schemaUpdate.channelName);
        if (!channelValidation.isValid) {
            return {
                isValid: false,
                error: 'Nome do canal: ' + channelValidation.error
            };
        }

        const newDataHashValidation = this.validateDataHash(schemaUpdate.newDataHash);
        if (!newDataHashValidation.isValid) {
            return newDataHashValidation;
        }

        const newDescriptionValidation = this.validateDescription(schemaUpdate.newDescription);
        if (!newDescriptionValidation.isValid) {
            return newDescriptionValidation;
        }

        return { isValid: true };
    }

    static validateSchemaStatusInput(schemaStatusInput: SchemaStatusInput) {
        if (!schemaStatusInput || typeof schemaStatusInput !== 'object') {
            return {
                isValid: false,
                error: 'Dados do schema são obrigatórios'
            };
        }

        const idValidation = this.validateSchemaId(schemaStatusInput.schemaId);
        if (!idValidation.isValid) {
            return idValidation;
        }

        const versionValidation = this.validateVersion(schemaStatusInput.version);
        if (!versionValidation.isValid) {
            return versionValidation;
        }

        const channelValidation = this.validateContractName(schemaStatusInput.channelName);
        if (!channelValidation.isValid) {
            return {
                isValid: false,
                error: 'Nome do canal: ' + channelValidation.error
            };
        }

        const statusValidation = this.validateSchemaStatus(schemaStatusInput.status);
        if (!statusValidation.isValid) {
            return statusValidation;
        }

        return { isValid: true };
    }

    static validateVersion(version: any) {
        if (version === undefined || version === null) {
            return {
                isValid: false,
                error: 'Versão é obrigatória'
            };
        }

        const versionNum = Number(version);

        if (isNaN(versionNum) || versionNum < 1) {
            return {
                isValid: false,
                error: 'Versão deve ser um número maior que 0'
            };
        }

        if (!Number.isInteger(versionNum)) {
            return {
                isValid: false,
                error: 'Versão deve ser um número inteiro'
            };
        }

        return { 
            isValid: true,
            version: versionNum
        };
    }

    static validateSchemaStatus(status: any) {
        if (!status || typeof status !== 'string') {
            return {
                isValid: false,
                error: 'Status deve ser uma string'
            };
        }

        const validStatuses = ['ACTIVE', 'DEPRECATED', 'INACTIVE'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return {
                isValid: false,
                error: 'Status deve ser ACTIVE, DEPRECATED ou INACTIVE'
            };
        }

        return { isValid: true };
    }

    // Validation for Process
    static validateProcessId(processId: any) {
        if (!processId || typeof processId !== 'string') {
            return {
                isValid: false,
                error: 'ID do processo é obrigatório e deve ser uma string'
            };
        }

        if (processId.trim().length === 0) {
            return {
                isValid: false,
                error: 'ID do processo não pode estar vazio'
            };
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(processId)) {
            return {
                isValid: false,
                error: 'ID do processo deve conter apenas letras, números, underscore e hífen'
            };
        }

        return { isValid: true };
    }

    static validateNatureId(natureId: any) {
        if (!natureId || typeof natureId !== 'string') {
            return {
                isValid: false,
                error: 'ID da natureza é obrigatório e deve ser uma string'
            };
        }

        if (natureId.trim().length === 0) {
            return {
                isValid: false,
                error: 'ID da natureza não pode estar vazio'
            };
        }

        return { isValid: true };
    }

    static validateStageId(stageId: any) {
        if (!stageId || typeof stageId !== 'string') {
            return {
                isValid: false,
                error: 'ID do estágio é obrigatório e deve ser uma string'
            };
        }

        if (stageId.trim().length === 0) {
            return {
                isValid: false,
                error: 'ID do estágio não pode estar vazio'
            };
        }

        return { isValid: true };
    }

    static validateProcessAction(action: any) {
        if (!action || typeof action !== 'string') {
            return {
                isValid: false,
                error: 'Ação do processo deve ser uma string'
            };
        }

        const validActions = [
            'CREATE_ASSET', 'UPDATE_ASSET', 'TRANSFER_ASSET', 'SPLIT_ASSET',
            'GROUP_ASSET', 'UNGROUP_ASSET', 'TRANSFORM_ASSET', 'INACTIVATE_ASSET', 'CREATE_DOCUMENT'
        ];

        if (!validActions.includes(action.toUpperCase())) {
            return {
                isValid: false,
                error: 'Ação deve ser uma das: ' + validActions.join(', ')
            };
        }

        return { isValid: true };
    }

    static validateSchemaReference(schema: any) {
        if (!schema || typeof schema !== 'object') {
            return {
                isValid: false,
                error: 'Referência de schema deve ser um objeto'
            };
        }

        const schemaIdValidation = this.validateSchemaId(schema.schemaId);
        if (!schemaIdValidation.isValid) {
            return {
                isValid: false,
                error: 'Schema ID: ' + schemaIdValidation.error
            };
        }

        const versionValidation = this.validateVersion(schema.version);
        if (!versionValidation.isValid) {
            return {
                isValid: false,
                error: 'Versão do schema: ' + versionValidation.error
            };
        }

        return { isValid: true };
    }

    static validateSchemaArray(schemas: any) {
        if (!Array.isArray(schemas)) {
            return {
                isValid: false,
                error: 'Schemas deve ser um array'
            };
        }

        if (schemas.length > 20) {
            return {
                isValid: false,
                error: 'Máximo de 20 schemas por processo'
            };
        }

        // Validar cada schema
        for (let i = 0; i < schemas.length; i++) {
            const schemaValidation = this.validateSchemaReference(schemas[i]);
            if (!schemaValidation.isValid) {
                return {
                    isValid: false,
                    error: `Schema na posição ${i + 1}: ${schemaValidation.error}`
                };
            }
        }

        // Verificar duplicatas
        const seen = new Set();
        for (const schema of schemas) {
            const key = `${schema.schemaId}:${schema.version}`;
            if (seen.has(key)) {
                return {
                    isValid: false,
                    error: `Schema duplicado: ${schema.schemaId} versão ${schema.version}`
                };
            }
            seen.add(key);
        }

        return { isValid: true };
    }

    static validateProcessInput(processInput: any) {
        if (!processInput || typeof processInput !== 'object') {
            return {
                isValid: false,
                error: 'Dados do processo são obrigatórios'
            };
        }

        // Validar cada campo
        const processIdValidation = this.validateProcessId(processInput.processId);
        if (!processIdValidation.isValid) {
            return processIdValidation;
        }

        const natureIdValidation = this.validateNatureId(processInput.natureId);
        if (!natureIdValidation.isValid) {
            return natureIdValidation;
        }

        const stageIdValidation = this.validateStageId(processInput.stageId);
        if (!stageIdValidation.isValid) {
            return stageIdValidation;
        }

        const channelValidation = this.validateContractName(processInput.channelName);
        if (!channelValidation.isValid) {
            return {
                isValid: false,
                error: 'Nome do canal: ' + channelValidation.error
            };
        }

        const actionValidation = this.validateProcessAction(processInput.action);
        if (!actionValidation.isValid) {
            return actionValidation;
        }

        const descriptionValidation = this.validateDescription(processInput.description);
        if (!descriptionValidation.isValid) {
            return descriptionValidation;
        }

        const schemasValidation = this.validateSchemaArray(processInput.schemas);
        if (!schemasValidation.isValid) {
            return schemasValidation;
        }

        return { isValid: true };
    }

    static validateProcessStatus(status: any) {
        if (!status || typeof status !== 'string') {
            return {
                isValid: false,
                error: 'Status deve ser uma string'
            };
        }

        const validStatuses = ['ACTIVE', 'INACTIVE'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return {
                isValid: false,
                error: 'Status deve ser ACTIVE ou INACTIVE'
            };
        }

        return { isValid: true };
    }
}