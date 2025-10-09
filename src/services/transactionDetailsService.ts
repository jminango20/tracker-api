import { TransactionReceipt, Log, decodeEventLog } from "viem";
import { publicClient } from "../config/blockchain";
import { AddressDiscoveryService } from "./addressDiscoveryService";
import { ApiResponse } from "../types/channelTypes";
import { IACCESS_CHANNEL_MANAGER_ABI } from "../config/abis/IAccessChannelManager";
import { ISCHEMA_REGISTRY_ABI } from "../config/abis/ISchemaRegistry";
import { IPROCESS_REGISTRY_ABI } from "../config/abis/IProcessRegistry";
import { IASSET_REGISTRY_ABI } from "../config/abis/IAssetRegistry";
import { ITRANSACTION_ORCHESTRATOR_ABI } from "../config/abis/ITransactionOrchestrator";

interface ParsedEvent {
  contractAddress: string;
  contractName?: string;
  eventName: string;
  args: Record<string, any>;
  logIndex: number;
  decoded: boolean;
  raw?: Log;
}

interface TransactionDetails {
  transaction: {
    hash: string;
    blockNumber: string;
    blockHash: string;
    transactionIndex: number;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    status: "success" | "failed";
    timestamp: string;
  };
  events: ParsedEvent[];
  summary: {
    totalEvents: number;
    decodedEvents: number;
    involvedContracts: string[];
    success: boolean;
  };
}

export class TransactionDetailsService {
  private addressDiscoveryService: AddressDiscoveryService;
  private contractAddresses: Map<string, string> = new Map();

  constructor() {
    this.addressDiscoveryService = new AddressDiscoveryService();
    setTimeout(() => this.initializeContractAddresses(), 1000);
  }

  private getPublicClient() {
    return publicClient;
  }

  private async initializeContractAddresses(): Promise<void> {
    try {
      const contracts = [
        "ACCESS_CHANNEL_MANAGER",
        "SCHEMA_REGISTRY",
        "PROCESS_REGISTRY",
        "ASSET_REGISTRY",
        "TRANSACTION_ORCHESTRATOR",
      ];

      for (const contractName of contracts) {
        const result = await this.addressDiscoveryService.getAddress(
          contractName
        );
        if (result.success && result.data?.addressContract) {
          this.contractAddresses.set(
            result.data.addressContract.toLowerCase(),
            contractName
          );
        }
      }
      console.log(
        "Endereços dos contratos carregados:",
        this.contractAddresses.size
      );
    } catch (error) {
      console.warn("Erro ao inicializar endereços dos contratos:", error);
    }
  }

  async getTransactionDetails(
    txHash: `0x${string}`
  ): Promise<ApiResponse<TransactionDetails>> {
    try {
      console.log(`Analisando transação: ${txHash}`);

      const client = this.getPublicClient();

      const [transaction, receipt] = await Promise.all([
        client.getTransaction({ hash: txHash }),
        client.getTransactionReceipt({ hash: txHash }),
      ]);

      if (!transaction || !receipt) {
        return {
          success: false,
          error: "Transação não encontrada",
        };
      }

      const block = await client.getBlock({ blockNumber: receipt.blockNumber });

      // Analisar TODOS os eventos
      const events = await this.parseAllEvents(receipt.logs);

      const summary = this.createTransactionSummary(events, receipt);

      const details: TransactionDetails = {
        transaction: {
          hash: transaction.hash,
          blockNumber: receipt.blockNumber.toString(),
          blockHash: receipt.blockHash,
          transactionIndex: receipt.transactionIndex,
          from: transaction.from,
          to: transaction.to || "0x0000000000000000000000000000000000000000",
          value: transaction.value.toString(),
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: transaction.gasPrice?.toString() || "0",
          status: receipt.status === "success" ? "success" : "failed",
          timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
        },
        events,
        summary,
      };

      console.log(`Transação analisada - ${events.length} eventos encontrados`);

      return {
        success: true,
        data: details,
        message: `Transação analisada com sucesso - ${events.length} eventos encontrados`,
      };
    } catch (error) {
      console.error(
        "Erro ao buscar detalhes da transação: ",
        error instanceof Error ? error.message : error
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? `Erro ao buscar detalhes da transação: ${txHash}`
            : "Erro desconhecido",
      };
    }
  }

  private async parseAllEvents(logs: Log[]): Promise<ParsedEvent[]> {
    const events: ParsedEvent[] = [];

    console.log(`Analisando ${logs.length} logs...`);

    for (const log of logs) {
      const contractAddress = log.address.toLowerCase();
      const contractName = this.contractAddresses.get(contractAddress);

      let decoded = false;
      let eventName = "Unknown";
      let args: Record<string, any> = {};

      try {
        if (contractName === "ASSET_REGISTRY") {
          const decodedLog = decodeEventLog({
            abi: IASSET_REGISTRY_ABI,
            data: log.data,
            topics: log.topics,
          });

          eventName = decodedLog.eventName;
          args = this.formatEventArgs(decodedLog.args);
          decoded = true;
          console.log(`Evento decodificado: ${eventName} (AssetRegistry)`);
        } else if (contractName === "TRANSACTION_ORCHESTRATOR") {
          const decodedLog = decodeEventLog({
            abi: ITRANSACTION_ORCHESTRATOR_ABI,
            data: log.data,
            topics: log.topics,
          });

          eventName = decodedLog.eventName;
          args = this.formatEventArgs(decodedLog.args);
          decoded = true;
          console.log(
            `Evento decodificado: ${eventName} (TransactionOrchestrator)`
          );
        } else if (contractName === "SCHEMA_REGISTRY") {
          const decodedLog = decodeEventLog({
            abi: ISCHEMA_REGISTRY_ABI,
            data: log.data,
            topics: log.topics,
          });

          eventName = decodedLog.eventName;
          args = this.formatEventArgs(decodedLog.args);
          decoded = true;
          console.log(`Evento decodificado: ${eventName} (SchemaRegistry)`);
        } else if (contractName === "PROCESS_REGISTRY") {
          const decodedLog = decodeEventLog({
            abi: IPROCESS_REGISTRY_ABI,
            data: log.data,
            topics: log.topics,
          });

          eventName = decodedLog.eventName;
          args = this.formatEventArgs(decodedLog.args);
          decoded = true;
          console.log(`Evento decodificado: ${eventName} (ProcessRegistry)`);
        } else if (contractName === "ACCESS_CHANNEL_MANAGER") {
          const decodedLog = decodeEventLog({
            abi: IACCESS_CHANNEL_MANAGER_ABI,
            data: log.data,
            topics: log.topics,
          });

          eventName = decodedLog.eventName;
          args = this.formatEventArgs(decodedLog.args);
          decoded = true;
          console.log(
            `Evento decodificado: ${eventName} (AccessChannelManager)`
          );
        }
      } catch (error) {
        console.warn(
          `Não foi possível decodificar evento em ${contractAddress}`
        );
        decoded = false;
      }

      events.push({
        contractAddress: log.address,
        contractName: contractName || "Unknown",
        eventName,
        args,
        logIndex: log.logIndex || 0,
        decoded,
        raw: decoded ? undefined : log,
      });
    }

    console.log(
      `Total processado: ${events.length} eventos (${
        events.filter((e) => e.decoded).length
      } decodificados)`
    );
    return events;
  }

  private formatEventArgs(args: any): Record<string, any> {
    const formatted: Record<string, any> = {};

    if (Array.isArray(args)) {
      args.forEach((arg, index) => {
        formatted[`arg${index}`] = this.formatValue(arg);
      });
    } else if (typeof args === "object") {
      for (const [key, value] of Object.entries(args)) {
        formatted[key] = this.formatValue(value);
      }
    }

    return formatted;
  }

  private formatValue(value: any): any {
    if (typeof value === "bigint") {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.map((v) => this.formatValue(v));
    }
    if (typeof value === "object" && value !== null) {
      const formatted: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        formatted[k] = this.formatValue(v);
      }
      return formatted;
    }
    return value;
  }

  private createTransactionSummary(
    events: ParsedEvent[],
    receipt: TransactionReceipt
  ) {
    const involvedContracts = Array.from(
      new Set(events.map((event) => event.contractAddress))
    );
    const decodedEvents = events.filter((e) => e.decoded).length;

    return {
      totalEvents: events.length,
      decodedEvents,
      involvedContracts,
      success: receipt.status === "success",
    };
  }
}
