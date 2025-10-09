import { prisma } from '../database/prismaClient';
import { Prisma } from '@prisma/client';

/**
 * Interface para dados de criação do schema
 */
export interface CreateSchemaData {
  // Identificação
  schemaId: string;
  schemaIdHash: string;
  channelName: string;
  channelNameHash: string;
  version: number;
  name: string;

  // Dados do schema
  dataHash: string;
  fullSchema: {
    properties: any;
    required: string[];
  };
  description?: string;

  // Blockchain metadata
  owner: string;
  blockTimestamp: bigint;

  // Transação
  transactionHash: string;
  blockNumber: bigint;
  logIndex: number;

  // Status
  status?: string; // Default: ACTIVE
}

/**
 * Interface para buscar schema
 */
export interface FindSchemaParams {
  schemaId: string;
  channelName: string;
  version?: number; 
}

/**
 * Repository para operações com SchemaData no banco
 */
export class SchemaRepository {
  
  /**
   * Salva um schema no banco
   */
  async create(data: CreateSchemaData) {
    return await prisma.schemaData.create({
      data: {
        schemaId: data.schemaId,
        schemaIdHash: data.schemaIdHash,
        channelName: data.channelName,
        channelNameHash: data.channelNameHash,
        version: data.version,
        name: data.name,
        dataHash: data.dataHash,
        fullSchema: data.fullSchema as Prisma.JsonObject,
        description: data.description || null,
        owner: data.owner,
        blockTimestamp: data.blockTimestamp,
        transactionHash: data.transactionHash,
        blockNumber: data.blockNumber,
        logIndex: data.logIndex,
        status: data.status || 'ACTIVE',
      },
    });
  }

  /**
   * Busca schema por ID, canal e versão
   */
  async findByVersion(params: FindSchemaParams) {
    const { schemaId, channelName, version } = params;

    if (version) {
      // Busca versão específica
      return await prisma.schemaData.findUnique({
        where: {
          schemaId_channelName_version: {
            schemaId,
            channelName,
            version,
          },
        },
      });
    }

    return await prisma.schemaData.findFirst({
      where: {
        schemaId,
        channelName,
        status: 'ACTIVE',
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  /**
   * Busca schema ativo (mais recente com status ACTIVE)
   */
  async findActive(schemaId: string, channelName: string) {
    return await prisma.schemaData.findFirst({
      where: {
        schemaId,
        channelName,
        status: 'ACTIVE',
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  /**
   * Busca todas as versões de um schema
   */
  async findAllVersions(schemaId: string, channelName: string) {
    return await prisma.schemaData.findMany({
      where: {
        schemaId,
        channelName,
      },
      orderBy: {
        version: 'asc',
      },
    });
  }

  /**
   * Atualiza status de um schema
   */
  async updateStatus(
    schemaId: string,
    channelName: string,
    version: number,
    newStatus: string
  ) {
    return await prisma.schemaData.update({
      where: {
        schemaId_channelName_version: {
          schemaId,
          channelName,
          version,
        },
      },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Verifica se schema existe
   */
  async exists(schemaId: string, channelName: string, version: number): Promise<boolean> {
    const count = await prisma.schemaData.count({
      where: {
        schemaId,
        channelName,
        version,
      },
    });
    return count > 0;
  }

  /**
   * Busca schema por transaction hash
   */
  async findByTransactionHash(transactionHash: string) {
    return await prisma.schemaData.findFirst({
      where: {
        transactionHash,
      },
    });
  }

  /**
   * Conta total de versões de um schema
   */
  async countVersions(schemaId: string, channelName: string): Promise<number> {
    return await prisma.schemaData.count({
      where: {
        schemaId,
        channelName,
      },
    });
  }

  /**
   * Lista schemas com filtros e paginação
   */
  async list(filters: {
    channelName?: string;
    schemaId?: string; // Partial match
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.channelName) {
      where.channelName = filters.channelName;
    }

    if (filters.schemaId) {
      // Partial match (contains)
      where.schemaId = {
        contains: filters.schemaId,
        mode: 'insensitive',
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Buscar total de registros
    const total = await prisma.schemaData.count({ where });

    // Buscar schemas paginados
    const schemasRaw = await prisma.schemaData.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { schemaId: 'asc' },
        { version: 'desc' },
      ],
    });

    const schemas = schemasRaw.map(schema => ({
      ...schema,
      fullSchema: schema.fullSchema as { 
        properties: Record<string, any>; 
        required: string[]; 
      },
    }));

    return {
      schemas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}