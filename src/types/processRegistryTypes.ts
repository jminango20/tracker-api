// Enums
export enum ProcessAction {
    CREATE_ASSET = 0,
    UPDATE_ASSET = 1,
    TRANSFER_ASSET = 2,
    SPLIT_ASSET = 3,
    GROUP_ASSET = 4,
    UNGROUP_ASSET = 5,
    TRANSFORM_ASSET = 6,
    INACTIVATE_ASSET = 7,
    CREATE_DOCUMENT = 8
}

export enum ProcessStatus {
    ACTIVE = 0,
    INACTIVE = 1
}

// Interfaces
export interface SchemaReference {
    schemaId: string;
    version: number;
}

export interface ProcessInput {
    processId: string;
    natureId: string;
    stageId: string;
    schemas: SchemaReference[];
    action: string; // String que será convertida para enum
    description: string;
    channelName: string;
}

export interface Process {
    processId: string;
    natureId: string;
    stageId: string;
    schemas: SchemaReference[];
    action: string;
    description: string;
    owner: string;
    channelName: string;
    status: string;
    createdAt: string;
    lastUpdated: string;
}