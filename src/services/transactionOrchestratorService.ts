import { keccak256, toHex, parseAbiItem, decodeEventLog } from "viem";
import { BlockchainService } from "./base/blockchainService";
import { AddressDiscoveryService } from "./addressDiscoveryService";
import { ProcessRegistryService } from "./processRegistryService";
import { ITRANSACTION_ORCHESTRATOR_ABI } from "../config/abis/ITransactionOrchestrator";
import { ApiResponse } from "../types/channelTypes";
import { TransactionStructureValidator } from "../validators/transactionStructureValidator";
import { ContractErrorHandler } from "../errors/contractErrorHandler";

export class TransactionOrchestratorService extends BlockchainService {
  private addressDiscoveryService: AddressDiscoveryService;
  private processRegistryService: ProcessRegistryService;
  private cachedContractAddress: `0x${string}` | null = null;
  private cachedAssetRegistryAddress: `0x${string}` | null = null;

  protected contractAddress: `0x${string}` =
    "0x0000000000000000000000000000000000000000";
  protected contractAbi = [...ITRANSACTION_ORCHESTRATOR_ABI];

  constructor() {
    super();
    this.addressDiscoveryService = new AddressDiscoveryService();
    this.processRegistryService = new ProcessRegistryService();
  }

  private async ensureContractAddress(): Promise<void> {
    if (this.cachedContractAddress) {
      return;
    }

    const result = await this.addressDiscoveryService.getAddress(
      "TRANSACTION_ORCHESTRATOR"
    );

    if (!result.success || !result.data?.addressContract) {
      throw new Error(
        "TransactionOrchestrator não encontrado no AddressDiscovery"
      );
    }

    this.cachedContractAddress = result.data.addressContract as `0x${string}`;
    this.contractAddress = this.cachedContractAddress;
  }

  private async ensureAssetRegistryAddress(): Promise<string> {
    if (this.cachedAssetRegistryAddress) {
      return this.cachedAssetRegistryAddress;
    }

    const result = await this.addressDiscoveryService.getAddress(
      "ASSET_REGISTRY"
    );

    if (!result.success || !result.data?.addressContract) {
      throw new Error("AssetRegistry não encontrado no AddressDiscovery");
    }

    this.cachedAssetRegistryAddress = result.data
      .addressContract as `0x${string}`;
    console.log(
      "AssetRegistry address cached:",
      this.cachedAssetRegistryAddress
    ); // Debug
    return this.cachedAssetRegistryAddress;
  }

  private stringToBytes32(str: string): `0x${string}` {
    return keccak256(toHex(str));
  }

  // Método principal
  async submitTransaction(
    requestBody: any,
    privateKey: string
  ): Promise<ApiResponse<any>> {
    try {
      console.log(
        `Submetendo transação: ${requestBody.processId} - action será validada dinamicamente`
      );

      // 1. Obter action do processo
      const processResult = await this.processRegistryService.getProcess(
        requestBody.channel.name,
        requestBody.process.processId,
        requestBody.process.natureId,
        requestBody.process.stageId
      );

      if (!processResult.success) {
        return {
          success: false,
          error: "Processo não encontrado",
        };
      }

      const action = processResult.data?.action;
      if (!action) {
        return {
          success: false,
          error: "Action do processo não identificada",
        };
      }

      console.log(`Action do processo: ${action}`);

      // 2. Validação estrutural
      const structuralValidation =
        TransactionStructureValidator.validateStructure(action, requestBody);
      if (!structuralValidation.isValid) {
        console.error(
          "Falha na validação estrutural:",
          structuralValidation.error
        );
        return { success: false, error: structuralValidation.error! };
      }

      console.log("Validação estrutural: OK");

      // 3. Preparar os contratos
      await this.ensureContractAddress();
      await this.ensureAssetRegistryAddress();

      const contract = this.getWriteContract(privateKey);

      // 4. Preparar request para o contrato
      const contractRequest = this.buildContractRequest(action, requestBody);

      console.log("Enviando transação para o contrato...");

      // 5. Executar transação
      const txHash = (await contract.write.submitTransaction([
        contractRequest,
      ])) as any;

      console.log(`Transação enviada: ${txHash}`);

      const receipt = await this.waitForTransaction(txHash);

      const assetIds = this.extractAssetIdsFromReceipt(receipt, action);

      const responseData = {
        transaction: {
          hash: txHash,
          blockNumber: receipt.blockNumber?.toString() || "0",
          gasUsed: receipt.gasUsed?.toString() || "0",
        },

        operation: {
          type: action,
          success: true,
          assetsCreated: assetIds.created,
          assetsModified: assetIds.modified,
        },
      };

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError ||
        this.handleBlockchainError(error, "submeter transação");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  public clearAddressCache(): void {
    this.cachedContractAddress = null;
  }

  private generateDataHash(data: any[]): string {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return "";
    }

    const dataString = JSON.stringify(data);
    const hash = require("crypto")
      .createHash("sha256")
      .update(dataString)
      .digest("hex");
    return "0x" + hash;
  }

  private extractAssetIdsFromReceipt(receipt: any, action: string) {
    const assetRegistryLogs = receipt.logs.filter(
      (log: any) =>
        log.address.toLowerCase() ===
        this.cachedAssetRegistryAddress!.toLowerCase()
    );

    for (const log of assetRegistryLogs) {
      try {
        const assetOperationExecutedAbi = parseAbiItem(
          "event AssetOperationExecuted(bytes32 indexed channelName, bytes32 indexed assetId, uint8 operation, uint8 status, uint256 timestamp, bytes32[] relatedAssetIds, uint256[] relatedAmounts, address indexed owner, string idLocal, uint256 amount, bytes32 dataHash)"
        );

        const decoded = decodeEventLog({
          abi: [assetOperationExecutedAbi],
          data: log.data,
          topics: log.topics,
        });

        const args = decoded.args;

        switch (action) {
          case "CREATE_ASSET":
            return { created: [args.assetId], modified: [] };
          case "UPDATE_ASSET":
            return { created: [], modified: [args.assetId] };
          case "TRANSFER_ASSET":
            return { created: [], modified: [args.assetId] };
          case "INACTIVATE_ASSET":
            return { created: [], modified: [args.assetId] };
          case "SPLIT_ASSET":
            return { created: args.relatedAssetIds, modified: [args.assetId] };
          case "GROUP_ASSET":
            return { created: [args.assetId], modified: args.relatedAssetIds };
          case "TRANSFORM_ASSET":
            return { created: [args.assetId], modified: args.relatedAssetIds };
          case "UNGROUP_ASSET":
            return {
              created: [],
              modified: [...args.relatedAssetIds, args.assetId],
            };
          default:
            return { created: [], modified: [] };
        }
      } catch (error) {
        continue;
      }
    }

    return { created: [], modified: [] };
  }

  private buildContractRequest(action: string, requestBody: any): any {
    const dataHash = this.generateDataHash(requestBody.data);
    const emptyBytes32 =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const emptyAddress = "0x0000000000000000000000000000000000000000";

    // Base comum a todas as actions
    const baseRequest = {
      processId: this.stringToBytes32(requestBody.process.processId.trim()),
      natureId: this.stringToBytes32(requestBody.process.natureId.trim()),
      stageId: this.stringToBytes32(requestBody.process.stageId.trim()),
      channelName: this.stringToBytes32(requestBody.channel.name.trim()),
    };

    switch (action) {
      case "CREATE_ASSET":
        return {
          ...baseRequest,
          targetAssetIds: [], // CREATE não tem targetAssetIds
          operationData: {
            amount: requestBody.asset.amount,
            idLocal: requestBody.asset.idLocal?.trim() || "",
            dataHash: dataHash,
            // Outros campos vazios/default conforme contrato espera
            newOwner: emptyAddress,
            amounts: [],
            newAssetId: emptyBytes32,
            newAmount: 0,
            newIdLocal: "",
            newDataHash: emptyBytes32,
          },
        };

      case "UPDATE_ASSET":
        return {
          ...baseRequest,
          targetAssetIds: requestBody.asset.assetIds,
          operationData: {
            amount: 0,
            idLocal: "",
            dataHash: dataHash,
            newOwner: emptyAddress,
            amounts: [],
            newAssetId: emptyBytes32,
            newAmount: requestBody.asset.newAmount || 0,
            newIdLocal: requestBody.asset.newIdLocal?.trim() || "",
            newDataHash: emptyBytes32,
          },
        };
      default:
        throw new Error(`Action '${action}' não suportada`);
    }
  }
}
