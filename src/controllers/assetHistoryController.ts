import { Request, Response } from 'express';
import { AssetHistoryService } from '../services/assetHistoryService';

export class AssetHistoryController {
  private assetHistoryService: AssetHistoryService;

  constructor() {
    this.assetHistoryService = new AssetHistoryService();
  }

  /**
   * POST /asset-history/direct
   * Body: { assetId: string }
   */
  async getDirectHistory(req: Request, res: Response) {
    try {
      const { assetId } = req.body;

      if (!assetId) {
        return res.status(400).json({
          success: false,
          message: 'assetId é obrigatório no body',
        });
      }

      const result = await this.assetHistoryService.getDirectHistory(assetId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao buscar histórico direto:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar histórico direto',
      });
    }
  }

  /**
   * POST /asset-history/indirect
   * Body: { assetId: string }
   */
  async getIndirectHistory(req: Request, res: Response) {
    try {
      const { assetId } = req.body;

      if (!assetId) {
        return res.status(400).json({
          success: false,
          message: 'assetId é obrigatório no body',
        });
      }

      const result = await this.assetHistoryService.getIndirectHistory(assetId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Erro ao buscar histórico indireto:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar histórico indireto',
      });
    }
  }
}