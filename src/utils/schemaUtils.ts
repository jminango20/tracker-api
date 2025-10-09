/**
 * Schema Utilities (Refactored with Exceptions)
 * 
 * All validation errors throw AppError from centralized catalog
 * No hardcoded error messages
 */

import Ajv from 'ajv';
import { keccak256, toHex } from 'viem';
import stringify from 'json-stable-stringify';
import { JsonSchemaProperty, JsonSchema } from '../types/schemaTypes';
import { ErrorCode, createError } from '../errors/definitions';

/**
 * Valida se o schema é um JSON Schema válido usando AJV
 * Também valida se todos os campos em 'required' existem em 'properties'
 * @param schemaData JSON Schema com properties e required
 * @throws AppError se inválido
 */
export const isValidSchema = (schemaData: JsonSchema): void => {
  if (!schemaData.properties || typeof schemaData.properties !== 'object') {
    throw createError(
      ErrorCode.INVALID_INPUT,
      'Schema must contain "properties" as an object'
    );
  }

  const ajv = new Ajv({ strict: false });

  const schemaToValidate = {
    type: 'object',
    properties: schemaData.properties || {},
    required: schemaData.required || []
  };

  const valid = ajv.validateSchema(schemaToValidate);
  if (!valid) {
    const errors = ajv.errorsText(ajv.errors);
    throw createError(
      ErrorCode.VALIDATION_FAILED,
      `Invalid JSON Schema: ${errors}`
    );
  }

  validateRequiredFields(schemaData.properties, schemaData.required || [], 'root');
};

/**
 * Valida recursivamente se todos os campos em 'required' existem em 'properties'
 * PERMITE que properties tenha mais campos que required (campos opcionais)
 * IMPEDE que required tenha campos que não existem em properties
 * 
 * @param properties Objeto properties do schema
 * @param required Array de campos obrigatórios
 * @param path Caminho atual (para mensagem de erro detalhada)
 * @throws AppError se validação falhar
 */
function validateRequiredFields(
  properties: Record<string, JsonSchemaProperty>,
  required: string[],
  path: string
): void {
  if (!properties || typeof properties !== 'object') {
    return;
  }
  
  // Verifica se todos os campos required existem em properties
  for (const requiredField of required) {
    if (!(requiredField in properties)) {
      throw createError(
        ErrorCode.VALIDATION_FAILED,
        `Field '${requiredField}' is in 'required' but does not exist in 'properties' (path: ${path})`
      );
    }
  }

  // Valida recursivamente propriedades aninhadas
  for (const [propertyKey, propertyValue] of Object.entries(properties)) {
    if (!propertyValue || typeof propertyValue !== 'object') {
      continue;
    }

    // Verifica se type é 'object' ou array que inclui 'object'
    const typeIsObject = propertyValue.type === 'object' || 
      (Array.isArray(propertyValue.type) && propertyValue.type.includes('object'));

    if (typeIsObject && propertyValue.properties) {
      const nestedProperties = propertyValue.properties;
      const nestedRequired = propertyValue.required || [];
      
      validateRequiredFields(
        nestedProperties,
        nestedRequired,
        `${path}.${propertyKey}`
      );
    }

    // Verifica se type é 'array' ou array que inclui 'array'
    const typeIsArray = propertyValue.type === 'array' || 
      (Array.isArray(propertyValue.type) && propertyValue.type.includes('array'));

    if (typeIsArray && propertyValue.items) {
      const items = propertyValue.items;
      
      const itemTypeIsObject = items.type === 'object' || 
        (Array.isArray(items.type) && items.type.includes('object'));

      if (itemTypeIsObject && items.properties) {
        const itemsProperties = items.properties;
        const itemsRequired = items.required || [];
        
        validateRequiredFields(
          itemsProperties,
          itemsRequired,
          `${path}.${propertyKey}[]`
        );
      }
    }
  }
}

/**
 * Gera hash keccak256 do schema (properties + required)
 * @param schemaData Objeto com properties e required
 * @returns string Hash em formato 0x...
 * @throws AppError se dados inválidos
 */
export const generateSchemaHash = (schemaData: JsonSchema): string => {
  if (!schemaData || typeof schemaData !== 'object') {
    throw createError(
      ErrorCode.INVALID_INPUT,
      'Schema data is invalid for hash generation'
    );
  }

  const schemaForHash = {
    properties: schemaData.properties || {},
    required: schemaData.required || [],
  };

  // Serializa de forma determinística (ordenando chaves)
  const schemaJson = stringify(schemaForHash);

  if (!schemaJson) {
    throw createError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Failed to serialize schema for hash generation'
    );
  }

  // Gera o hash keccak256
  const hash = keccak256(toHex(schemaJson));

  return hash;
};

/**
 * Valida se as properties não estão vazias
 * @param properties Objeto com as properties
 * @returns boolean
 */
export const validatePropertiesNotEmpty = (properties: unknown): boolean => {
  if (!properties || typeof properties !== 'object') {
    return false;
  }
  return Object.keys(properties).length > 0;
};