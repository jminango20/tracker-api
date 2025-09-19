import { DatabaseService } from '../config/database';
import { 
    AssetHistoryQuery, 
    AssetHistoryResponse, 
    AssetHistoryEvent,
    AssetGenealogy,
    HistoryQueryType,
    RelationshipDirection,
    RawAssetEventRow,
    HISTORY_QUERY_LIMITS
} from '../types/assetHistoryTypes';
import { ApiResponse } from '../types/apiTypes';

export class AssetHistoryService {

    /**
     * Método principal para obter histórico de assets
     */
    async getAssetHistory(query: AssetHistoryQuery): Promise<ApiResponse<AssetHistoryResponse>> {
        const startTime = Date.now();
        
        try {
            console.log(`Buscando histórico do asset: ${query.assetId} (${query.type})`);

            // 1. Validar query
            const validation = this.validateQuery(query);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error!
                };
            }

            // 2. Executar query baseada no tipo
            let events: AssetHistoryEvent[] = [];
            let genealogy: AssetGenealogy | undefined;
            let queriesExecuted = 0;

            if (query.type === HistoryQueryType.DIRECT) {
                const result = await this.getDirectHistory(query);
                events = result.events;
                queriesExecuted = 1;
            } else {
                const result = await this.getIndirectHistory(query);
                events = result.events;
                genealogy = result.genealogy;
                queriesExecuted = result.queriesExecuted;
            }

            // 3. Calcular estatísticas
            const statistics = this.calculateStatistics(events);
            
            // 4. Montar resposta
            const response: AssetHistoryResponse = {
                assetId: query.assetId,
                type: query.type,
                events,
                totalEvents: events.length,
                genealogy,
                query: {
                    filters: query,
                    executionTime: Date.now() - startTime,
                    queriesExecuted
                },
                statistics
            };

            console.log(`Histórico obtido: ${events.length} eventos em ${response.query.executionTime}ms`);

            return {
                success: true,
                data: response,
                message: `Histórico obtido com sucesso: ${events.length} eventos encontrados`
            };

        } catch (error) {
            console.error('Erro ao obter histórico do asset:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido ao obter histórico'
            };
        }
    }

    /**
     * Obter histórico DIRECT (apenas eventos do asset específico)
     */
    private async getDirectHistory(query: AssetHistoryQuery): Promise<{ events: AssetHistoryEvent[] }> {
        console.log(`Executando query DIRECT para asset: ${query.assetId} no canal: ${query.channelName}`);

        let sqlQuery = `
            SELECT 
                id,
                "blockNumber",
                "transactionHash",
                "logIndex",
                "primaryAssetId",
                "channelName",
                operation,
                "relatedAssetIds",
                "secondaryAssetId",
                "eventData",
                timestamp,
                owner,
                "createdAt"
            FROM asset_events 
            WHERE "primaryAssetId" = $1
                AND "channelName" = $2
        `;

        const queryParams: any[] = [query.assetId, query.channelName];
        let paramIndex = 3;

        // Adicionar filtros opcionais
        if (query.fromDate) {
            sqlQuery += ` AND timestamp >= $${paramIndex}`;
            queryParams.push(query.fromDate);
            paramIndex++;
        }

        if (query.toDate) {
            sqlQuery += ` AND timestamp <= $${paramIndex}`;
            queryParams.push(query.toDate);
            paramIndex++;
        }

        if (query.operations && query.operations.length > 0) {
            sqlQuery += ` AND operation = ANY($${paramIndex})`;
            queryParams.push(query.operations);
            paramIndex++;
        }

        // Ordenação e paginação
        sqlQuery += ` ORDER BY timestamp ASC, "blockNumber" ASC, "logIndex" ASC`;
        
        if (query.limit) {
            sqlQuery += ` LIMIT $${paramIndex}`;
            queryParams.push(query.limit);
            paramIndex++;
        }

        if (query.offset) {
            sqlQuery += ` OFFSET $${paramIndex}`;
            queryParams.push(query.offset);
        }

        console.log(`SQL Query: ${sqlQuery.substring(0, 120)}...`);

        const result = await DatabaseService.query(sqlQuery, queryParams);
        const events = this.mapRowsToEvents(result.rows);
        const filteredEvents = this.filterRedundantEvents(events);

        console.log(`Query DIRECT concluída: ${events.length} eventos encontrados`);

        return { events: filteredEvents };
    }

    /**
     * Obter histórico INDIRECT (árvore genealógica completa)
     */
    private async getIndirectHistory(query: AssetHistoryQuery): Promise<{
        events: AssetHistoryEvent[];
        genealogy: AssetGenealogy;
        queriesExecuted: number;
    }> {
        console.log(`Executando query INDIRECT para asset: ${query.assetId}`);

        let queriesExecuted = 0;

        // 1. Buscar todos os assets relacionados usando CTE recursiva
        const relatedAssets = await this.findRelatedAssets(query.assetId, query.maxDepth || 5);
        queriesExecuted++;

        console.log(`Assets relacionados encontrados: ${relatedAssets.length}`);

        // 2. Buscar eventos de todos os assets relacionados
        const events = await this.getEventsForAssets(relatedAssets, query);
        queriesExecuted++;

        // 3. Construir genealogia
        const genealogy = await this.buildGenealogy(query.assetId);
        queriesExecuted++;

        console.log(`Query INDIRECT concluída: ${events.length} eventos de ${relatedAssets.length} assets`);

        return {
            events,
            genealogy,
            queriesExecuted
        };
    }

    /**
     * Encontrar todos os assets relacionados usando CTE recursiva 
     */
    private async findRelatedAssets(assetId: string, maxDepth: number): Promise<string[]> {
        const sqlQuery = `
            WITH RECURSIVE asset_graph AS (
                -- Caso base: asset consultado
                SELECT "primaryAssetId" as asset_id, 0 as depth
                FROM asset_events 
                WHERE "primaryAssetId" = $1
                
                UNION
                
                -- Recursão: buscar relacionamentos através de secondaryAssetId
                SELECT 
                    CASE 
                        WHEN e."primaryAssetId" = ag.asset_id THEN e."secondaryAssetId"
                        WHEN e."secondaryAssetId" = ag.asset_id THEN e."primaryAssetId"
                    END as asset_id,
                    CASE
                        WHEN e."primaryAssetId" = ag.asset_id THEN ag.depth - 1  -- pai
                        WHEN e."secondaryAssetId" = ag.asset_id THEN ag.depth + 1  -- filho
                    END as depth
                FROM asset_events e, asset_graph ag
                WHERE (e."primaryAssetId" = ag.asset_id OR e."secondaryAssetId" = ag.asset_id)
                AND e."secondaryAssetId" IS NOT NULL
                AND e."secondaryAssetId" != '0x0000000000000000000000000000000000000000000000000000000000000000'
                AND ag.depth BETWEEN $2 AND $3
            )
            SELECT DISTINCT asset_id 
            FROM asset_graph 
            WHERE asset_id IS NOT NULL
            ORDER BY asset_id;
        `;

        const result = await DatabaseService.query(sqlQuery, [assetId, -maxDepth, maxDepth]);
        return result.rows.map((row: any) => row.asset_id);
    }

    /**
     * Buscar eventos para uma lista de assets
     */
    private async getEventsForAssets(assetIds: string[], query: AssetHistoryQuery): Promise<AssetHistoryEvent[]> {
        if (assetIds.length === 0) return [];

        let sqlQuery = `
            SELECT 
                id,
                "blockNumber",
                "transactionHash",
                "logIndex",
                "primaryAssetId",
                "channelName",
                operation,
                "relatedAssetIds",
                "secondaryAssetId",
                "eventData",
                timestamp,
                owner,
                "createdAt"
            FROM asset_events 
            WHERE "primaryAssetId" = ANY($1)
        `;

        const queryParams: any[] = [assetIds];
        let paramIndex = 2;

        // Aplicar filtros
        if (query.fromDate) {
            sqlQuery += ` AND timestamp >= $${paramIndex}`;
            queryParams.push(query.fromDate);
            paramIndex++;
        }

        if (query.toDate) {
            sqlQuery += ` AND timestamp <= $${paramIndex}`;
            queryParams.push(query.toDate);
            paramIndex++;
        }

        if (query.operations && query.operations.length > 0) {
            sqlQuery += ` AND operation = ANY($${paramIndex})`;
            queryParams.push(query.operations);
            paramIndex++;
        }

        sqlQuery += ` ORDER BY timestamp ASC, "blockNumber" ASC, "logIndex" ASC`;
        
        // Aplicar limite global
        const limit = Math.min(query.limit || HISTORY_QUERY_LIMITS.DEFAULT_LIMIT, HISTORY_QUERY_LIMITS.MAX_RESULTS);
        sqlQuery += ` LIMIT ${limit}`;

        const result = await DatabaseService.query(sqlQuery, queryParams);
        return this.mapRowsToEvents(result.rows);
    }

    /**
     * Construir informações de genealogia
     */
    private async buildGenealogy(assetId: string): Promise<AssetGenealogy> {
        const sqlQuery = `
            WITH relationships AS (
                -- Parents: secondaryAssetId são os pais
                SELECT DISTINCT "secondaryAssetId" as related_asset, 'parent' as rel_type
                FROM asset_events 
                WHERE "primaryAssetId" = $1 AND "secondaryAssetId" IS NOT NULL
                
                UNION
                
                -- Children: assets que têm este como secondaryAssetId
                SELECT DISTINCT "primaryAssetId" as related_asset, 'child' as rel_type
                FROM asset_events 
                WHERE "secondaryAssetId" = $1
                
                UNION
                
                -- Related assets via array
                SELECT DISTINCT unnest("relatedAssetIds") as related_asset, 'related' as rel_type
                FROM asset_events 
                WHERE "primaryAssetId" = $1 
                AND "relatedAssetIds" IS NOT NULL
                AND array_length("relatedAssetIds", 1) > 0
            )
            SELECT 
                rel_type,
                array_agg(DISTINCT related_asset) as assets
            FROM relationships 
            WHERE related_asset IS NOT NULL AND related_asset != ''
            GROUP BY rel_type;
        `;

        const result = await DatabaseService.query(sqlQuery, [assetId]);
        
        const genealogy: AssetGenealogy = {
            parents: [],
            children: [],
            siblings: [],
            components: [],
            groups: [],
            transformations: { from: [], to: [] }
        };

        for (const row of result.rows) {
            switch (row.rel_type) {
                case 'parent':
                    genealogy.parents = row.assets;
                    break;
                case 'child':
                    genealogy.children = row.assets;
                    break;
                case 'related':
                    genealogy.siblings = row.assets;
                    break;
            }
        }

        return genealogy;
    }

    /**
     * Mapear linhas do banco para eventos
     */
    private mapRowsToEvents(rows: any[]): AssetHistoryEvent[] {
        return rows.map(row => ({
            id: row.id,
            eventName: row.eventName || this.deriveEventNameFromOperation(row.operation),
            operation: row.operation,
            primaryAssetId: row.primaryAssetId,
            secondaryAssetId: row.secondaryAssetId,
            relatedAssetIds: row.relatedAssetIds || [],
            timestamp: row.timestamp,
            blockNumber: row.blockNumber?.toString() || '0',
            transactionHash: row.transactionHash,
            owner: row.owner,
            amounts: this.extractAmounts(row.eventData),
            eventData: row.eventData,
            relationshipType: undefined,
            depthLevel: undefined
        }));
    }

    /**
     * Derivar nome do evento baseado na operação
     */
    private deriveEventNameFromOperation(operation: string): string {
        const mapping: Record<string, string> = {
            'CREATE': 'AssetCreated',
            'UPDATE': 'AssetUpdated', 
            'TRANSFER': 'AssetTransferred',
            'SPLIT': 'AssetSplit',
            'GROUP': 'AssetsGrouped',
            'UNGROUP': 'AssetsUngrouped',
            'TRANSFORM': 'AssetTransformed',
            'INACTIVATE': 'AssetInactivated',
            'LINEAGE': 'AssetLineage',           
            'STATE_CHANGED': 'AssetStateChanged'
        };
        
        return mapping[operation] || operation;
    }

    private filterRedundantEvents(events: AssetHistoryEvent[]): AssetHistoryEvent[] {
        return events.filter(event => {
            if (event.operation === 'LINEAGE') {
                const hasMainEvent = events.some(e => 
                    e.transactionHash === event.transactionHash && 
                    e.operation !== 'LINEAGE' &&
                    ['CREATE', 'TRANSFORM', 'SPLIT', 'GROUP', 'UNGROUP'].includes(e.operation)
                );
                return !hasMainEvent;
            }
            
            if (event.operation === 'STATE_CHANGED') {
                const hasUpdate = events.some(e => 
                    e.transactionHash === event.transactionHash && 
                    e.operation === 'UPDATE'
                );
                return !hasUpdate; // Remove STATE_CHANGED se há UPDATE
            }
            
            return true;
        });
    }

    /**
     * Extrair amounts dos dados do evento
     */
    private extractAmounts(eventData: any): string[] {
        if (!eventData) return [];
        
        const amounts: string[] = [];
        
        // Amount principal (CREATE, etc.)
        if (eventData.amount !== undefined) {
            amounts.push(eventData.amount.toString());
        }
        
        // New amount (UPDATE, TRANSFER, etc.)
        if (eventData.newAmount !== undefined) {
            amounts.push(eventData.newAmount.toString());
        }
        
        // Previous amount (para histórico completo)
        if (eventData.previousAmount !== undefined && eventData.previousAmount !== eventData.newAmount) {
            amounts.unshift(eventData.previousAmount.toString()); // Adiciona no início
        }
        
        // Split amounts
        if (eventData.metadata?.splitAmounts) {
            amounts.push(...eventData.metadata.splitAmounts.map((a: any) => a.toString()));
        }
        
        // Total amount para groups
        if (eventData.metadata?.totalAmount) {
            amounts.push(eventData.metadata.totalAmount.toString());
        }
        
        return amounts;
    }

    /**
     * Calcular estatísticas dos eventos
     */
    private calculateStatistics(events: AssetHistoryEvent[]) {
        const eventsByOperation: Record<string, number> = {};
        const uniqueOwners = new Set<string>();
        let firstEvent: Date | undefined;
        let lastEvent: Date | undefined;

        for (const event of events) {
            // Contar por operação
            eventsByOperation[event.operation] = (eventsByOperation[event.operation] || 0) + 1;
            
            // Owners únicos
            if (event.owner) {
                uniqueOwners.add(event.owner);
            }
            
            // Range temporal
            if (!firstEvent || event.timestamp < firstEvent) {
                firstEvent = event.timestamp;
            }
            if (!lastEvent || event.timestamp > lastEvent) {
                lastEvent = event.timestamp;
            }
        }

        // Contar assets únicos na árvore
        const uniqueAssets = new Set<string>();
        for (const event of events) {
            uniqueAssets.add(event.primaryAssetId);
            if (event.secondaryAssetId) {
                uniqueAssets.add(event.secondaryAssetId);
            }
            event.relatedAssetIds.forEach(id => uniqueAssets.add(id));
        }

        return {
            eventsByOperation,
            timeRange: {
                firstEvent,
                lastEvent
            },
            uniqueOwners: uniqueOwners.size,
            totalAssetsInTree: uniqueAssets.size
        };
    }

    /**
     * Validar query de entrada
     */
    private validateQuery(query: AssetHistoryQuery): { isValid: boolean; error?: string } {
        // Validar asset ID
        if (!query.assetId || query.assetId.trim() === '') {
            return { isValid: false, error: 'Asset ID é obrigatório' };
        }

        // Validar tipo
        if (!Object.values(HistoryQueryType).includes(query.type)) {
            return { isValid: false, error: 'Tipo de consulta inválido. Use DIRECT ou INDIRECT' };
        }

        return { isValid: true };
    }

    /**
     * Verificar se um asset existe
     */
    async assetExists(assetId: string): Promise<boolean> {
        try {
            const result = await DatabaseService.query(
                'SELECT 1 FROM asset_events WHERE "primaryAssetId" = $1 LIMIT 1',
                [assetId]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar existência do asset:', error);
            return false;
        }
    }
}