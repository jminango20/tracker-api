import { Request, Response } from 'express';
import { SchemaRegistryService } from '../services/schemaRegistryService';
import { ContractValidators } from '../validators/contractValidators';
import { ResponseHelper } from '../utils/responseHelper';

export class SchemaRegistryController {
    private schemaRegistryService: SchemaRegistryService;

    constructor() {
        this.schemaRegistryService = new SchemaRegistryService();
    }

    // Criar schema
    async createSchema(req: Request, res: Response) {
        try {
            const schemaInput = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const schemaValidation = ContractValidators.validateSchemaInput(schemaInput);
            if (!schemaValidation.isValid) {
                return ResponseHelper.sendValidationError(res, schemaValidation.error!);
            }

            console.log(`Requisição para criar schema: ${schemaInput.name} no canal: ${schemaInput.channelName}`);

            const result = await this.schemaRegistryService.createSchema(
                {
                    id: schemaInput.id.trim(),
                    name: schemaInput.name.trim(),
                    dataHash: schemaInput.dataHash.trim(),
                    channelName: schemaInput.channelName.trim(),
                    description: schemaInput.description.trim()
                },
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller createSchema:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Obter schema ativo
    async getActiveSchema(req: Request, res: Response) {
        try {
            const { channelName, schemaId } = req.body;

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Nome do canal: ' + channelValidation.error);
            }

            const schemaIdValidation = ContractValidators.validateSchemaId(schemaId);
            if (!schemaIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, schemaIdValidation.error!);
            }

            console.log(`Requisição para obter schema ativo: ${schemaId} no canal: ${channelName}`);

            const result = await this.schemaRegistryService.getActiveSchema(
                channelName.trim(),
                schemaId.trim()
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getActiveSchema:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Obter informações do schema
    async getSchemaInfo(req: Request, res: Response) {
        try {
            const { channelName, schemaId } = req.body;

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Nome do canal: ' + channelValidation.error);
            }

            const schemaIdValidation = ContractValidators.validateSchemaId(schemaId);
            if (!schemaIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, schemaIdValidation.error!);
            }

            console.log(`Requisição para obter informações do schema: ${schemaId} no canal: ${channelName}`);

            const result = await this.schemaRegistryService.getSchemaInfo(
                channelName.trim(),
                schemaId.trim()
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getSchemaInfo:', error);
            return ResponseHelper.sendServerError(res);
        }
    }


}