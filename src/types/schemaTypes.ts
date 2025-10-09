/**
 * Schema Status enum matching smart contract
 */
export enum SchemaStatus {
  ACTIVE = 0,
  DEPRECATED = 1,
  INACTIVE = 2,
}

/**
 * String representation of schema status for API responses
 */
export type SchemaStatusString = 'ACTIVE' | 'DEPRECATED' | 'INACTIVE';

/**
 * JSON Schema property definition
 */
export interface JsonSchemaProperty {
  type?: string | string[];
  description?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  items?: JsonSchemaProperty;
  enum?: unknown[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  [key: string]: unknown;
}

/**
 * Full JSON Schema structure
 */
export interface JsonSchema {
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
}

/**
 * DTO for creating a new schema (API Request)
 */
export interface CreateSchemaDto {
  schemaId: string;
  name: string;
  channelName: string;
  description?: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
}

/**
 * DTO for updating an existing schema (API Request)
 */
export interface UpdateSchemaDto {
  schemaId: string;
  channelName: string;
  properties: Record<string, JsonSchemaProperty>;  
  required?: string[];                             
  description?: string;                             
}

/**
 * DTO for setting schema status (API Request)
 */
export interface SetSchemaStatusDto {
  schemaId: string;
  version: number;
  channelName: string;
  status: SchemaStatusString;
}

/**
 * DTO for deprecating schema (API Request)
 */
export interface DeprecateSchemaDto {
  schemaId: string;
  channelName: string;
}

/**
 * DTO for inactivating schema (API Request)
 */
export interface InactivateSchemaDto {
  schemaId: string;
  version: number;
  channelName: string;
}

/**
 * DTO for schema info request (API Request)
 */
export interface GetSchemaInfoDto {
  channelName: string;
  schemaId: string;
}

/**
 * Schema entity from blockchain
 */
export interface SchemaEntity {
  id: string; // Original string ID
  name: string;
  version: number;
  dataHash: string;
  owner: string;
  channelName: string; // Original channel name
  status: SchemaStatusString;
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Full schema with JSON Schema data (from database)
 */
export interface SchemaWithData extends SchemaEntity {
  fullSchema: JsonSchema;
  schemaIdHash: string; // bytes32 hash
  channelNameHash: string; // bytes32 hash
  blockNumber: bigint;
  blockTimestamp: bigint;
  transactionHash: string;
  logIndex: number;
}

/**
 * Schema info summary
 */
export interface SchemaInfo {
  schemaId: string;
  channelName: string;
  latestVersion: number;
  activeVersion: number;
  hasActiveVersion: boolean;
}

/**
 * DTO for getting schema (flexible)
 */
export interface GetSchemaDto {
  schemaId: string;
  channelName: string;
  version?: number;
}

/**
 * Query params for getSchema
 */
export interface GetSchemaQuery {
  source?: 'database' | 'blockchain';
  validateIntegrity?: boolean;
}

/**
 * DTO for listing schemas
 */
export interface ListSchemasDto {
  channelName?: string;
  schemaId?: string; // Partial match
  status?: SchemaStatusString;
  page?: number;
  limit?: number;
}

/**
 * Response for list schemas
 */
export interface ListSchemasResponse {
  schemas: SchemaWithData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response for schema info
 */
export interface SchemaInfoResponse {
  schemaId: string;
  channelName: string;
  latestVersion: number;
  activeVersion: number;
  totalVersions: number;
  hasActiveVersion: boolean;
}

/**
 * Input for creating schema in service layer
 */
export interface CreateSchemaInput {
  schemaId: string;
  name: string;
  dataHash: string;
  channelName: string;
  description: string;
  fullSchemaData: JsonSchema;
}

/**
 * Input for updating schema in service layer
 */
export interface UpdateSchemaInput {
  schemaId: string;
  newDataHash: string;
  channelName: string;
  newDescription: string;
  fullSchemaData: JsonSchema;
}

/**
 * Schema data structure for smart contract
 */
export interface SchemaDataForContract {
  id: `0x${string}`; // bytes32
  name: string;
  dataHash: string;
  channelName: `0x${string}`; // bytes32
  description: string;
}

/**
 * Update schema data structure for smart contract
 */
export interface UpdateSchemaDataForContract {
  id: `0x${string}`; // bytes32
  newDataHash: `0x${string}`; // bytes32
  channelName: `0x${string}`; // bytes32
  description: string;
}

/**
 * Schema data returned from smart contract
 */
export interface SchemaFromContract {
  name: string;
  version: bigint;
  dataHash: string;
  owner: `0x${string}`;
  status: SchemaStatus; // enum value
  createdAt: bigint;
  updatedAt: bigint;
  description: string;
}

/**
 * SchemaCreated event data
 */
export interface SchemaCreatedEvent {
  eventName: 'SchemaCreated';
  args: {
    id: `0x${string}`; // bytes32
    name: string;
    version: bigint;
    owner: `0x${string}`;
    channelName: `0x${string}`; // bytes32
    timestamp: bigint;
  };
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
}

/**
 * SchemaUpdated event data
 */
export interface SchemaUpdatedEvent {
  eventName: 'SchemaUpdated';
  args: {
    id: `0x${string}`;
    newVersion: bigint;
    updater: `0x${string}`;
    channelName: `0x${string}`;
    timestamp: bigint;
  };
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
}

/**
 * Data for creating schema record in database
 */
export interface CreateSchemaRecord {
  schemaId: string;
  schemaIdHash: string;
  channelName: string;
  channelNameHash: string;
  version: number;
  name: string;
  dataHash: string;
  fullSchema: JsonSchema;
  description: string;
  owner: string;
  blockTimestamp: bigint;
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;
  status: SchemaStatusString;
}

/**
 * Query params for finding schema
 */
export interface FindSchemaParams {
  schemaId: string;
  channelName: string;
  version?: number;
}

/**
 * Success response for schema creation
 */
export interface CreateSchemaResponse {
  schemaId: string;
  schemaName: string;
  channelName: string;
  version: number;
  dataHash: string;
  transactionHash: string;
  blockNumber: string;
  gasUsed: string;
  message: string;
}

/**
 * Success response for schema update
 */
export interface UpdateSchemaResponse {
  schemaId: string;
  channelName: string;
  newDataHash: string;
  newVersion: number;
  transactionHash: string;
  blockNumber: string;
  gasUsed: string;
  message: string;
}

/**
 * Success response for status change operations
 */
export interface StatusChangeResponse {
  schemaId: string;
  version?: number;
  channelName: string;
  status: SchemaStatusString;
  transactionHash: string;
  blockNumber: string;
  gasUsed: string;
  message: string;
}

/**
 * Convert SchemaStatus enum to string
 */
export function schemaStatusToString(status: SchemaStatus): SchemaStatusString {
  switch (status) {
    case SchemaStatus.ACTIVE:
      return 'ACTIVE';
    case SchemaStatus.DEPRECATED:
      return 'DEPRECATED';
    case SchemaStatus.INACTIVE:
      return 'INACTIVE';
    default:
      throw new Error(`Unknown schema status: ${status}`);
  }
}

/**
 * Convert string to SchemaStatus enum
 */
export function stringToSchemaStatus(status: string): SchemaStatus {
  const upperStatus = status.toUpperCase();
  switch (upperStatus) {
    case 'ACTIVE':
      return SchemaStatus.ACTIVE;
    case 'DEPRECATED':
      return SchemaStatus.DEPRECATED;
    case 'INACTIVE':
      return SchemaStatus.INACTIVE;
    default:
      throw new Error(`Invalid schema status: ${status}`);
  }
}

/**
 * Type guard to check if status is valid
 */
export function isValidSchemaStatus(status: string): status is SchemaStatusString {
  return ['ACTIVE', 'DEPRECATED', 'INACTIVE'].includes(status.toUpperCase());
}