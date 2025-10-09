import { keccak256, toHex } from "viem";
import { BlockchainService } from "./base/blockchainService";
import { AddressDiscoveryService } from "./addressDiscoveryService";
import { ISCHEMA_REGISTRY_ABI } from "../config/abis/ISchemaRegistry";
import {
  ApiResponse,
} from "../types/channelTypes";
import { ContractErrorHandler } from "../errors/contractErrorHandler";
import { decodeEventLog } from "viem";
import { SchemaRepository } from "../repositories/schemaRepository";
import { AppError, ErrorCode, createError } from '../errors/definitions';
import { 
  CreateSchemaInput,
  UpdateSchemaInput,
  SchemaStatus,
  GetSchemaDto,
  GetSchemaQuery,
  ListSchemasDto,
  SchemaInfoResponse,
  SchemaEntity,
  schemaStatusToString
} from '../types/schemaTypes';

export class SchemaRegistryService extends BlockchainService {
  private addressDiscoveryService: AddressDiscoveryService;
  private cachedContractAddress: `0x${string}` | null = null;
  private schemaRepository: SchemaRepository;

  protected contractAddress: `0x${string}` =
    "0x0000000000000000000000000000000000000000";
  protected contractAbi = [...ISCHEMA_REGISTRY_ABI];

  constructor() {
    super();
    this.addressDiscoveryService = new AddressDiscoveryService();
    this.schemaRepository = new SchemaRepository();
  }

  private async ensureContractAddress(): Promise<void> {
    if (this.cachedContractAddress) {
      return;
    }

    const result = await this.addressDiscoveryService.getAddress(
      "SCHEMA_REGISTRY"
    );

    if (!result.success || !result.data?.addressContract) {
      throw createError(
        ErrorCode.CONTRACT_NOT_FOUND,
        'SchemaRegistry não encontrado no AddressDiscovery'
      );
    }

    this.cachedContractAddress = result.data.addressContract as `0x${string}`;
    this.contractAddress = this.cachedContractAddress;
  }

  private stringToBytes32(str: string): `0x${string}` {
    return keccak256(toHex(str));
  }

  public clearAddressCache(): void {
    this.cachedContractAddress = null;
  }

  // Criar schema
  async createSchema(
    schemaInput: CreateSchemaInput,
    privateKey: string
  ): Promise<ApiResponse<any>> {
    try {
      console.log(
        `Creating schema: ${schemaInput.name} in channel: ${schemaInput.channelName}`
      );

      await this.ensureContractAddress();

      const contract = this.getWriteContract(privateKey);

      const schemaData = {
        id: this.stringToBytes32(schemaInput.schemaId),
        name: schemaInput.name,
        dataHash: schemaInput.dataHash,
        channelName: this.stringToBytes32(schemaInput.channelName),
        description: schemaInput.description,
      };

      const txHash = (await contract.write.createSchema([schemaData])) as any;

      console.log(`Transaction sent: ${txHash}`);

      const receipt = await this.waitForTransaction(txHash);
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      const event = this.parseSchemaCreatedEvent(receipt);

      try {
        await this.schemaRepository.create({
          // Identificação (string original + hash)
          schemaId: schemaInput.schemaId,
          schemaIdHash: event.args.id,
          channelName: schemaInput.channelName,
          channelNameHash: event.args.channelName,
          version: Number(event.args.version),
          name: event.args.name,

          // Dados do schema
          dataHash: schemaInput.dataHash,
          fullSchema: {
            properties: schemaInput.fullSchemaData.properties,
            required: schemaInput.fullSchemaData.required,
          },
          description: schemaInput.description,

          // Blockchain metadata
          owner: event.args.owner,
          blockTimestamp: event.args.timestamp,

          // Transação
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber!,
          logIndex: event.logIndex!,

          // Status
          status: "ACTIVE",
        });

        console.log("Schema created successfully in the database!");
      } catch (dbError) {
        console.error("Error creating schema in the database:", dbError);
        // Schema foi criado na blockchain mas falhou no banco
        // Não fazemos rollback da blockchain, apenas logamos o erro
      }
      return {
        success: true,
        data: {
          schemaId: schemaInput.schemaId,
          schemaName: schemaInput.name,
          channelName: schemaInput.channelName,
          version: Number(event.args.version),
          dataHash: schemaInput.dataHash,
          transactionHash: txHash,
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed?.toString(),
          message: "Schema created successfully",
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError || this.handleBlockchainError(error, "Creating schema");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Atualizar schema
  async updateSchema(
    schemaUpdate: UpdateSchemaInput,
    privateKey: string
  ): Promise<ApiResponse<any>> {
    try {
      console.log(
        `Updating schema: ${schemaUpdate.schemaId} in channel: ${schemaUpdate.channelName}`
      );

      await this.ensureContractAddress();
      const contract = this.getWriteContract(privateKey);

      const previousSchema = await this.schemaRepository.findActive(
        schemaUpdate.schemaId,
        schemaUpdate.channelName
      );

      if (!previousSchema) {
        throw createError(
          ErrorCode.SCHEMA_NOT_FOUND,
          `Active schema ${schemaUpdate.schemaId} not found in channel ${schemaUpdate.channelName}`,
          { schemaId: schemaUpdate.schemaId, channelName: schemaUpdate.channelName }
        );
      }

      console.log(
        `Schema not found - Version: ${previousSchema.version}, Name: ${previousSchema.name}`
      );

      const updateData = {
        id: this.stringToBytes32(schemaUpdate.schemaId),
        newDataHash: schemaUpdate.newDataHash,
        channelName: this.stringToBytes32(schemaUpdate.channelName),
        description: schemaUpdate.newDescription,
      };

      const txHash = (await contract.write.updateSchema([updateData])) as any;

      console.log(`Transaction sent: ${txHash}`);

      const receipt = await this.waitForTransaction(txHash);
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      const event = this.parseSchemaUpdatedEvent(receipt);

      try {
        await this.schemaRepository.updateStatus(
          schemaUpdate.schemaId,
          schemaUpdate.channelName,
          Number(event.args.previousVersion),
          "DEPRECATED"
        );

        console.log(
          `Version ${event.args.previousVersion} marks as deprecated in the database`
        );
      } catch (dbError) {
        console.error(
          "Error marking previous version as deprecated in the database:",
          dbError
        );
        // Continua mesmo se falhar
      }

      try {
        await this.schemaRepository.create({
          schemaId: schemaUpdate.schemaId,
          schemaIdHash: event.args.id,
          channelName: schemaUpdate.channelName,
          channelNameHash: event.args.channelName,
          version: Number(event.args.newVersion), 
          name: previousSchema.name, 

          dataHash: schemaUpdate.newDataHash,
          fullSchema: {
            properties: schemaUpdate.fullSchemaData.properties,
            required: schemaUpdate.fullSchemaData.required,
          },
          description: schemaUpdate.newDescription,

          // Blockchain metadata
          owner: event.args.owner,
          blockTimestamp: event.args.timestamp,

          // Transação
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber!,
          logIndex: event.logIndex!,

          status: "ACTIVE",
        });

        console.log(
          `New version ${event.args.newVersion} saved in the database!`
        );
      } catch (dbError) {
        console.error("Error to save new version in the database:", dbError);
        // Não fazemos rollback da blockchain, apenas logamos o erro
      }

      return {
        success: true,
        data: {
          schemaId: schemaUpdate.schemaId,
          schemaName: previousSchema.name,
          channelName: schemaUpdate.channelName,
          previousVersion: Number(event.args.previousVersion),
          newVersion: Number(event.args.newVersion),
          newDataHash: schemaUpdate.newDataHash,
          transactionHash: txHash,
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed?.toString(),
          message: `Schema updated successfully - version ${event.args.previousVersion} → ${event.args.newVersion}`,
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError || this.handleBlockchainError(error, "updating schema");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Depreciar schema
  async deprecateSchema(
    schemaId: string,
    channelName: string,
    privateKey: string
  ): Promise<ApiResponse<any>> {
    try {
      console.log(`Deprecating schema: ${schemaId} in channel: ${channelName}`);

      const activeSchema = await this.schemaRepository.findActive(
        schemaId,
        channelName
      );

      if (!activeSchema) {
        throw createError(
          ErrorCode.SCHEMA_NOT_FOUND,
          `Active schema ${schemaId} not found in channel ${channelName}`,
          { schemaId, channelName }
        );
      }

      console.log(`Active schema found - Version: ${activeSchema.version}`);

      await this.ensureContractAddress();

      const contract = this.getWriteContract(privateKey);

      const schemaIdHash = this.stringToBytes32(schemaId);
      const channelHash = this.stringToBytes32(channelName);

      const txHash = (await contract.write.deprecateSchema([
        schemaIdHash,
        channelHash,
      ])) as any;

      console.log(`Transaction sent: ${txHash}`);

      const receipt = await this.waitForTransaction(txHash);
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      try {
        await this.schemaRepository.updateStatus(
          schemaId,
          channelName,
          activeSchema.version,
          'DEPRECATED'
        );

        console.log(`Version ${activeSchema.version} marks as deprecated in the database`);
      } catch (dbError: any) {
        console.error(`Failed to mark version as deprecated in the database:`, dbError);
        // TODO: Registrar falha para retry 
      }

      return {
        success: true,
        data: {
          schemaId: schemaId,
          channelName: channelName,
          version: activeSchema.version,
          status: "DEPRECATED",
          transactionHash: txHash,
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed?.toString(),
          message: "Schema depreciated successfully",
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError || this.handleBlockchainError(error, "deprecating schema");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Inativar schema
  async inactivateSchema(
    schemaId: string,
    version: number,
    channelName: string,
    privateKey: string
  ): Promise<ApiResponse<any>> {
    try {
      console.log(
        `Inactivating schema: ${schemaId} version ${version} in channel: ${channelName}`
      );

      const schema = await this.schemaRepository.findByVersion({
        schemaId,
        channelName,
        version,
      });

      if (!schema) {
        throw createError(
            ErrorCode.SCHEMA_VERSION_NOT_FOUND,
            `Schema ${schemaId} version ${version} not found in channel ${channelName}`,
            { schemaId, version, channelName }
          );
      }

      console.log(`Schema found - Name: ${schema.name}`);

      await this.ensureContractAddress();

      const contract = this.getWriteContract(privateKey);

      const schemaIdHash = this.stringToBytes32(schemaId);
      const channelHash = this.stringToBytes32(channelName);

      const txHash = (await contract.write.inactivateSchema([
        schemaIdHash,
        version,
        channelHash,
      ])) as any;

      console.log(`Transaction sent: ${txHash}`);

      const receipt = await this.waitForTransaction(txHash);
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      try {
        await this.schemaRepository.updateStatus(
          schemaId,
          channelName,
          version,
          'INACTIVE'
        );

        console.log(`Version ${version} marks as inactive in the database`);
      } catch (dbError: any) {
        console.error(`Failed to mark version as inactive in the database:`, dbError);
        // TODO: Registrar falha para retry
      }

      return {
        success: true,
        data: {
          schemaId,
          version,
          channelName,
          status: "INACTIVE",
          transactionHash: txHash,
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed?.toString(),
          message: `Schema version ${version} inactivated successfully`,
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError || this.handleBlockchainError(error, "inactivating schema");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Atualizar status
  async setSchemaStatus(
    schemaId: string,
    version: number,
    channelName: string,
    newStatus: string,
    privateKey: string
  ): Promise<ApiResponse<any>> {
    try {
      const statusValue = this.convertStatusStringToNumber(newStatus);

      console.log(
        `Changing schema status: ${schemaId} version ${version} to ${statusValue} in channel: ${channelName}`
      );

      const schema = await this.schemaRepository.findByVersion({
        schemaId,
        channelName,
        version,
      });

      if (!schema) {
        throw createError(
            ErrorCode.SCHEMA_VERSION_NOT_FOUND,
            `Schema ${schemaId} version ${version} not found in channel ${channelName}`,
            { schemaId, version, channelName }
          );
      }

      console.log(`Schema found - Current status: ${schema.status}`);

      await this.ensureContractAddress();

      const contract = this.getWriteContract(privateKey);

      const schemaIdHash = this.stringToBytes32(schemaId);
      const channelHash = this.stringToBytes32(channelName);

      console.log(`Status: ${statusValue}`);

      const txHash = (await contract.write.setSchemaStatus([
        schemaIdHash,
        version,
        channelHash,
        statusValue,
      ])) as any;

      console.log(`Transaction sent: ${txHash}`);

      const receipt = await this.waitForTransaction(txHash);
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      try {
        await this.schemaRepository.updateStatus(
          schemaId,
          channelName,
          version,
          newStatus
        );

        console.log(`Status updated to ${newStatus} in DB`);
      } catch (dbError: any) {
        console.error(`Failed to update status in the database:`, dbError);

        // TODO: Registrar falha para retry
      }

      return {
        success: true,
        data: {
          schemaId,
          version,
          channelName,
          previousStatus: schema.status,
          newStatus: this.getStatusName(statusValue),
          transactionHash: txHash,
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed?.toString(),
          message: `Schema status changed to ${this.getStatusName(
            statusValue
          )} successfully`,
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError ||
        this.handleBlockchainError(error, "updating schema status");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Obter schema
  async getSchema(
    dto: GetSchemaDto,
    options: GetSchemaQuery = {}
  ): Promise<ApiResponse<any>> {
    
    const { source = 'database', validateIntegrity = false } = options;

    try {
      if (source === 'blockchain') {
        // Buscar da blockchain
        return await this.getSchemaFromBlockchain(
          dto.channelName,
          dto.schemaId,
          dto.version
        );
      } else {
        // Buscar do banco
        const schemaFromDB = await this.schemaRepository.findByVersion({
          schemaId: dto.schemaId,
          channelName: dto.channelName,
          version: dto.version,
        });

        if (!schemaFromDB) {
          throw createError(
            ErrorCode.SCHEMA_NOT_FOUND,
            dto.version
              ? `Schema ${dto.schemaId} version ${dto.version} not found no channel ${dto.channelName}`
              : `active schema ${dto.schemaId} not found no channel ${dto.channelName}`,
            { schemaId: dto.schemaId, channelName: dto.channelName, version: dto.version }
          );
        }

        // Se solicitou validação de integridade
        if (validateIntegrity) {
          const isValid = await this.validateSchemaIntegrity(schemaFromDB);
          if (!isValid) {
            throw createError(
              ErrorCode.SCHEMA_INTEGRITY_VIOLATION,
              `Hash of database does not match blockchain for schema
              ${dto.schemaId} v${schemaFromDB.version}`,
              { schemaId: dto.schemaId, version: schemaFromDB.version }
            );
          }
        }

        return {
          success: true,
          data: {
            schemaId: schemaFromDB.schemaId,
            channelName: schemaFromDB.channelName,
            version: schemaFromDB.version,
            name: schemaFromDB.name,
            description: schemaFromDB.description,
            fullSchema: schemaFromDB.fullSchema,
            dataHash: schemaFromDB.dataHash,
            owner: schemaFromDB.owner,
            status: schemaFromDB.status,
            blockTimestamp: schemaFromDB.blockTimestamp.toString(),
            transactionHash: schemaFromDB.transactionHash,
            blockNumber: schemaFromDB.blockNumber.toString(),
            createdAt: schemaFromDB.createdAt,
            updatedAt: schemaFromDB.updatedAt,
            source: 'database',
            integrityValidated: validateIntegrity,
          },
        };
      }
    } catch (error) {
      if (error instanceof AppError) {
        return { success: false, error: error.message };
      }

      return {
        success: false,
        error: 'Error obtaining schema',
      };
    }
  }

  // Obter Schema OnChain (sempre da blockchain)
  async getSchemaOnChain(
    dto: GetSchemaDto
  ): Promise<ApiResponse<any>> {
    return await this.getSchemaFromBlockchain(
      dto.channelName,
      dto.schemaId,
      dto.version
    );
  }

  // Obter informações do schema
  async getSchemaInfo(
    channelName: string,
    schemaId: string
  ): Promise<ApiResponse<SchemaInfoResponse>> {
    try {
      console.log(
        `Search for schema: ${schemaId} in channel: ${channelName}`
      );

      await this.ensureContractAddress();

      const contract = this.getReadContract();

      const channelHash = this.stringToBytes32(channelName);
      const schemaIdHash = this.stringToBytes32(schemaId);

      const result = (await contract.read.getSchemaInfo([
        channelHash,
        schemaIdHash,
      ])) as any;

      const [latestVersion, activeVersion] = result;

      const totalVersions = await this.schemaRepository.countVersions(
        schemaId,
        channelName
      );

      console.log(
        `Schema ${schemaId} - latest version: ${latestVersion}, active version: ${activeVersion}`
      );

      return {
        success: true,
        data: {
          schemaId,
          channelName,
          latestVersion: Number(latestVersion),
          activeVersion: Number(activeVersion),
          totalVersions,
          hasActiveVersion: Number(activeVersion) > 0
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError ||
        this.handleBlockchainError(error, "acquiring schema info");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Buscar schema pela versão
  async getSchemaByVersion(
    channelName: string,
    schemaId: string,
    version: number
  ): Promise<ApiResponse<SchemaEntity>> {
    try {
      console.log(
        `Searching for schema: ${schemaId} version ${version} in channel: ${channelName}`
      );

      await this.ensureContractAddress();

      const contract = this.getReadContract();
      const channelHash = this.stringToBytes32(channelName);
      const schemaIdHash = this.stringToBytes32(schemaId);

      const result = (await contract.read.getSchemaByVersion([
        channelHash,
        schemaIdHash,
        version,
      ])) as any;

      const schema: SchemaEntity = {
        id: schemaId,
        name: result.name as string,
        version: Number(result.version),
        dataHash: result.dataHash as string,
        owner: result.owner as string,
        channelName: channelName,
        status: schemaStatusToString(Number(result.status) as SchemaStatus),
        createdAt: result.createdAt.toString(),
        updatedAt: result.updatedAt.toString(),
        description: result.description as string,
      };

      console.log(
        `Schema version ${schema.version} found - status: ${schema.status}`
      );

      return {
        success: true,
        data: schema,
        message: `Schema version ${version} acquired successfully`,
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError ||
        this.handleBlockchainError(error, 'acquiring schema by version');

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  // Buscar schema ativo
  async getActiveSchema(
    channelName: string,
    schemaId: string
  ): Promise<ApiResponse<SchemaEntity>> {
    try {
      console.log(
        `Searching for active schema: ${schemaId} in channel: ${channelName}`
      );

      await this.ensureContractAddress();

      const contract = this.getReadContract();
      const channelHash = this.stringToBytes32(channelName);
      const schemaIdHash = this.stringToBytes32(schemaId);

      const result = (await contract.read.getActiveSchema([
        channelHash,
        schemaIdHash,
      ])) as any;

      console.log(
        `Active schema found - version: ${result.version}, status: ${result.status}`
      );

      const schema: SchemaEntity = {
        id: schemaId,
        name: result.name as string,
        version: Number(result.version),
        dataHash: result.dataHash as string,
        owner: result.owner as string,
        channelName: channelName,
        status: schemaStatusToString(Number(result.status) as SchemaStatus),
        createdAt: result.createdAt.toString(),
        updatedAt: result.updatedAt.toString(),
        description: result.description as string,
      };

      return {
        success: true,
        data: schema,
        message: 'Active schema acquired successfully',
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError ||
        this.handleBlockchainError(error, 'acquiring active schema');

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  
  //LIST Schemas (banco com filtros e paginação)
  async listSchemas(
    filters: ListSchemasDto
  ): Promise<ApiResponse<any>> {
    try {
      const result = await this.schemaRepository.list(filters);

      //console.log(result);

      return {
        success: true,
        data: {
          schemas: result.schemas,
          pagination: result.pagination,
        },
      };
    } catch (error) {
      console.error('Error to list schemas:', error);
      return {
        success: false,
        error: 'Error to list schemas',
      };
    }
  }

  /**
   * HELPER FUNCTIONS
   */
  private getStatusName(status: SchemaStatus): string {
    switch (status) {
      case SchemaStatus.ACTIVE:
        return "ACTIVE";
      case SchemaStatus.DEPRECATED:
        return "DEPRECATED";
      case SchemaStatus.INACTIVE:
        return "INACTIVE";
      default:
        return "UNKNOWN";
    }
  }

  private convertStatusStringToNumber(statusString: string): number {
    const statusKey = statusString.toUpperCase() as keyof typeof SchemaStatus;

    if (!(statusKey in SchemaStatus)) {
      throw createError(
        ErrorCode.INVALID_SCHEMA_STATUS,
        `Invalid schema status: ${statusString}. Valid statuses: ACTIVE, DEPRECATED, INACTIVE`,
        { providedStatus: statusString, validStatuses: ['ACTIVE', 'DEPRECATED', 'INACTIVE'] }
      );
    }

    return SchemaStatus[statusKey];
  }

  //Parseia o evento SchemaCreated dos logs da transação
  private parseSchemaCreatedEvent(receipt: any) {
    try {
      const schemaCreatedLog = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: ISCHEMA_REGISTRY_ABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "SchemaCreated";
        } catch {
          return false;
        }
      });

      if (!schemaCreatedLog) {
        throw createError(
          ErrorCode.TRANSACTION_FAILED,
          "Event SchemaCreated not found in transaction logs",
          { 
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            logsCount: receipt.logs.length 
          }
        );
      }

      // Decodifica o evento
      const decoded = decodeEventLog({
        abi: ISCHEMA_REGISTRY_ABI,
        data: schemaCreatedLog.data,
        topics: schemaCreatedLog.topics,
      });

      // Retorna os dados do evento
      return {
        eventName: decoded.eventName,
        args: decoded.args as {
          id: `0x${string}`; // bytes32 (hash do schemaId)
          name: string;
          version: bigint;
          owner: `0x${string}`;
          channelName: `0x${string}`;
          timestamp: bigint;
        },
        logIndex: schemaCreatedLog.logIndex,
        transactionHash: schemaCreatedLog.transactionHash,
        blockNumber: schemaCreatedLog.blockNumber,
      };
    } catch (error) {
      console.error("Error parsing SchemaCreated event:", error);
      
      if (error instanceof AppError) {throw error;}

      throw createError(
        ErrorCode.TRANSACTION_FAILED,
        "Error parsing SchemaCreated event",
        { 
          originalError: error instanceof Error ? error.message : String(error),
          transactionHash: receipt?.transactionHash 
        }
      );
    }
  }

  //Parseia o evento SchemaUpdated dos logs da transação
  private parseSchemaUpdatedEvent(receipt: any) {
    try {
      const schemaUpdatedLog = receipt.logs.find((log: any) => {
        try {
          const decoded = decodeEventLog({
            abi: ISCHEMA_REGISTRY_ABI,
            data: log.data,
            topics: log.topics,
          });
          return decoded.eventName === "SchemaUpdated";
        } catch {
          return false;
        }
      });

      if (!schemaUpdatedLog) {
        throw createError(
          ErrorCode.TRANSACTION_FAILED,
          "Evento SchemaUpdated not found in transaction logs",
          { 
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            logsCount: receipt.logs.length 
          }
        );
      }

      const decoded = decodeEventLog({
        abi: ISCHEMA_REGISTRY_ABI,
        data: schemaUpdatedLog.data,
        topics: schemaUpdatedLog.topics,
      });

      return {
        eventName: decoded.eventName,
        args: decoded.args as {
          id: `0x${string}`;             
          previousVersion: bigint;         
          newVersion: bigint;              
          owner: `0x${string}`;            
          channelName: `0x${string}`;      
          timestamp: bigint;               
        },
        logIndex: schemaUpdatedLog.logIndex,
        transactionHash: schemaUpdatedLog.transactionHash,
        blockNumber: schemaUpdatedLog.blockNumber,
      };
    } catch (error) {
      console.error("Error parsing SchemaUpdated:", error);

      if (error instanceof AppError) {throw error;}
      
      throw createError(
        ErrorCode.TRANSACTION_FAILED,
        "Error parsing SchemaUpdated event",
        { 
          originalError: error instanceof Error ? error.message : String(error),
          transactionHash: receipt?.transactionHash 
        }
      );
    }
  }

  //Busca schema da blockchain
  private async getSchemaFromBlockchain(
    channelName: string,
    schemaId: string,
    version?: number
  ): Promise<ApiResponse<any>> {
    try {
      if (version) {
        // Buscar versão específica
        return await this.getSchemaByVersion(channelName, schemaId, version);
      } else {
        // Buscar versão ativa
        return await this.getActiveSchema(channelName, schemaId);
      }
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError || this.handleBlockchainError(error, 'searching schema from blockchain');

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  //Valida integridade do schema
  private async validateSchemaIntegrity(schemaFromDB: any): Promise<boolean> {
    try {
      await this.ensureContractAddress();
      const contract = this.getReadContract();

      const channelHash = this.stringToBytes32(schemaFromDB.channelName);
      const schemaIdHash = this.stringToBytes32(schemaFromDB.schemaId);

      const schemaFromChain = (await contract.read.getSchemaByVersion([
        channelHash,
        schemaIdHash,
        schemaFromDB.version,
      ])) as any;

      const dataHashFromChain = schemaFromChain.dataHash;

      // Compara hashes
      return dataHashFromChain === schemaFromDB.dataHash;
    } catch (error) {
      console.error('Error to validate schema integrity:', error);
      return false;
    }
  }
}
