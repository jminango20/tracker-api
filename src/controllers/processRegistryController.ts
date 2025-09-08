import { Request, Response } from 'express';
import { ProcessRegistryService } from '../services/processRegistryService';
import { ContractValidators } from '../validators/contractValidators';
import { ResponseHelper } from '../utils/responseHelper';

export class ProcessRegistryController {
    private processRegistryService: ProcessRegistryService;

    constructor() {
        this.processRegistryService = new ProcessRegistryService();
    }

    // Criar processo
    async createProcess(req: Request, res: Response) {
        try {
            const processInput = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const processValidation = ContractValidators.validateProcessInput(processInput);
            if (!processValidation.isValid) {
                return ResponseHelper.sendValidationError(res, processValidation.error!);
            }

            console.log(`Requisição para criar processo: ${processInput.processId} nature: ${processInput.natureId} stage: ${processInput.stageId}`);

            const result = await this.processRegistryService.createProcess(
                {
                    processId: processInput.processId.trim(),
                    natureId: processInput.natureId.trim(),
                    stageId: processInput.stageId.trim(),
                    schemas: processInput.schemas || [],
                    action: processInput.action.trim(),
                    description: processInput.description.trim(),
                    channelName: processInput.channelName.trim()
                },
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller createProcess:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Alterar status do processo
    async setProcessStatus(req: Request, res: Response) {
        try {
            const { channelName, processId, natureId, stageId, status } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const processIdValidation = ContractValidators.validateProcessId(processId);
            if (!processIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, processIdValidation.error!);
            }

            const natureIdValidation = ContractValidators.validateNatureId(natureId);
            if (!natureIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, natureIdValidation.error!);
            }

            const stageIdValidation = ContractValidators.validateStageId(stageId);
            if (!stageIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, stageIdValidation.error!);
            }

            const statusValidation = ContractValidators.validateProcessStatus(status);
            if (!statusValidation.isValid) {
                return ResponseHelper.sendValidationError(res, statusValidation.error!);
            }

            const result = await this.processRegistryService.setProcessStatus(
                channelName.trim(),
                processId.trim(),
                natureId.trim(),
                stageId.trim(),
                status,
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller setProcessStatus:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Inativar processo
    async inactivateProcess(req: Request, res: Response) {
        try {
            const { channelName, processId, natureId, stageId } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const processIdValidation = ContractValidators.validateProcessId(processId);
            if (!processIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, processIdValidation.error!);
            }

            const natureIdValidation = ContractValidators.validateNatureId(natureId);
            if (!natureIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, natureIdValidation.error!);
            }

            const stageIdValidation = ContractValidators.validateStageId(stageId);
            if (!stageIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, stageIdValidation.error!);
            }

            const result = await this.processRegistryService.inactivateProcess(
                channelName.trim(),
                processId.trim(),
                natureId.trim(),
                stageId.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller inactivateProcess:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Buscar processo
    async getProcess(req: Request, res: Response) {
        try {
            const { channelName, processId, natureId, stageId } = req.body;

            // Validações
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Nome do canal: ' + channelValidation.error);
            }

            const processIdValidation = ContractValidators.validateProcessId(processId);
            if (!processIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, processIdValidation.error!);
            }

            const natureIdValidation = ContractValidators.validateNatureId(natureId);
            if (!natureIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, natureIdValidation.error!);
            }

            const stageIdValidation = ContractValidators.validateStageId(stageId);
            if (!stageIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, stageIdValidation.error!);
            }

            console.log(`Requisição para buscar processo: ${processId} nature: ${natureId} stage: ${stageId} no canal: ${channelName}`);

            const result = await this.processRegistryService.getProcess(
                channelName.trim(),
                processId.trim(),
                natureId.trim(),
                stageId.trim()
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getProcess:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Validar processo para submissão
    async validateProcessForSubmission(req: Request, res: Response) {
        try {
            const { channelName, processId, natureId, stageId } = req.body;

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Nome do canal: ' + channelValidation.error);
            }

            const processIdValidation = ContractValidators.validateProcessId(processId);
            if (!processIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, processIdValidation.error!);
            }

            const natureIdValidation = ContractValidators.validateNatureId(natureId);
            if (!natureIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, natureIdValidation.error!);
            }

            const stageIdValidation = ContractValidators.validateStageId(stageId);
            if (!stageIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, stageIdValidation.error!);
            }

            console.log(`Requisição para validar processo: ${processId} nature: ${natureId} stage: ${stageId}`);

            const result = await this.processRegistryService.validateProcessForSubmission(
                channelName.trim(),
                processId.trim(),
                natureId.trim(),
                stageId.trim()
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller validateProcessForSubmission:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}