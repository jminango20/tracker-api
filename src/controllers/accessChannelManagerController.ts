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

    // Adicionar membro ao canal
    async addChannelMember(req: Request, res: Response) {
        try {
            const { channelName, memberAddress } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            // Validações centralizadas
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const addressValidation = ContractValidators.validateAddress(memberAddress);
            if (!addressValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Endereço do membro é inválido');
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para adicionar membro ${memberAddress} ao canal: ${channelName}`);

            const result = await this.accessChannelService.addChannelMember(
                channelName.trim(),
                memberAddress.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendValidationError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller addChannelMember:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Remover membro do canal
    async removeChannelMember(req: Request, res: Response) {
        try {
            const { channelName, memberAddress } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            // Validações centralizadas
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const addressValidation = ContractValidators.validateAddress(memberAddress);
            if (!addressValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Endereço do membro é inválido');
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para remover membro ${memberAddress} do canal: ${channelName}`);

            const result = await this.accessChannelService.removeChannelMember(
                channelName.trim(),
                memberAddress.trim(),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendValidationError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller removeChannelMember:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Adicionar múltiplos membros ao canal
    async addChannelMembers(req: Request, res: Response) {
        try {
            const { channelName, memberAddresses } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            // Validações centralizadas
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const addressesValidation = ContractValidators.validateAddressArray(memberAddresses);
            if (!addressesValidation.isValid) {
                return ResponseHelper.sendValidationError(res, addressesValidation.error!);
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para adicionar ${memberAddresses.length} membros ao canal: ${channelName}`);

            const result = await this.accessChannelService.addChannelMembers(
                channelName.trim(),
                memberAddresses.map((addr: string) => addr.trim()),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller addChannelMembers:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Remover múltiplos membros do canal
    async removeChannelMembers(req: Request, res: Response) {
        try {
            const { channelName, memberAddresses } = req.body;
            const privateKey = req.headers['x-private-key'] as string;

            // Validações centralizadas
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const addressesValidation = ContractValidators.validateAddressArray(memberAddresses);
            if (!addressesValidation.isValid) {
                return ResponseHelper.sendValidationError(res, addressesValidation.error!);
            }

            const keyValidation = ContractValidators.validatePrivateKey(privateKey);
            if (!keyValidation.isValid) {
                return ResponseHelper.sendValidationError(res, keyValidation.error!);
            }

            console.log(`Requisição para remover ${memberAddresses.length} membros do canal: ${channelName}`);

            const result = await this.accessChannelService.removeChannelMembers(
                channelName.trim(),
                memberAddresses.map((addr: string) => addr.trim()),
                privateKey
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller removeChannelMembers:', error);
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

    // Verificar se é membro do canal
    async isChannelMember(req: Request, res: Response) {
        try {
            const { channelName, memberAddress } = req.body;

            // Validações centralizadas  
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const addressValidation = ContractValidators.validateAddress(memberAddress);
            if (!addressValidation.isValid) {
                return ResponseHelper.sendValidationError(res, 'Endereço do membro é inválido');
            }

            console.log(`Requisição para verificar membro ${memberAddress} no canal: ${channelName}`);

            const result = await this.accessChannelService.isChannelMember(
                channelName.trim(),
                memberAddress.trim()
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!);
            }

        } catch (error) {
            console.error('Erro no controller isChannelMember:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Obter total de canais
    async getChannelCount(req: Request, res: Response) {
        try {
            console.log('Requisição para obter total de canais');

            const result = await this.accessChannelService.getChannelCount();

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getChannelCount:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Obter canais paginados
    async getAllChannelsPaginated(req: Request, res: Response) {
        try {
            const { page = 1, pageSize = 10 } = req.query;

            // Validar paginação
            const paginationValidation = ContractValidators.validatePagination(page, pageSize);
            if (!paginationValidation.isValid) {
                return ResponseHelper.sendValidationError(res, paginationValidation.error!);
            }

            console.log(`Requisição para obter canais - página ${paginationValidation.page}`);

            const result = await this.accessChannelService.getAllChannelsPaginated(
                paginationValidation.page!,
                paginationValidation.pageSize!
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getAllChannelsPaginated:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Obter total de membros do canal
    async getChannelMemberCount(req: Request, res: Response) {
        try {
            const { channelName } = req.body;

            // Validação
            const validation = ContractValidators.validateContractName(channelName);
            if (!validation.isValid) {
                return ResponseHelper.sendValidationError(res, validation.error!);
            }

            console.log(`Requisição para obter total de membros do canal: ${channelName}`);

            const result = await this.accessChannelService.getChannelMemberCount(channelName.trim());

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getChannelMemberCount:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Verificar múltiplos membros
    async areChannelMembers(req: Request, res: Response) {
        try {
            const { channelName, memberAddresses } = req.body;

            // Validações
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const addressesValidation = ContractValidators.validateAddressArray(memberAddresses);
            if (!addressesValidation.isValid) {
                return ResponseHelper.sendValidationError(res, addressesValidation.error!);
            }

            console.log(`Requisição para verificar ${memberAddresses.length} membros do canal: ${channelName}`);

            const result = await this.accessChannelService.areChannelMembers(
                channelName.trim(),
                memberAddresses.map((addr: string) => addr.trim())
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller areChannelMembers:', error);
            return ResponseHelper.sendServerError(res);
        }
    }

    // Obter membros paginados
    async getChannelMembersPaginated(req: Request, res: Response) {
        try {
            const { channelName } = req.body;
            const { page = 1, pageSize = 10 } = req.query;

            // Validações
            const channelValidation = ContractValidators.validateContractName(channelName);
            if (!channelValidation.isValid) {
                return ResponseHelper.sendValidationError(res, channelValidation.error!);
            }

            const paginationValidation = ContractValidators.validatePagination(page, pageSize);
            if (!paginationValidation.isValid) {
                return ResponseHelper.sendValidationError(res, paginationValidation.error!);
            }

            console.log(`Requisição para obter membros do canal ${channelName} - página ${paginationValidation.page}`);

            const result = await this.accessChannelService.getChannelMembersPaginated(
                channelName.trim(),
                paginationValidation.page!,
                paginationValidation.pageSize!
            );

            if (result.success) {
                return ResponseHelper.sendSuccess(res, result.data, result.data?.message);
            } else {
                return ResponseHelper.sendError(res, result.error!, 400);
            }

        } catch (error) {
            console.error('Erro no controller getChannelMembersPaginated:', error);
            return ResponseHelper.sendServerError(res);
        }
    }
}