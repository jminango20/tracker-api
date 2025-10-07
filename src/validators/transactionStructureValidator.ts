import { validate } from 'validate.js';
import {
  baseTransactionConstraints,
  createAssetStructureConstraints,
  updateAssetStructureConstraints,
} from './transactionStructureConstraints';

export class TransactionStructureValidator {
  
  /**
   * Valida a estrutura do requestBody baseado na action
   */
  static validateStructure(action: string, requestBody: any): { isValid: boolean; error?: string } {
    let constraints;
    
    switch (action) {
      case 'CREATE_ASSET':
        constraints = createAssetStructureConstraints;
        break;
        
      case 'UPDATE_ASSET':
        constraints = updateAssetStructureConstraints;
        break;
        
      default:
        // Para actions desconhecidas, valida apenas estrutura base
        constraints = baseTransactionConstraints;
    }
    const validation = validate(requestBody, constraints);

    if (validation) {
      const formattedErrors = this.formatValidationErrors(validation);
      return { 
        isValid: false, 
        error: `Validação estrutural falhou para ${action}: ${formattedErrors}` 
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Formata erros de validação para mensagem legível
   */
  private static formatValidationErrors(errors: any): string {
    const messages: string[] = [];
    
    for (const field in errors) {
      const fieldErrors = errors[field];
      messages.push(`${field}: ${fieldErrors.join(', ')}`);
    }
    
    return messages.join('; ');
  }
}
