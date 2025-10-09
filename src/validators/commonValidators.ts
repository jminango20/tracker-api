import { ErrorCode, createError } from '../errors/definitions';

export class CommonValidator {

  /**
   * Validate Ethereum address format
   */
  static validateAddress(address: unknown): `0x${string}` {
    if (typeof address !== 'string' || !address.trim()) {
      throw createError(
        ErrorCode.INVALID_ADDRESS,
        'Address is required and must be a string'
      );
    }

    const trimmed = address.trim() as `0x${string}`;

    if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
      throw createError(ErrorCode.INVALID_ADDRESS);
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      throw createError(ErrorCode.INVALID_ADDRESS);
    }

    return trimmed;
  }

  /**
   * Validate array of Ethereum addresses
   */
  static validateAddressArray(
    addresses: unknown,
    options: { maxLength?: number; minLength?: number } = {}
  ): `0x${string}`[] {
    if (!Array.isArray(addresses)) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        'Addresses must be an array'
      );
    }

    const { maxLength = 50, minLength = 1 } = options;

    if (addresses.length < minLength) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `At least ${minLength} address(es) required`
      );
    }

    if (addresses.length > maxLength) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `Maximum ${maxLength} addresses allowed`
      );
    }

    const validatedAddresses: `0x${string}`[] = [];

    for (let i = 0; i < addresses.length; i++) {
      try {
        const validAddress = this.validateAddress(addresses[i]);
        validatedAddresses.push(validAddress);
      } catch (error) {
        throw createError(
          ErrorCode.INVALID_ADDRESS,
          `Invalid address at position ${i + 1}`
        );
      }
    }

    return validatedAddresses;
  }

  /**
   * Validate private key format
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
   * Validate transaction hash
   */
  static validateTransactionHash(txHash: unknown): `0x${string}` {
    if (typeof txHash !== 'string' || !txHash.trim()) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Transaction hash is required'
      );
    }

    const trimmed = txHash.trim() as `0x${string}`;

    if (!trimmed.startsWith('0x') || trimmed.length !== 66) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Transaction hash must be 0x followed by 64 hex characters'
      );
    }

    if (!/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Transaction hash contains invalid characters'
      );
    }

    return trimmed;
  }

  /**
   * Validate hex string (for hashes)
   */
  static validateHexString(
    value: unknown,
    options: { minLength?: number; maxLength?: number } = {}
  ): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Hex string is required'
      );
    }

    const trimmed = value.trim();

    if (!trimmed.startsWith('0x')) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Hex string must start with 0x'
      );
    }

    const hexPart = trimmed.slice(2);

    if (options.minLength && hexPart.length < options.minLength) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `Hex string must be at least ${options.minLength} characters (excluding 0x)`
      );
    }

    if (options.maxLength && hexPart.length > options.maxLength) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `Hex string cannot exceed ${options.maxLength} characters (excluding 0x)`
      );
    }

    if (!/^[a-fA-F0-9]+$/.test(hexPart)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        'Hex string contains invalid characters'
      );
    }

    return trimmed;
  }

  /**
   * Validate non-empty string
   */
  static validateNonEmptyString(
    value: unknown,
    fieldName: string = 'Field'
  ): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} is required and must be a non-empty string`
      );
    }

    return value.trim();
  }

  /**
   * Validate string with length constraints
   */
  static validateStringWithLength(
    value: unknown,
    options: {
      fieldName: string;
      minLength?: number;
      maxLength?: number;
      pattern?: RegExp;
    }
  ): string {
    const { fieldName, minLength = 1, maxLength, pattern } = options;

    if (typeof value !== 'string' || !value.trim()) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} is required and must be a non-empty string`
      );
    }

    const trimmed = value.trim();

    if (trimmed.length < minLength) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be at least ${minLength} character(s)`
      );
    }

    if (maxLength && trimmed.length > maxLength) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} cannot exceed ${maxLength} characters`
      );
    }

    if (pattern && !pattern.test(trimmed)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} contains invalid characters`
      );
    }

    return trimmed;
  }

  /**
   * Validate positive integer
   */
  static validatePositiveInteger(
    value: unknown,
    fieldName: string = 'Value'
  ): number {
    if (value === undefined || value === null) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} is required`
      );
    }

    const numValue = Number(value);

    if (isNaN(numValue) || numValue < 1 || !Number.isInteger(numValue)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be a positive integer`
      );
    }

    return numValue;
  }

  /**
   * Validate non-negative integer
   */
  static validateNonNegativeInteger(
    value: unknown,
    fieldName: string = 'Value'
  ): number {
    if (value === undefined || value === null) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} is required`
      );
    }

    const numValue = Number(value);

    if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be a non-negative integer`
      );
    }

    return numValue;
  }

  /**
   * Validate number within range
   */
  static validateNumberInRange(
    value: unknown,
    options: {
      fieldName: string;
      min: number;
      max: number;
      integer?: boolean;
    }
  ): number {
    const { fieldName, min, max, integer = false } = options;

    if (value === undefined || value === null) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} is required`
      );
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be a number`
      );
    }

    if (integer && !Number.isInteger(numValue)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be an integer`
      );
    }

    if (numValue < min || numValue > max) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be between ${min} and ${max}`
      );
    }

    return numValue;
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(params: {
    page: unknown;
    pageSize: unknown;
  }): { page: number; pageSize: number } {
    const page = this.validatePositiveInteger(params.page, 'Page');

    const pageSize = this.validateNumberInRange(params.pageSize, {
      fieldName: 'Page size',
      min: 1,
      max: 100,
      integer: true,
    });

    return { page, pageSize };
  }

  /**
   * Validate enum value
   */
  static validateEnum<T extends string>(
    value: unknown,
    validValues: readonly T[],
    fieldName: string = 'Value'
  ): T {
    if (typeof value !== 'string') {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be a string`
      );
    }

    const upperValue = value.toUpperCase() as T;

    if (!validValues.includes(upperValue)) {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be one of: ${validValues.join(', ')}`
      );
    }

    return upperValue;
  }

  /**
   * Validate boolean
   */
  static validateBoolean(
    value: unknown,
    fieldName: string = 'Value'
  ): boolean {
    if (typeof value !== 'boolean') {
      throw createError(
        ErrorCode.INVALID_FORMAT,
        `${fieldName} must be a boolean`
      );
    }

    return value;
  }

  /**
   * Validate optional field
   */
  static validateOptional<T>(
    value: unknown,
    validator: (val: unknown) => T
  ): T | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    return validator(value);
  }

  /**
   * Validate array
   */
  static validateArray<T>(
    value: unknown,
    itemValidator: (item: unknown, index: number) => T,
    options: {
      fieldName?: string;
      minLength?: number;
      maxLength?: number;
    } = {}
  ): T[] {
    const { fieldName = 'Array', minLength = 0, maxLength } = options;

    if (!Array.isArray(value)) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} must be an array`
      );
    }

    if (value.length < minLength) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} must contain at least ${minLength} item(s)`
      );
    }

    if (maxLength && value.length > maxLength) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        `${fieldName} cannot contain more than ${maxLength} items`
      );
    }

    const validatedItems: T[] = [];

    for (let i = 0; i < value.length; i++) {
      try {
        const validatedItem = itemValidator(value[i], i);
        validatedItems.push(validatedItem);
      } catch (error) {
        if (error instanceof Error) {
          throw createError(
            ErrorCode.INVALID_INPUT,
            `${fieldName}[${i}]: ${error.message}`
          );
        }
        throw error;
      }
    }

    return validatedItems;
  }
}