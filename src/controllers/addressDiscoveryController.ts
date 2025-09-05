import {Request, Response} from 'express';
import { AddressDiscoveryService } from '../services/addressDiscoveryService';
import { ContractValidators } from '../validators/contractValidators';
import { ResponseHelper } from '../utils/responseHelper';

export class AddressDiscoveryController {
    private addressDiscoveryService: AddressDiscoveryService;

    constructor() {
        this.addressDiscoveryService = new AddressDiscoveryService();
    }

    //Buscar endereço de um contrato
    async getAddress(req: Request, res: Response) {
        try {
            const { contractName } = req.body;

            const validation = ContractValidators.validateContractName(contractName);
            if (!validation.isValid) {
                return ResponseHelper.sendValidationError(res, validation.error!);
            }

            console.log(`Requisição para buscar endereço: ${contractName}`);

            const result = await this.addressDiscoveryService.getAddress(contractName.trim());
           
            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data);
            } else {
                return ResponseHelper.sendNotFound(res, result.error!);
            }
        } catch (error) {
            console.error('Erro no controller getAddress:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    //Verificar se contrato está registrado
    async isRegistered(req: Request, res: Response) {
        try {
            const { contractName } = req.body;

            const validation = ContractValidators.validateContractName(contractName);
            if (!validation.isValid) {
                return ResponseHelper.sendValidationError(res, validation.error!);
            }

            console.log(`Requisição para verificar registro: ${contractName}`);

            const result = await this.addressDiscoveryService.isRegistered(contractName.trim());

            if (result.success) {
                return ResponseHelper.sendSuccess(res, {
                    contractName: result.data?.contractName,
                    isRegistered: result.data?.isRegistered
                });
            } else {
                return ResponseHelper.sendServerError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller isRegistered:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    //Atualizar endereço de um contrato
    async updateAddress(req: Request, res: Response) {
        try {    
            const { contractName, newAddress } = req.body;
      
            const privateKey = req.headers['x-private-key'] as string;

            const contractValidation = ContractValidators.validateContractName(contractName);
            if (!contractValidation.isValid) {
                return ResponseHelper.sendValidationError(res, contractValidation.error!);
            }

            const addressValidation = ContractValidators.validateAddress(newAddress);
            if (!addressValidation.isValid) {
                return ResponseHelper.sendValidationError(res, addressValidation.error!);
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para atualizar endereço: ${contractName} -> ${newAddress}`);

            const result = await this.addressDiscoveryService.updateAddress(
                contractName.trim(), 
                newAddress.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendValidationError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller updateAddress:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}