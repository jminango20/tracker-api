export enum HistoryQueryType {
    DIRECT = 'DIRECT',     // Apenas eventos do asset específico
    INDIRECT = 'INDIRECT'  // Toda a árvore genealógica
}

export enum RelationshipDirection {
    PARENT = 'PARENT',         // Asset que originou este
    CHILD = 'CHILD',           // Asset criado a partir deste
    SIBLING = 'SIBLING',       // Assets do mesmo pai
    COMPONENT = 'COMPONENT',   // Assets agrupados neste
    GROUP = 'GROUP'            // Asset que agrupa este
}

export interface AssetHistoryQuery {
    assetId: string;
    type: HistoryQueryType;
    
    // Filtros opcionais
    fromDate?: Date;
    toDate?: Date;
    operations?: string[];       // Filtrar por tipos de operação
    includeInactive?: boolean;   // Incluir assets inativos
    maxDepth?: number;           // Profundidade máxima da árvore
    
    // Paginação
    limit?: number;
    offset?: number;
}

export interface AssetHistoryEvent {
    // Identificação do evento
    id: number;
    eventName: string;
    operation: string;
    
    // Assets envolvidos
    primaryAssetId: string;
    secondaryAssetId?: string;
    relatedAssetIds: string[];
    
    // Metadados
    channelName: string;
    timestamp: Date;
    blockNumber: string;
    transactionHash: string;
    
    // Dados específicos
    owner?: string;
    amounts: string[];           // BigInt como string
    eventData: any;
    
    // Relacionamento (para INDIRECT)
    relationshipType?: RelationshipDirection;
    depthLevel?: number;         // Distância do asset consultado
}

export interface AssetGenealogy {
    parents: string[];           
    children: string[];          
    siblings: string[];          
    components: string[];        
    groups: string[];           
    transformations: {
        from: string[];         
        to: string[];           
    };
}


export interface AssetHistoryResponse {
    // Identificação
    assetId: string;
    type: HistoryQueryType;
    
    // Eventos encontrados
    events: AssetHistoryEvent[];
    totalEvents: number;
    
    // Genealogia
    genealogy?: AssetGenealogy;
    
    // Metadados da consulta
    query: {
        filters: AssetHistoryQuery;
        executionTime: number;    
        queriesExecuted: number;
    };
    
    // Estatísticas
    statistics: {
        eventsByOperation: Record<string, number>;
        timeRange: {
            firstEvent?: Date;
            lastEvent?: Date;
        };
        uniqueOwners: number;
        totalAssetsInTree: number;
    };
}

// ========================================
// TIPOS INTERNOS PARA PROCESSAMENTO
// ========================================
export interface RelationshipMapping {
    assetId: string;
    relatedAssetId: string;
    relationshipType: RelationshipDirection;
    eventId: number;
    timestamp: Date;
}

export interface AssetTreeNode {
    assetId: string;
    level: number;              // Distância do asset raiz
    direction: 'up' | 'down';   // up = ancestors, down = descendants
    relationshipType: RelationshipDirection;
    parentEventId?: number;     // Evento que criou esta relação
}

// ========================================
// CONFIGURAÇÕES DE PERFORMANCE
// ========================================
export interface QueryPerformanceConfig {
    maxDepth: number;           // Profundidade máxima da árvore
    maxResults: number;         // Máximo de eventos retornados
    timeoutMs: number;          // Timeout da consulta
    enableCache: boolean;       // Usar cache de resultados
}

// ========================================
// TIPOS PARA CACHE
// ========================================
export interface CachedAssetHistory {
    assetId: string;
    type: HistoryQueryType;
    data: AssetHistoryResponse;
    cachedAt: Date;
    expiresAt: Date;
}

// ========================================
// RESULTADO DE CONSULTA SQL
// ========================================
export interface RawAssetEventRow {
    id: number;
    block_number: string;
    transaction_hash: string;
    log_index: number;
    asset_id: string;
    channel_name: string;
    operation_type: string;
    parent_asset_ids: string[];
    child_asset_ids: string[];
    event_data: any;
    block_timestamp: Date;
    operator_address: string;
    created_at: Date;
    
    // Campos adicionais para genealogia
    relationship_type?: string;
    depth_level?: number;
    is_direct_event?: boolean;
}

// ========================================
// VALIDAÇÕES
// ========================================
export const HISTORY_QUERY_LIMITS = {
    MAX_DEPTH: 10,
    MAX_RESULTS: 1000,
    DEFAULT_LIMIT: 100,
    TIMEOUT_MS: 30000
} as const;

export const SUPPORTED_OPERATIONS = [
    'CREATE',
    'UPDATE', 
    'TRANSFER',
    'SPLIT',
    'GROUP',
    'UNGROUP',
    'TRANSFORM',
    'INACTIVATE'
] as const;