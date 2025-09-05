// controllers/AccessChannelManagerController.ts
import { Request, Response } from 'express';
import { AccessChannelManagerService } from '../services/accessChannelManagerService';
import { ContractValidators } from '../validators/contractValidators';
import { ResponseHelper } from '../utils/responseHelper';

export class AccessChannelManagerController {
    private accessChannelService: AccessChannelManagerService;

    constructor() {
        this.accessChannelService = new AccessChannelManagerService();
    }

    // Criar um novo canal
    async createChannel(req: Request, res: Response) {
        try {
            const { channelName } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para criar canal: ${channelName}`);

            const result = await this.accessChannelService.createChannel(
                channelName.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendValidationError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller createChannel:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Ativar um canal
    async activateChannel(req: Request, res: Response) {
        try {
            const { channelName } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            // Validações centralizadas
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para ativar canal: ${channelName}`);

            const result = await this.accessChannelService.activateChannel(
                channelName.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendValidationError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller activateChannel:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Desativar um canal
    async desactivateChannel(req: Request, res: Response) {
        try {
            const { channelName } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            // Validações centralizadas
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para desativar canal: ${channelName}`);

            const result = await this.accessChannelService.deactivateChannel(
                channelName.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendValidationError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller desactivateChannel:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Buscar informações de um canal
    async getChannelInfo(req: Request, res: Response) {
        try {
            const { channelName } = req.body;

            const validation = ContractValidators.validateContractName(channelName);
            if (!validation.isValid) {
                return ResponseHelper.sendValidationError(res, validation.error!);
            }

            console.log(`Requisição para buscar canal: ${channelName}`);

            const result = await this.accessChannelService.getChannelInfo(channelName.trim());

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, 'Informações do canal obtidas com sucesso');
            } else {
                return ResponseHelper.sendServerError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller getChannelInfo:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}