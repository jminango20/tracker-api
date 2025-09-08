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
                    schemaId: schemaInput.schemaId.trim(),
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

    // Atualizar schema
    async updateSchema(req: Request, res: Response) {
        try {
            const schemaUpdate = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            // Validação da private key
            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const updateValidation = ContractValidators.validateSchemaUpdate(schemaUpdate);
            if (!updateValidation.isValid) {
                return ResponseHelper.sendValidationError(res, updateValidation.error!);
            }

            console.log(`Requisição para atualizar schema: ${schemaUpdate.schemaId} no canal: ${schemaUpdate.channelName}`);

            const result = await this.schemaRegistryService.updateSchema(
                {
                    schemaId: schemaUpdate.schemaId.trim(),
                    newDataHash: schemaUpdate.newDataHash.trim(),
                    channelName: schemaUpdate.channelName.trim(),
                    newDescription: schemaUpdate.newDescription.trim()
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
            const { schemaId, channelName } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const idValidation = ContractValidators.validateSchemaId(schemaId);
            if (!idValidation.isValid) {
                return ResponseHelper.sendValidationError(res, idValidation.error!);
            }

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            console.log(`Requisição para depreciar schema: ${schemaId} no canal: ${channelName}`);

            const result = await this.schemaRegistryService.deprecateSchema(
                schemaId.trim(),
                channelName.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller deprecateSchema:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Inativar schema
    async inactivateSchema(req: Request, res: Response) {
        try {
            const { schemaId, version, channelName } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const idValidation = ContractValidators.validateSchemaId(schemaId);
            if (!idValidation.isValid) {
                return ResponseHelper.sendValidationError(res, idValidation.error!);
            }

            const versionValidation = ContractValidators.validateVersion(version);
            if (!versionValidation.isValid) {
                return ResponseHelper.sendValidationError(res, versionValidation.error!);
            }

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            console.log(`Requisição para inativar schema: ${schemaId} versão ${version} no canal: ${channelName}`);

            const result = await this.schemaRegistryService.inactivateSchema(
                schemaId.trim(),
                versionValidation.version!,
                channelName.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller inactivateSchema:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Alterar status do schema
    async setSchemaStatus(req: Request, res: Response) {
        try {
            const schemaStatusInput = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const statusValidation = ContractValidators.validateSchemaStatusInput(schemaStatusInput);
            if (!statusValidation.isValid) {
                return ResponseHelper.sendValidationError(res, statusValidation.error!);
            }

            console.log(`Requisição para alterar status do schema: ${schemaStatusInput.schemaId} versão ${schemaStatusInput.version} para ${schemaStatusInput.status}`);

            const result = await this.schemaRegistryService.setSchemaStatus(
                schemaStatusInput.schemaId.trim(),
                schemaStatusInput.version!,
                schemaStatusInput.channelName.trim(),
                schemaStatusInput.status,
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller setSchemaStatus:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Obter schema por versão específica
    async getSchemaByVersion(req: Request, res: Response) {
        try {
            const { channelName, schemaId, version } = req.body;

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Nome do canal: ' + channelValidation.error);
            }

            const schemaIdValidation = ContractValidators.validateSchemaId(schemaId);
            if (!schemaIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, schemaIdValidation.error!);
            }

            const versionValidation = ContractValidators.validateVersion(version);
            if (!versionValidation.isValid) {
                return ResponseHelper.sendValidationError(res, versionValidation.error!);
            }

            console.log(`Requisição para obter schema: ${schemaId} versão ${version} no canal: ${channelName}`);

            const result = await this.schemaRegistryService.getSchemaByVersion(
                channelName.trim(),
                schemaId.trim(),
                versionValidation.version!
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getSchemaByVersion:', error);
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