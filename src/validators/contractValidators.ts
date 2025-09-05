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
}