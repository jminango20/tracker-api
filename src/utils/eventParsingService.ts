import { keccak256, parseAbiItem, toHex, decodeEventLog, decodeAbiParameters } from 'viem';

export class EventParsingService {
    private assetRegistryAddress: string;

    private readonly ACTION_EVENT_CONFIG = {
        'CREATE_ASSET': {
            eventType: 'AssetCreated',
            extractAssetIds: (args: any) => [args.assetId],
            extractData: (args: any) => ({
                assetLocation: args.location,
                assetAmount: Number(args.amount),
                assetOwner: args.owner
            })
        },
        'UPDATE_ASSET': {
            eventType: 'AssetUpdated',
            extractAssetIds: (args: any) => [], // Update não cria novos assets
            extractData: (args: any) => ({
                updatedLocation: args.newLocation,
                updatedAmount: Number(args.newAmount)
            })
        },
        'TRANSFER_ASSET': {
            eventType: 'AssetTransferred',
            extractAssetIds: (args: any) => [], // Transfer não cria novos assets
            extractData: (args: any) => ({
                transfer: {
                    fromOwner: args.fromOwner,
                    toOwner: args.toOwner,
                    fromLocation: args.previousLocation,
                    toLocation: args.newLocation,
                    fromAmount: Number(args.previousAmount),
                    toAmount: Number(args.newAmount)
                }
            })
        },
        'SPLIT_ASSET': {
            eventType: 'AssetSplit',
            extractAssetIds: (args: any) => args.newAssetIds,
            extractData: (args: any) => ({
                splitAmounts: args.amounts.map((amt: any) => Number(amt)),
                totalNewAssets: args.newAssetIds.length
            })
        },
        'GROUP_ASSET': {
            eventType: 'AssetsGrouped',
            extractAssetIds: (args: any) => [args.groupAssetId],
            extractData: (args: any) => ({
                groupedAssetIds: args.originalAssetIds,
                totalGroupedAssets: args.originalAssetIds.length,
                totalAmount: Number(args.totalAmount)
            })
        },
        'UNGROUP_ASSET': {
            eventType: 'AssetsUngrouped',
            extractAssetIds: (args: any) => args.originalAssetIds, // Assets que voltaram a ser ativos
            extractData: (args: any) => ({
                reactivatedAssetIds: args.originalAssetIds,
                totalReactivatedAssets: args.originalAssetIds.length
            })
        },
        'TRANSFORM_ASSET': {
            eventType: 'AssetTransformed',
            extractAssetIds: (args: any) => [args.newAssetId],
            extractData: (args: any) => ({
                transformationType: 'FULL_TRANSFORMATION'
            })
        },
        'INACTIVATE_ASSET': {
            eventType: 'AssetInactivated',
            extractAssetIds: (args: any) => [], // Inativação não cria novos assets
            extractData: (args: any) => ({
                operation: Number(args.operation)
            })
        }
    } as const;

    constructor(assetRegistryAddress: string) {
        this.assetRegistryAddress = assetRegistryAddress.toLowerCase();
    }

    /**
     * Parse eventos específicos baseado na action do processo
     */
    parseTransactionEvents(receipt: any, action: string) {
        console.log('Parsing Process for Action:', action);
        
        const events = [];
        const newAssetIds = [];
        let operationData = {};

        const assetRegistryLogs = receipt.logs.filter((log: any) => 
            log.address.toLowerCase() === this.assetRegistryAddress
        );

        console.log('AssetRegistry logs found:', assetRegistryLogs.length);

        for (const log of assetRegistryLogs) {
            try {
                const parsedEvent = this.parseAssetRegistryLog(log, action);
                
                if (parsedEvent) {
                    events.push(parsedEvent);
                    
                    const assetIds = this.extractAssetIdsFromEvent(parsedEvent, action);
                    
                    newAssetIds.push(...assetIds);
                    
                    const eventData = this.extractOperationDataFromEvent(parsedEvent, action);
                    operationData = { ...operationData, ...eventData };
                }
            } catch (error) {
                console.log('Error parsing log:', error);
                continue;
            }
        }

        return {
            events,
            newAssetIds: [...new Set(newAssetIds)],
            operationData
        };
    }

    private parseAssetRegistryLog(log: any, action: string) {
        switch (action) {
            case 'CREATE_ASSET':
                return this.parseAssetCreatedEvent(log);
            case 'UPDATE_ASSET':
                return this.parseAssetUpdatedEvent(log);
            case 'TRANSFER_ASSET':
                return this.parseAssetTransferredEvent(log);
            case 'SPLIT_ASSET':
                return this.parseAssetSplitEvent(log);
            case 'GROUP_ASSET':
                return this.parseAssetsGroupedEvent(log);
            case 'TRANSFORM_ASSET':
                return this.parseAssetTransformedEvent(log);
            case 'UNGROUP_ASSET':
                return this.parseAssetsUngroupedEvent(log);
            case 'INACTIVATE_ASSET':
                return this.parseAssetInactivatedEvent(log);
            default:
                return null;
        }
    }

    /**
     * Parse evento AssetCreated
     */
    private parseAssetCreatedEvent(log: any) {
        try {
            const assetCreatedAbi = parseAbiItem(
                'event AssetCreated(bytes32 indexed channelName, bytes32 indexed assetId, address indexed owner, string location, uint256 amount, uint256 timestamp)'
            );

            const decoded = decodeEventLog({
                abi: [assetCreatedAbi],
                data: log.data,
                topics: log.topics,
            });

            return {
                assetData: { 
                    assetId: decoded.args.assetId,
                    owner: decoded.args.owner,
                    location: decoded.args.location,
                    amount: Number(decoded.args.amount),
                    timestamp: Number(decoded.args.timestamp)
                },
                message: `Asset ${decoded.args.assetId} created`
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Parse evento AssetUpdated
     */
    private parseAssetUpdatedEvent(log: any) {
        try {
            const assetUpdatedAbi = parseAbiItem(
                'event AssetUpdated(bytes32 indexed channelName, bytes32 indexed assetId, address indexed owner, uint256 newAmount, string newLocation, uint256 timestamp)'
            );

            const decoded = decodeEventLog({
                abi: [assetUpdatedAbi],
                data: log.data,
                topics: log.topics,
            });

            return {
                assetData: {
                    assetId: decoded.args.assetId,
                    owner: decoded.args.owner,
                    location: decoded.args.newLocation,
                    amount: Number(decoded.args.newAmount),
                    timestamp: Number(decoded.args.timestamp)
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Parse evento AssetSplit
     */
    private parseAssetSplitEvent(log: any) {
        try {

            const expectedSignature = this.getEventSignature(
                'AssetSplit(bytes32,bytes32,bytes32[],address,uint256[],uint256)'
            );

            if (log.topics[0] !== expectedSignature) {
                return null;
            }

            const channelName = log.topics[1];
            const originalAssetId = log.topics[2];
            const owner = log.topics[3];

            const decodedData = decodeAbiParameters(
                [
                    { type: 'bytes32[]', name: 'newAssetIds' },
                    { type: 'uint256[]', name: 'amounts' }, 
                    { type: 'uint256', name: 'timestamp' }
                ],
                log.data
            );

            const [newAssetIds, amounts, timestamp] = decodedData;

            return {
                assetData: {
                    originalAssetId,
                    newAssetIds,
                    amounts: amounts.map((amt: any) => Number(amt)),
                    owner,
                    timestamp: Number(timestamp)
                }
            };
        } catch (error) {           
            return null;
        }
    }

    /**
     * Parse evento AssetsGrouped
     */
    private parseAssetsGroupedEvent(log: any) {
        try {
            const assetsGroupedAbi = parseAbiItem(
                'event AssetsGrouped(bytes32 indexed channelName, bytes32[] originalAssetIds, bytes32 indexed groupAssetId, address indexed owner, uint256 totalAmount, uint256 timestamp)'
            );

            const decoded = decodeEventLog({
                abi: [assetsGroupedAbi],
                data: log.data,
                topics: log.topics,
            });

            return {
                assetData: {
                    originalAssetIds: decoded.args.originalAssetIds,
                    groupAssetId: decoded.args.groupAssetId,
                    owner: decoded.args.owner,
                    totalAmount: Number(decoded.args.totalAmount),
                    timestamp: Number(decoded.args.timestamp)
                }
            };
        } catch (error) {;
            return null;
        }
    }

    /**
     * Parse evento AssetTransferred
     */
    private parseAssetTransferredEvent(log: any) {
        try {
            const assetTransferredAbi = parseAbiItem(
                'event AssetTransferred(bytes32 indexed channelName, bytes32 indexed assetId, address indexed fromOwner, address toOwner, string previousLocation, string newLocation, uint256 previousAmount, uint256 newAmount, uint256 timestamp)'
            );

            const decoded = decodeEventLog({
                abi: [assetTransferredAbi],
                data: log.data,
                topics: log.topics,
            });

            return {
                assetData: {
                    assetId: decoded.args.assetId,
                    fromOwner: decoded.args.fromOwner,
                    toOwner: decoded.args.toOwner,
                    previousLocation: decoded.args.previousLocation,
                    newLocation: decoded.args.newLocation,
                    previousAmount: Number(decoded.args.previousAmount),
                    newAmount: Number(decoded.args.newAmount),
                    timestamp: Number(decoded.args.timestamp)
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Parse evento AssetTransformed
     */
    private parseAssetTransformedEvent(log: any) {
        try {
            const assetTransformedAbi = parseAbiItem(
                'event AssetTransformed(bytes32 indexed channelName, bytes32 indexed originalAssetId, bytes32 indexed newAssetId, address owner, uint256 timestamp)'
            );

            const decoded = decodeEventLog({
                abi: [assetTransformedAbi],
                data: log.data,
                topics: log.topics,
            });

            return {
                assetData: {
                    originalAssetId: decoded.args.originalAssetId,
                    newAssetId: decoded.args.newAssetId,
                    owner: decoded.args.owner,
                    timestamp: Number(decoded.args.timestamp)
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Parse evento AssetsUngrouped
     */
    private parseAssetsUngroupedEvent(log: any) {
        try {
            const assetsUngroupedAbi = parseAbiItem(
                'event AssetsUngrouped(bytes32 indexed channelName, bytes32 indexed groupAssetId, bytes32[] originalAssetIds, address indexed owner, uint256 timestamp)'
            );

            const decoded = decodeEventLog({
                abi: [assetsUngroupedAbi],
                data: log.data,
                topics: log.topics,
            });

            return {
                assetData: {
                    groupAssetId: decoded.args.groupAssetId,
                    originalAssetIds: decoded.args.originalAssetIds,
                    owner: decoded.args.owner,
                    timestamp: Number(decoded.args.timestamp)
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Parse evento AssetInactivated
     */
    private parseAssetInactivatedEvent(log: any) {
        try {
            const assetInactivatedAbi = parseAbiItem(
                'event AssetInactivated(bytes32 indexed channelName, bytes32 indexed assetId, address indexed owner, uint8 operation, uint256 timestamp)'
            );

            const decoded = decodeEventLog({
                abi: [assetInactivatedAbi],
                data: log.data,
                topics: log.topics,
            });

            return {
                assetData: { 
                    assetId: decoded.args.assetId,
                    owner: decoded.args.owner,
                    lastOperation: Number(decoded.args.operation),
                    timestamp: Number(decoded.args.timestamp)
                }
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Extrair asset IDs de um evento baseado na action
     */
    private extractAssetIdsFromEvent(event: any, action: string): string[] {
        const config = this.ACTION_EVENT_CONFIG[action as keyof typeof this.ACTION_EVENT_CONFIG];
        if (config && event.type === config.eventType) {
            return config.extractAssetIds(event.args);
        }
        return [];
    }

    /**
     * Extrair dados específicos da operação de um evento
     */
    private extractOperationDataFromEvent(event: any, action: string): any {
        const config = this.ACTION_EVENT_CONFIG[action as keyof typeof this.ACTION_EVENT_CONFIG];
        if (config && event.type === config.eventType) {
            return config.extractData(event.args);
        }
    }

    private getEventSignature(eventAbi: string): string {
        return keccak256(toHex(eventAbi));
    }
}