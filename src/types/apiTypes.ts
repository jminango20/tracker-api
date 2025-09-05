export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ContractData {
    contractName: string;
    addressContract?: `0x${string}`;
    address?: `0x${string}` | null;
    isRegistered?: boolean;
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