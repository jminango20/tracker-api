import { Request, Response } from 'express';
import { AssetRegistryService } from '../services/assetRegistryService';
import { ContractValidators } from '../validators/contractValidators';
import { ResponseHelper } from '../utils/responseHelper';

export class AssetRegistryController {
    private assetRegistryService: AssetRegistryService;

    constructor() {
        this.assetRegistryService = new AssetRegistryService();
    }

    // Buscar asset
    async getAsset(req: Request, res: Response) {
        try {
            const { channelName, assetId } = req.body;

            // Validações

            if (!channelName?.trim() || !assetId?.trim()) {
                return ResponseHelper.sendValidationError(res, 'channelName e assetId são obrigatórios');
            }

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Nome do canal: ' + channelValidation.error);
            }

            const assetIdValidation = ContractValidators.validateAssetId(assetId);
            if (!assetIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, assetIdValidation.error!);
            }

            console.log(`Requisição para buscar asset: ${assetId} no canal: ${channelName}`);

            const result = await this.assetRegistryService.getAsset(
                channelName.trim(),
                assetId.trim()
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getAsset:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Buscar detalhes do asset
    async getAssetDetails(req: Request, res: Response) {
        try {
            const { channelName, assetId } = req.body;

            // Validações básicas
            if (!channelName?.trim() || !assetId?.trim()) {
                return ResponseHelper.sendValidationError(res, 'channelName e assetId são obrigatórios');
            }

            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Nome do canal: ' + channelValidation.error);
            }

            const assetIdValidation = ContractValidators.validateAssetId(assetId);
            if (!assetIdValidation.isValid) {
                return ResponseHelper.sendValidationError(res, assetIdValidation.error!);
            }

            console.log(`Consultando detalhes do asset: ${assetId} no canal: ${channelName}`);

            const result = await this.assetRegistryService.getAssetDetails(
                channelName.trim(),
                assetId.trim()
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 404);
            }

        } catch (error) {
            console.error('Erro no controller getAssetDetails:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}