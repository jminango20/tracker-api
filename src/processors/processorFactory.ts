import { AssetOperation } from '../types';
import { BaseOperationProcessor } from './baseProcessor';
import { CreateProcessor } from './createProcessor';
import { UpdateProcessor } from './updateProcessor';
import { TransferProcessor } from './transferProcessor';
import { TransformProcessor } from './transformProcessor';
import { SplitProcessor } from './splitProcessor';
import { GroupProcessor } from './groupProcessor';
import { UngroupProcessor } from './ungroupProcessor';
import { InactivateProcessor } from './inactivateProcessor';

export class ProcessorFactory {
  private static processors: Map<number, BaseOperationProcessor> = new Map([
    [AssetOperation.CREATE, new CreateProcessor()],
    [AssetOperation.UPDATE, new UpdateProcessor()],
    [AssetOperation.TRANSFER, new TransferProcessor()],
    [AssetOperation.TRANSFORM, new TransformProcessor()],
    [AssetOperation.SPLIT, new SplitProcessor()],
    [AssetOperation.GROUP, new GroupProcessor()],
    [AssetOperation.UNGROUP, new UngroupProcessor()],
    [AssetOperation.INACTIVATE, new InactivateProcessor()],
  ]);

  static getProcessor(operation: number): BaseOperationProcessor {
    const processor = this.processors.get(operation);
    if (!processor) {
      throw new Error(`Processador não implementado para operação ${operation}`);
    }
    return processor;
  }
}