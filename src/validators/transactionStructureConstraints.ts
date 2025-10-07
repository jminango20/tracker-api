import { isArray } from 'validate.js';
import validate from 'validate.js';

/**
 * Validador customizado para array de objetos
 */
validate.validators.objectArray = function(value: any, options: any, key: string, attributes: any) {
    if (value === null || value === undefined) {
        return null;
    }

    if (!Array.isArray(value)) {
        return 'deve ser um array';
    }

    if (value.length === 0) {
        return 'não pode estar vazio';
    }

    for (let i = 0; i < value.length; i++) {
        const element = value[i];
        
        if (typeof element !== 'object' || element === null) {
            return `elemento na posição ${i + 1} deve ser um objeto`;
        }

        if (Object.keys(element).length === 0) {
            return `elemento na posição ${i + 1} não pode ser vazio`;
        }
    }

    return null;
};


export const baseTransactionConstraints = {
  'channel.name': { 
    presence: { allowEmpty: false }, 
    type: 'string' 
  },
  'process.processId': { 
    presence: { allowEmpty: false }, 
    type: 'string' 
  },
  'process.natureId': { 
    presence: { allowEmpty: false }, 
    type: 'string' 
  },
  'process.stageId': { 
    presence: { allowEmpty: false }, 
    type: 'string' 
  },
};

/**
 * CREATE_ASSET - Criar novo ativo
 */
export const createAssetStructureConstraints = {
  ...baseTransactionConstraints,
  'asset.amount': { 
    presence: { allowEmpty: false }, 
    type: 'number',
    numericality: { 
      greaterThan: 0,
      message: 'deve ser maior que zero'
    }
  },
  'asset.idLocal': { 
    type: 'string' 
  },
  'data': { 
    presence: { allowEmpty: false }, 
    objectArray: true
  }
};

/**
 * UPDATE_ASSET - Atualizar ativo existente
 */
export const updateAssetStructureConstraints = {
  ...baseTransactionConstraints,
  'asset.assetIds': { 
    presence: { allowEmpty: false }, 
    type: 'array',
    length: { 
      is: 1,
      message: 'deve conter exatamente 1 assetId'
    }
  },
  'asset.amount': {
    type: 'number',
    numericality: { 
      greaterThan: 0,
      message: 'deve ser maior que zero'
    }
  },
  'asset.idLocal': {
    type: 'string'
  },
  'data': { 
    presence: { allowEmpty: false }, 
    type: 'array' 
  },
};