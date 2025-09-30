import { prisma } from '../database/prismaClient';
import type { AssetOperationEventData } from '../types/databaseTypes';

export abstract class BaseOperationProcessor {
  protected readonly prisma = prisma;

  abstract process(event: AssetOperationEventData): Promise<void>;

  protected async assetExists(assetId: string): Promise<boolean> {
    const asset = await this.prisma.asset.findUnique({
      where: { assetId },
    });
    return asset !== null;
  }

  protected async upsertAsset(data: {
    assetId: string;
    channelName: string;
    ownerAddress: string;
    amount: string;
    idLocal: string | null;
    dataHash: string | null;
    status: number;
    originOwner?: string | null;
    parentAssetId?: string | null;
    createdAt: Date;
  }) {
    return await this.prisma.asset.upsert({
      where: { assetId: data.assetId },
      update: {
        ownerAddress: data.ownerAddress,
        amount: data.amount,
        idLocal: data.idLocal,
        dataHash: data.dataHash,
        status: data.status,
        lastUpdated: new Date(),
      },
      create: {
        assetId: data.assetId,
        channelName: data.channelName,
        ownerAddress: data.ownerAddress,
        amount: data.amount,
        idLocal: data.idLocal,
        dataHash: data.dataHash,
        status: data.status,
        originOwner: data.originOwner || data.ownerAddress,
        parentAssetId: data.parentAssetId || null,
        createdAt: data.createdAt,
        lastUpdated: data.createdAt,
      },
    });
  }

  protected async updateHierarchyPaths(parentId: string, childId: string) {
    await this.prisma.assetHierarchyPath.create({
      data: {
        ancestorId: parentId,
        descendantId: childId,
        depth: 1,
        path: `/${parentId}/${childId}`,
      },
    });

    const parentPaths = await this.prisma.assetHierarchyPath.findMany({
      where: { descendantId: parentId },
    });

    for (const parentPath of parentPaths) {
      try {
        await this.prisma.assetHierarchyPath.create({
          data: {
            ancestorId: parentPath.ancestorId,
            descendantId: childId,
            depth: parentPath.depth + 1,
            path: `${parentPath.path}/${childId}`,
          },
        });
      } catch {
        // Ignora duplicatas
      }
    }
  }
}