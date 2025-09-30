import { AssetHistoryRepository } from '../repositories/assetHistoryRepository';

interface HistoryEvent {
  asset_id: string;
  operacao: string;
  amount: string;
  related_asset_ids: string[];
  related_amounts: string[];
  timestamp_operacao: Date;
  sequencia?: number;
}

export class AssetHistoryService {
  private assetHistoryRepository: AssetHistoryRepository;

  constructor() {
    this.assetHistoryRepository = new AssetHistoryRepository();
  }

  /**
   * Buscar histórico direto (asset + ancestrais)
   */
  async getDirectHistory(assetId: string) {
    if (!assetId || assetId.trim() === '') {
      throw new Error('Asset ID é obrigatório');
    }

    const history = await this.assetHistoryRepository.getDirectHistory(assetId) as HistoryEvent[];

    const historyConverted = this.convertBigIntToString(history);

    return {
      assetId,
      mode: 'DIRECT',
      description: 'Histórico do asset + todos os ancestrais',
      totalEvents: historyConverted.length,
      events: historyConverted,
    };
  }

  /**
   * Buscar histórico indireto (asset + ancestrais + descendentes + irmãos)
   */
  async getIndirectHistory(assetId: string) {
    if (!assetId || assetId.trim() === '') {
      throw new Error('Asset ID é obrigatório');
    }

    const history = await this.assetHistoryRepository.getIndirectHistory(assetId) as HistoryEvent[];

    const historyConverted = this.convertBigIntToString(history);

    return {
      assetId,
      mode: 'INDIRECT',
      description: 'Histórico completo: asset + ancestrais + descendentes + irmãos',
      totalEvents: historyConverted.length,
      events: historyConverted,
    };
  }

  //HELPERS
  private convertBigIntToString(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }

    if (obj instanceof Date) {
        return obj.toISOString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertBigIntToString(item));
    }
    
    if (typeof obj === 'object') {
      const converted: any = {};
      for (const key in obj) {
        converted[key] = this.convertBigIntToString(obj[key]);
      }
      return converted;
    }
    
    return obj;
  }

}