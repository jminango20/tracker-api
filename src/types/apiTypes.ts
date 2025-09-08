export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface TransactionData {
    contractName: string;
    newAddress: string;
    transactionHash: `0x${string}`;
    blockNumber?: string;
    gasUsed?: string;
    message: string;
}

/**
 * Contrato de endereço
 */
export interface ContractData {
    contractName: string;
    addressContract?: `0x${string}`;
    address?: `0x${string}` | null;
    isRegistered?: boolean;
    message?: string;
}

/**
 * Informações de um canal
 */
export interface ChannelInfo {
    channelName: string;
    exists: boolean;
    isActive: boolean;
    creator: string;
    memberCount: number;
    createdAt: string;
}

export interface ChannelMembersPaginated {
    channelName: string;
    members: string[];
    totalMembers: number;
    totalPages: number;
    hasNextPage: boolean;
    page: number;
    pageSize: number;
}

export interface ChannelsList {
    channels: string[];
    totalChannels: number;
    totalPages: number;
    hasNextPage: boolean;
    page: number;
    pageSize: number;
}

/*
SCHEMA Interfaces
*/
export enum SchemaStatus {
    ACTIVE = 0,
    DEPRECATED = 1,
    INACTIVE = 2
}

// Interfaces para o SchemaRegistry
export interface SchemaInput {
    id: string;
    name: string;
    dataHash: string;
    channelName: string;
    description: string;
}

export interface SchemaUpdateInput {
    id: string;
    newDataHash: string;
    channelName: string;
    description: string;
}

export interface Schema {
    id: string;
    name: string;
    version: number;
    dataHash: string;
    owner: string;
    channelName: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    description: string;
}
