export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  
  // Schema Registry Errors
  SCHEMA_ALREADY_EXISTS = 'SCHEMA_ALREADY_EXISTS',
  SCHEMA_NOT_FOUND = 'SCHEMA_NOT_FOUND',
  SCHEMA_VERSION_NOT_FOUND = 'SCHEMA_VERSION_NOT_FOUND',
  SCHEMA_NOT_ACTIVE = 'SCHEMA_NOT_ACTIVE',
  INVALID_SCHEMA_ID = 'INVALID_SCHEMA_ID',
  INVALID_SCHEMA_NAME = 'INVALID_SCHEMA_NAME',
  INVALID_SCHEMA_STATUS = 'INVALID_SCHEMA_STATUS',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  DESCRIPTION_TOO_LONG = 'DESCRIPTION_TOO_LONG',
  PROPERTIES_EMPTY = 'PROPERTIES_EMPTY',
  SCHEMA_INTEGRITY_VIOLATION = 'SCHEMA_INTEGRITY_VIOLATION',
  
  // Permission Errors
  NOT_SCHEMA_OWNER = 'NOT_SCHEMA_OWNER',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Channel Errors
  CHANNEL_NOT_FOUND = 'CHANNEL_NOT_FOUND',
  CHANNEL_NOT_ACTIVE = 'CHANNEL_NOT_ACTIVE',
  INVALID_CHANNEL_NAME = 'INVALID_CHANNEL_NAME',
  
  // Blockchain Errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  BLOCKCHAIN_CONNECTION_ERROR = 'BLOCKCHAIN_CONNECTION_ERROR',
  INVALID_PRIVATE_KEY = 'INVALID_PRIVATE_KEY',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  
  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  
  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorDefinition {
  code: ErrorCode;
  message: string;
  httpStatus: number;
  category: 'validation' | 'business' | 'system';
}

/**
 * Error catalog with all possible errors
 */
export const ERROR_CATALOG: Record<ErrorCode, ErrorDefinition> = {
  // Validation Errors
  [ErrorCode.INVALID_INPUT]: {
    code: ErrorCode.INVALID_INPUT,
    message: 'Invalid input data',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.MISSING_REQUIRED_FIELD]: {
    code: ErrorCode.MISSING_REQUIRED_FIELD,
    message: 'Required field is missing',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.INVALID_FORMAT]: {
    code: ErrorCode.INVALID_FORMAT,
    message: 'Invalid format',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.VALIDATION_FAILED]: {
    code: ErrorCode.VALIDATION_FAILED,
    message: 'Validation failed',
    httpStatus: 400,
    category: 'validation',
  },
  
  // Schema Registry Errors
  [ErrorCode.SCHEMA_ALREADY_EXISTS]: {
    code: ErrorCode.SCHEMA_ALREADY_EXISTS,
    message: 'Schema already exists and cannot be recreated',
    httpStatus: 409,
    category: 'business',
  },
  [ErrorCode.SCHEMA_NOT_FOUND]: {
    code: ErrorCode.SCHEMA_NOT_FOUND,
    message: 'Schema not found',
    httpStatus: 404,
    category: 'business',
  },
  [ErrorCode.SCHEMA_VERSION_NOT_FOUND]: {
    code: ErrorCode.SCHEMA_VERSION_NOT_FOUND,
    message: 'Schema version not found',
    httpStatus: 404,
    category: 'business',
  },
  [ErrorCode.SCHEMA_NOT_ACTIVE]: {
    code: ErrorCode.SCHEMA_NOT_ACTIVE,
    message: 'Schema is not active',
    httpStatus: 400,
    category: 'business',
  },
  [ErrorCode.INVALID_SCHEMA_ID]: {
    code: ErrorCode.INVALID_SCHEMA_ID,
    message: 'Invalid schema ID format. Must contain only letters, numbers, dots, underscores and hyphens',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.INVALID_SCHEMA_NAME]: {
    code: ErrorCode.INVALID_SCHEMA_NAME,
    message: 'Invalid schema name. Must be between 1 and 100 characters',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.INVALID_SCHEMA_STATUS]: {
    code: ErrorCode.INVALID_SCHEMA_STATUS,
    message: 'Invalid schema status. Must be ACTIVE, DEPRECATED or INACTIVE',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.INVALID_STATUS_TRANSITION]: {
    code: ErrorCode.INVALID_STATUS_TRANSITION,
    message: 'Invalid status transition',
    httpStatus: 400,
    category: 'business',
  },
  [ErrorCode.DESCRIPTION_TOO_LONG]: {
    code: ErrorCode.DESCRIPTION_TOO_LONG,
    message: 'Description cannot exceed 500 characters',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.PROPERTIES_EMPTY]: {
    code: ErrorCode.PROPERTIES_EMPTY,
    message: 'Schema properties cannot be empty',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.SCHEMA_INTEGRITY_VIOLATION]: {
    code: ErrorCode.SCHEMA_INTEGRITY_VIOLATION,
    message: 'Schema integrity check failed: database hash does not match blockchain',
    httpStatus: 500,
    category: 'system',
  },
  
  // Permission Errors
  [ErrorCode.NOT_SCHEMA_OWNER]: {
    code: ErrorCode.NOT_SCHEMA_OWNER,
    message: 'You are not the owner of this schema',
    httpStatus: 403,
    category: 'business',
  },
  [ErrorCode.UNAUTHORIZED]: {
    code: ErrorCode.UNAUTHORIZED,
    message: 'Unauthorized',
    httpStatus: 401,
    category: 'business',
  },
  
  // Channel Errors
  [ErrorCode.CHANNEL_NOT_FOUND]: {
    code: ErrorCode.CHANNEL_NOT_FOUND,
    message: 'Channel not found',
    httpStatus: 404,
    category: 'business',
  },
  [ErrorCode.CHANNEL_NOT_ACTIVE]: {
    code: ErrorCode.CHANNEL_NOT_ACTIVE,
    message: 'Channel is not active',
    httpStatus: 400,
    category: 'business',
  },
  [ErrorCode.INVALID_CHANNEL_NAME]: {
    code: ErrorCode.INVALID_CHANNEL_NAME,
    message: 'Invalid channel name',
    httpStatus: 400,
    category: 'validation',
  },
  
  // Blockchain Errors
  [ErrorCode.TRANSACTION_FAILED]: {
    code: ErrorCode.TRANSACTION_FAILED,
    message: 'Blockchain transaction failed',
    httpStatus: 500,
    category: 'system',
  },
  [ErrorCode.CONTRACT_NOT_FOUND]: {
    code: ErrorCode.CONTRACT_NOT_FOUND,
    message: 'Smart contract not found',
    httpStatus: 500,
    category: 'system',
  },
  [ErrorCode.BLOCKCHAIN_CONNECTION_ERROR]: {
    code: ErrorCode.BLOCKCHAIN_CONNECTION_ERROR,
    message: 'Failed to connect to blockchain',
    httpStatus: 503,
    category: 'system',
  },
  [ErrorCode.INVALID_PRIVATE_KEY]: {
    code: ErrorCode.INVALID_PRIVATE_KEY,
    message: 'Invalid private key format. Must be 0x followed by 64 hexadecimal characters',
    httpStatus: 400,
    category: 'validation',
  },
  [ErrorCode.INVALID_ADDRESS]: {
    code: ErrorCode.INVALID_ADDRESS,
    message: 'Invalid Ethereum address format. Must be 0x followed by 40 hexadecimal characters',
    httpStatus: 400,
    category: 'validation',
  },
  
  // Database Errors
  [ErrorCode.DATABASE_ERROR]: {
    code: ErrorCode.DATABASE_ERROR,
    message: 'Database operation failed',
    httpStatus: 500,
    category: 'system',
  },
  [ErrorCode.RECORD_NOT_FOUND]: {
    code: ErrorCode.RECORD_NOT_FOUND,
    message: 'Record not found in database',
    httpStatus: 404,
    category: 'business',
  },
  
  // Server Errors
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    httpStatus: 500,
    category: 'system',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    code: ErrorCode.SERVICE_UNAVAILABLE,
    message: 'Service temporarily unavailable',
    httpStatus: 503,
    category: 'system',
  },
};

/**
 * Get error definition by code
 */
export function getErrorDefinition(code: ErrorCode): ErrorDefinition {
  return ERROR_CATALOG[code];
}

/**
 * Create error with custom details
 */
export function createError(
  code: ErrorCode,
  details?: string,
  metadata?: Record<string, any>
): AppError {
  const definition = getErrorDefinition(code);
  return new AppError(
    code,
    details || definition.message,
    definition.httpStatus,
    metadata
  );
}

/**
 * Application Error Class
 */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly httpStatus: number,
    public readonly metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.metadata && { details: this.metadata }),
      },
    };
  }
}