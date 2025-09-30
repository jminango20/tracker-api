import { prisma } from '../database/prismaClient';

export class BlockTrackerRepository {
  private readonly TRACKER_ID = 'main_indexer';

  async saveLastProcessedBlock(blockNumber: bigint) {
    await prisma.blockTracker.upsert({
      where: { id: this.TRACKER_ID },
      update: { 
        lastBlock: blockNumber,
        updatedAt: new Date()
      },
      create: {
        id: this.TRACKER_ID,
        lastBlock: blockNumber,
      }
    });
  }

  async getLastProcessedBlock(): Promise<bigint | null> {
    const tracker = await prisma.blockTracker.findUnique({
      where: { id: this.TRACKER_ID }
    });
    
    return tracker?.lastBlock ?? null;
  }
}