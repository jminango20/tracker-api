/**
 * Schema Validator (Refactored with Exceptions)
 * 
 * Benefits:
 * - Throws AppError directly (no ValidationResult boilerplate)
 * - Returns clean, validated data
 * - All errors from centralized catalog
 * - Much cleaner controller code
 * - Fail-fast behavior
 */

import { ErrorCode, createError } from '../errors/definitions';
import { CommonValidator } from './commonValidators';
import {
  CreateSchemaDto,
  UpdateSchemaDto,
  SetSchemaStatusDto,
  DeprecateSchemaDto,
  InactivateSchemaDto,
  JsonSchemaProperty,
  isValidSchemaStatus,
  SchemaStatusString,
  GetSchemaDto,
  GetSchemaQuery,
  ListSchemasDto,
  GetSchemaInfoDto
} from '../types/schemaTypes';

/**
 * Schema Validator Class
 * All methods throw AppError on validation failure
 */
export class SchemaValidator {
  /**
   * Validate schema ID format
   * @throws AppError if invalid
   * @returns Cleaned schema ID
   */
  static validateSchemaId(schemaId: unknown): string {
    if (typeof schemaId !== 'string' || !schemaId.trim()) {
      throw createError(
        ErrorCode.INVALID_SCHEMA_ID,
        'Schema ID is required and must be a non-empty string'
      );
    }

    const trimmed = schemaId.trim();

    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
      throw createError(ErrorCode.INVALID_SCHEMA_ID);
    }

    if (trimmed.length > 100) {
      throw createError(
        ErrorCode.INVALID_SCHEMA_ID,
        'Schema ID cannot exceed 100 characters'
      );
    }

    return trimmed;
  }

  /**
   * Validate schema name
   * @throws AppError if invalid
   * @returns Cleaned schema name
   */
  static validateSchemaName(name: unknown): string {
    if (typeof name !== 'string' || !name.trim()) {
      throw createError(
        ErrorCode.INVALID_SCHEMA_NAME,
        'Schema name is required and must be a non-empty string'
      );
    }

    const trimmed = name.trim();

    if (trimmed.length < 1 || trimmed.length > 100) {
      throw createError(ErrorCode.INVALID_SCHEMA_NAME);
    }

    return trimmed;
  }

  /**
   * Validate channel name
   * @throws AppError if invalid
   * @returns Cleaned channel name
   */
  static validateChannelName(channelName: unknown): string {
    if (typeof channelName !== 'string' || !channelName.trim()) {
      throw createError(
        ErrorCode.INVALID_CHANNEL_NAME,
        'Channel name is required and must be a non-empty string'
      );
    }

    const trimmed = channelName.trim();

    if (trimmed.length < 1) {
      throw createError(ErrorCode.INVALID_CHANNEL_NAME);
    }

    return trimmed;
  }

  /**
   * Validate description (optional)
   */
  static validateDescription(description: unknown): string {
    if (description === undefined || description === null) {
      return '';
    }

    if (typeof description !== 'string') {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Description must be a string'
      );
    }

    const trimmed = description.trim();

    if (trimmed.length > 500) {
      throw createError(ErrorCode.DESCRIPTION_TOO_LONG);
    }

    return trimmed;
  }

  /**
   * Validate properties object
   * @throws AppError if invalid
   * @returns Properties object
   */
  static validateProperties(
    properties: unknown
  ): Record<string, JsonSchemaProperty> {
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Properties must be a non-empty object'
      );
    }

    const propsObj = properties as Record<string, unknown>;

    if (Object.keys(propsObj).length === 0) {
      throw createError(ErrorCode.PROPERTIES_EMPTY);
    }

    return propsObj as Record<string, JsonSchemaProperty>;
  }

  /**
   * Validate required array (optional)
   */
  static validateRequired(required: unknown): string[] {
    if (required === undefined || required === null) {
      return [];
    }

    if (!Array.isArray(required)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Required must be an array'
      );
    }

    const requiredArray = required as unknown[];

    if (requiredArray.some((item) => typeof item !== 'string')) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'All items in required array must be strings'
      );
    }

    return requiredArray as string[];
  }

  /**
   * Validate version number
   * @throws AppError if invalid
   * @returns Version number
   */
  static validateVersion(version: unknown): number {
    if (version === undefined || version === null) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Version is required'
      );
    }

    const versionNum = Number(version);

    if (isNaN(versionNum) || versionNum < 1 || !Number.isInteger(versionNum)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Version must be a positive integer'
      );
    }

    return versionNum;
  }

  /**
   * Validate schema status
   * @throws AppError if invalid
   * @returns Status string (uppercase)
   */
  static validateStatus(status: unknown): SchemaStatusString {
    if (typeof status !== 'string') {
      throw createError(
        ErrorCode.INVALID_SCHEMA_STATUS,
        'Status must be a string'
      );
    }

    const upperStatus = status.toUpperCase();

    if (!isValidSchemaStatus(upperStatus)) {
      throw createError(ErrorCode.INVALID_SCHEMA_STATUS);
    }

    return upperStatus as SchemaStatusString;
  }

  /**
   * Validate data hash
   * @throws AppError if invalid
   * @returns Cleaned data hash
   */
  static validateDataHash(dataHash: unknown): string {
    if (typeof dataHash !== 'string' || !dataHash.trim()) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Data hash is required and must be a non-empty string'
      );
    }

    const trimmed = dataHash.trim();

    // Validate hex format (0x followed by hex characters)
    if (!/^0x[a-fA-F0-9]+$/.test(trimmed)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Data hash must be a valid hex string starting with 0x'
      );
    }

    return trimmed;
  }

  /**
   * Validate private key format
   * @throws AppError if invalid
   * @returns Private key
   */
  static validatePrivateKey(privateKey: unknown): string {
    if (typeof privateKey !== 'string' || !privateKey.trim()) {
      throw createError(
        ErrorCode.INVALID_PRIVATE_KEY,
        'Private key is required'
      );
    }

    const trimmed = privateKey.trim();

    if (!trimmed.startsWith('0x') || trimmed.length !== 66) {
      throw createError(ErrorCode.INVALID_PRIVATE_KEY);
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      throw createError(ErrorCode.INVALID_PRIVATE_KEY);
    }

    return trimmed;
  }

  /**
   * Validate and clean CreateSchemaDto
   */
  static validateCreateSchemaDto(data: unknown): CreateSchemaDto {
    if (!data || typeof data !== 'object') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Request body must be an object'
      );
    }

    const dto = data as Record<string, unknown>;

    // Validate each field (throws on error)
    const schemaId = this.validateSchemaId(dto.schemaId);
    const name = this.validateSchemaName(dto.name);
    const channelName = this.validateChannelName(dto.channelName);
    const properties = this.validateProperties(dto.properties);
    const required = this.validateRequired(dto.required);
    const description = this.validateDescription(dto.description);

    return {
      schemaId: schemaId,
      name: name,
      channelName: channelName,
      properties: properties,
      required: required,
      description: description,
    };
  }

  /**
   * Validate and clean UpdateSchemaDto
   */
  static validateUpdateSchemaDto(data: unknown): UpdateSchemaDto {
    if (!data || typeof data !== 'object') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Request body must be an object'
      );
    }

    const dto = data as Record<string, unknown>;

    const schemaId = this.validateSchemaId(dto.schemaId);
    const channelName = this.validateChannelName(dto.channelName);
    const properties = this.validateProperties(dto.properties);
    const required = this.validateRequired(dto.required);
    const description = this.validateDescription(dto.description);

    return {
      schemaId: schemaId,
      channelName: channelName,
      properties: properties,
      required: required,
      description: description,
    };
  }

  /**
   * Validate and clean DeprecateSchemaDto
   */
  static validateDeprecateSchemaDto(data: unknown): DeprecateSchemaDto {
    if (!data || typeof data !== 'object') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Request body must be an object'
      );
    }

    const dto = data as Record<string, unknown>;

    const schemaId = this.validateSchemaId(dto.schemaId);
    const channelName = this.validateChannelName(dto.channelName);

    return {
      schemaId: schemaId,
      channelName: channelName,
    };
  }

  /**
   * Validate and clean InactivateSchemaDto
   */
  static validateInactivateSchemaDto(data: unknown): InactivateSchemaDto {
    if (!data || typeof data !== 'object') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Request body must be an object'
      );
    }

    const dto = data as Record<string, unknown>;

    const schemaId = this.validateSchemaId(dto.schemaId);
    const version = this.validateVersion(dto.version);
    const channelName = this.validateChannelName(dto.channelName);

    return {
      schemaId: schemaId,
      version: version,
      channelName: channelName,
    };
  }

  /**
   * Validate and clean SetSchemaStatusDto
   */
  static validateSetSchemaStatusDto(data: unknown): SetSchemaStatusDto {
    if (!data || typeof data !== 'object') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Request body must be an object'
      );
    }

    const dto = data as Record<string, unknown>;

    const schemaId = this.validateSchemaId(dto.schemaId);
    const version = this.validateVersion(dto.version);
    const channelName = this.validateChannelName(dto.channelName);
    const status = this.validateStatus(dto.status);

    return {
      schemaId: schemaId,
      version:version,
      channelName: channelName,
      status:status,
    };
  }

  /**
   * Validate GetSchemaDto
   */
  static validateGetSchemaDto(data: unknown): GetSchemaDto {
    if (!data || typeof data !== 'object') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Request body must be an object'
      );
    }

    const dto = data as Record<string, unknown>;

    const schemaIdResult = this.validateSchemaId(dto.schemaId);
    const channelResult = this.validateChannelName(dto.channelName);

    // Version é opcional
    let version: number | undefined;
    if (dto.version !== undefined && dto.version !== null) {
      version = this.validateVersion(dto.version);
    }

    return {
      schemaId: schemaIdResult!,
      channelName: channelResult!,
      version: version,
    };
  }

  /**
   * Validate GetSchemaQuery (query params)
   */
  static validateGetSchemaQuery(query: unknown): GetSchemaQuery {
    if (!query || typeof query !== 'object') {
      return {}; // Defaults
    }

    const q = query as Record<string, unknown>;
    const result: GetSchemaQuery = {};

    // Validate source
    if (q.source) {
      if (q.source !== 'database' && q.source !== 'blockchain') {
        throw createError(
          ErrorCode.INVALID_INPUT,
          'Source must be "database" or "blockchain"'
        );
      }
      result.source = q.source as 'database' | 'blockchain';
    }

    // Validate validateIntegrity
    if (q.validateIntegrity !== undefined) {
      if (typeof q.validateIntegrity === 'boolean') {
        result.validateIntegrity = q.validateIntegrity;
      } else if (q.validateIntegrity === 'true' || q.validateIntegrity === '1') {
        result.validateIntegrity = true;
      } else if (q.validateIntegrity === 'false' || q.validateIntegrity === '0') {
        result.validateIntegrity = false;
      }
    }

    // validateIntegrity só funciona com source=database
    if (result.validateIntegrity && result.source === 'blockchain') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'validateIntegrity can only be used with source=database'
      );
    }

    return result;
  }

  /**
   * Validate ListSchemasDto
   */
  static validateListSchemasDto(data: unknown): ListSchemasDto {
    if (!data || typeof data !== 'object') {
      return {}; // Todos os campos são opcionais
    }

    const dto = data as Record<string, unknown>;
    const result: ListSchemasDto = {};

    // channelName (opcional)
    if (dto.channelName) {
      const channelResult = this.validateChannelName(dto.channelName);
      result.channelName = channelResult;
    }

    // schemaId (opcional, partial match)
    if (dto.schemaId) {
      const schemaIdResult = this.validateSchemaId(dto.schemaId);
      result.schemaId = schemaIdResult;
    }

    // status (opcional)
    if (dto.status) {
      const statusResult = this.validateStatus(dto.status);
      result.status = statusResult as SchemaStatusString;
    }

    // page (opcional, default 1)
    if (dto.page !== undefined) {
      const pageResult = CommonValidator.validatePositiveInteger(dto.page, 'Page');
      result.page = pageResult;
    }

    // limit (opcional, default 50, max 100)
    if (dto.limit !== undefined) {
      const limitResult = CommonValidator.validateNumberInRange(dto.limit, {
        fieldName: 'Limit',
        min: 1,
        max: 100,
        integer: true,
      });
      result.limit = limitResult;
    }

    return result;
  }

  /**
   * Validate GetSchemaInfoDto (reusa validateGetSchemaDto sem version)
   */
  static validateGetSchemaInfoDto(data: unknown): GetSchemaInfoDto {
    if (!data || typeof data !== 'object') {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Request body must be an object'
      );
    }

    const dto = data as Record<string, unknown>;

    const schemaIdResult = this.validateSchemaId(dto.schemaId);
    const channelResult = this.validateChannelName(dto.channelName);

    return {
      schemaId: schemaIdResult!,
      channelName: channelResult!,
    };
  }




}