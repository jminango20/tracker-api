export enum HistoryQueryType {
    DIRECT = 'DIRECT',     // Apenas eventos do asset específico
    INDIRECT = 'INDIRECT'  // Toda a árvore genealógica
}

export interface AssetHistoryQuery {
    assetId: string;
    type: HistoryQueryType;
    
    // Filtros opcionais
    fromDate?: Date;
    toDate?: Date;
    operations?: number[];       // 0, 1, 2, 3, 4, 5, 6, 7, 8
    maxDepth?: number;           // Profundidade máxima da árvore    
    // Paginação
    limit?: number;
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

export interface AssetGenealogy {
    parents: string[];  // Assets que geraram este         
    children: string[]; // Assets gerados por este         
    groups: string[];   // Groups relacionados        
    transformations: {
        from: string[];         // Transformado de
        to: string[];           // Transformado para
    };
    maxDepth: number;
}


export interface AssetHistoryResponse {
    // Identificação
    assetId: string;
    type: HistoryQueryType;
    
    // Eventos encontrados
    events: AssetHistoryEvent[];

    // Genealogia
    genealogy?: AssetGenealogy;
    
    executionTime: number;    
}


export const HISTORY_QUERY_LIMITS = {
    DEFAULT_LIMIT: 10,
    MAX_RESULTS: 1000
};