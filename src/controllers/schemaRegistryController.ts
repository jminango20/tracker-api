import { Request, Response } from 'express';
import { SchemaRegistryService } from '../services/schemaRegistryService';
import { SchemaValidator } from '../validators/schemaValidator';
import { ResponseHelper } from '../utils/responseHelper';
import { isValidSchema, generateSchemaHash } from '../utils/schemaUtils';
import { AppError, ErrorCode, createError } from '../errors/definitions';

export class SchemaRegistryController {
    private schemaRegistryService: SchemaRegistryService;

    constructor() {
        this.schemaRegistryService = new SchemaRegistryService();
    }

    private extractPrivateKey(req: Request): string {
    const privateKey = req.headers['x-private-key'];

    if (!privateKey) {
      throw createError(
        ErrorCode.INVALID_PRIVATE_KEY,
        'Private key header (x-private-key) is required'
      );
    }

    return SchemaValidator.validatePrivateKey(privateKey);
  }

    // Criar schema
    async createSchema(req: Request, res: Response) {
        try {
          
            const privateKey = this.extractPrivateKey(req);

            const dto = SchemaValidator.validateCreateSchemaDto(req.body);

            await isValidSchema({
                properties: dto.properties,
                required: dto.required || [],
            });

            const dataHash = generateSchemaHash({
                properties: dto.properties,
                required: dto.required || [],
            });

            console.log(`Validation passed - Creating schema: ${dto.name} in channel: ${dto.channelName}`);
            console.log(`Hash generated: ${dataHash.substring(0, 10)}...`);

            const result = await this.schemaRegistryService.createSchema(
                {
                schemaId: dto.schemaId,
                name: dto.name,
                dataHash,
                channelName: dto.channelName,
                description: dto.description || '',
                fullSchemaData: {
                    properties: dto.properties,
                    required: dto.required || [],
                },
                },
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message, 201);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    // Atualizar schema
    async updateSchema(req: Request, res: Response) {
        try {
            const privateKey = this.extractPrivateKey(req);

            const dto = SchemaValidator.validateUpdateSchemaDto(req.body);

            await isValidSchema({
                properties: dto.properties,
                required: dto.required || [],
            });

            const newDataHash = generateSchemaHash({
                properties: dto.properties,
                required: dto.required || [],
            });

            console.log(
                `Validation passed - Updating schema: ${dto.schemaId} in channel: ${dto.channelName}`
            );
            console.log(`New hash generated: ${newDataHash.substring(0, 10)}...`);


            const result = await this.schemaRegistryService.updateSchema(
                {
                    schemaId: dto.schemaId.trim(),
                    newDataHash: newDataHash,
                    channelName: dto.channelName.trim(),
                    newDescription: dto.description?.trim() || '',
                    fullSchemaData: {
                        properties: dto.properties,
                        required: dto.required || [],
                    },
                },
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller updateSchema:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Depreciar schema
    async deprecateSchema(req: Request, res: Response) {
        try {
            const privateKey = this.extractPrivateKey(req);

            const dto = SchemaValidator.validateDeprecateSchemaDto(req.body);

            console.log(`Deprecating schema: ${dto.schemaId} in channel: ${dto.channelName}`);

            const result = await this.schemaRegistryService.deprecateSchema(
                dto.schemaId,
                dto.channelName,
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    // Inativar schema
    async inactivateSchema(req: Request, res: Response) {
        try {
            
            const privateKey = this.extractPrivateKey(req);

            const dto = SchemaValidator.validateInactivateSchemaDto(req.body);

            console.log(`Inactivating schema: ${dto.schemaId} v${dto.version} in channel: ${dto.channelName}`);
            
            const result = await this.schemaRegistryService.inactivateSchema(
                dto.schemaId,
                dto.version,
                dto.channelName,
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    // Alterar status do schema
    async setSchemaStatus(req: Request, res: Response) {
        try {
            const privateKey = this.extractPrivateKey(req);

            const dto = SchemaValidator.validateSetSchemaStatusDto(req.body);

            console.log(`Setting schema status: ${dto.schemaId} v${dto.version} to ${dto.status} in channel: ${dto.channelName}`);

            const result = await this.schemaRegistryService.setSchemaStatus(
            dto.schemaId,
            dto.version,
            dto.channelName,
            dto.status,
            privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            return this.handleError(res, error);
        }
    }

    // Obter informações do schema
    async getSchemaInfo(req: Request, res: Response): Promise<Response> {
        try {
            const dto = SchemaValidator.validateGetSchemaInfoDto(req.body);

            console.log(
            `Getting schema info: ${dto.schemaId} from channel: ${dto.channelName}`
            );

            const result = await this.schemaRegistryService.getSchemaInfo(
            dto.channelName,
            dto.schemaId
            );

            if (result.success) {
            return ResponseHelper.sendSuccess(res, result.data);
            } else {
            return ResponseHelper.sendError(res, result.error!, 404);
            }
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * GET Schema (flexible - database or blockchain)
     * POST /api/schemas/get
     * Query: ?source=database|blockchain&validateIntegrity=true
     */
    async getSchema(req: Request, res: Response): Promise<Response> {
        try {
            const dto = SchemaValidator.validateGetSchemaDto(req.body);

            const query = SchemaValidator.validateGetSchemaQuery(req.query);

            console.log(
            `Getting schema: ${dto.schemaId} in channel: ${dto.channelName}${
                dto.version ? ` v${dto.version}` : ' (active)'
            } from ${query.source || 'database'}${
                query.validateIntegrity ? ' with integrity validation' : ''
            }`
            );

            const result = await this.schemaRegistryService.getSchema(dto, query);

            if (result.success) {
            return ResponseHelper.sendSuccess(res, result.data);
            } else {
            return ResponseHelper.sendError(res, result.error!, 404);
            }
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * GET Schema OnChain (always from blockchain)
     * POST /api/schemas/get-onchain
     */
    async getSchemaOnChain(req: Request, res: Response): Promise<Response> {
        try {
            const dto = SchemaValidator.validateGetSchemaDto(req.body);

            console.log(
            `Getting schema from blockchain: ${dto.schemaId} in channel: ${dto.channelName}${
                dto.version ? ` v${dto.version}` : ' (active)'
            }`
            );

            const result = await this.schemaRegistryService.getSchemaOnChain(dto);

            if (result.success) {
            return ResponseHelper.sendSuccess(res, result.data);
            } else {
            return ResponseHelper.sendError(res, result.error!, 404);
            }
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    /**
     * LIST Schemas (with filters and pagination)
     * POST /api/schemas/list
     */
    async listSchemas(req: Request, res: Response): Promise<Response> {
        try {
            const filters = SchemaValidator.validateListSchemasDto(req.body);

            console.log(`Listing schemas with filters:`, filters);

            const result = await this.schemaRegistryService.listSchemas(filters);

            if (result.success) {
            return ResponseHelper.sendSuccess(res, result.data);
            } else {
            return ResponseHelper.sendError(res, result.error!, 400);
            }
        } catch (error) {
            return this.handleError(res, error);
        }
    }


    // HELPER FUNCTIONS
    private handleError(res: Response, error: unknown): Response {
        console.error('Controller error:', error);

        if (error instanceof AppError) {
        return ResponseHelper.sendError(res, error.message, error.httpStatus);
        }

        if (error instanceof Error) {
        return ResponseHelper.sendValidationError(res, error.message);
        }

        return ResponseHelper.sendServerError(res);
    }
}