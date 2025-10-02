export enum HistoryQueryType {
    DIRECT = 'DIRECT',     // Apenas eventos do asset específico
    INDIRECT = 'INDIRECT'  // Toda a árvore genealógica
}

export interface AssetHistoryEvent {
    // Identificação do evento
    id: number;
    operation: string;
    assetId: string;
    
    // Assets envolvidos
    relatedAssetIds: string[];
    timestamp: Date;
    transactionHash: string;
    
    // Dados específicos
    owner: string;
    idLocal: string;
    amount: string;           
}

export interface AssetHistoryResponse {
    // Identificação
    assetId: string;
    mode: HistoryQueryType;
    description: string;
    totalEvents: number;
    events: AssetHistoryEvent[];   
}


export const HISTORY_QUERY_LIMITS = {
    DEFAULT_LIMIT: 10,
    MAX_RESULTS: 1000
};