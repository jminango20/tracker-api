import { keccak256, toHex } from "viem";
import { BlockchainService } from "./base/blockchainService";
import { config } from "../config/app";
import { IADDRESS_DISCOVERY_ABI } from "../config/abis/IAddressDiscovery";
import { ApiResponse, ContractData } from "../types/channelTypes";
import { ContractErrorHandler } from "../errors/contractErrorHandler";

export class AddressDiscoveryService extends BlockchainService {
  protected contractAddress = config.blockchain.addressDiscoveryAddress;
  protected contractAbi = [...IADDRESS_DISCOVERY_ABI];

  private nameToHash(name: string): `0x${string}` {
    return keccak256(toHex(name));
  }

  async getAddress(contractName: string): Promise<ApiResponse<ContractData>> {
    try {
      console.log(`Buscando endereço para: ${contractName}`);

      const contract = this.getReadContract();
      const contractHash = this.nameToHash(contractName);

      const addressContract = (await contract.read.getContractAddress([
        contractHash,
      ])) as any;

      console.log(`Endereço encontrado: ${addressContract}`);

      return {
        success: true,
        data: {
          contractName,
          addressContract,
          isRegistered: true,
          message: "Endereço encontrado com sucesso",
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError || this.handleBlockchainError(error, "buscar endereço");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  async isRegistered(contractName: string): Promise<ApiResponse<ContractData>> {
    try {
      console.log(`Verificando se o contrato ${contractName} está registrado`);

      const contract = this.getReadContract();
      const contractHash = this.nameToHash(contractName);

      const result = (await contract.read.isRegistered([contractHash])) as any;
      const isRegistered = Boolean(result);

      console.log(`Status do registro: ${isRegistered}`);

      return {
        success: true,
        data: {
          contractName,
          isRegistered,
          message: `O contrato ${contractName} ${
            isRegistered ? "está" : "não está"
          } registrado`,
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError ||
        this.handleBlockchainError(error, "verificar registro");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }

  async updateAddress(
    contractName: string,
    newAddress: string,
    privateKey: string
  ): Promise<ApiResponse<any>> {
    try {
      console.log(
        `Atualizando endereço de: ${contractName} para: ${newAddress}`
      );

      const contract = this.getWriteContract(privateKey);
      const contractHash = this.nameToHash(contractName);

      const txHash = await contract.write.updateAddress([
        contractHash,
        newAddress as `0x${string}`,
      ]);

      console.log(`Transação enviada: ${txHash}`);

      const receipt = await this.waitForTransaction(txHash);

      return {
        success: true,
        data: {
          contractName,
          newAddress,
          transactionHash: txHash,
          blockNumber: receipt.blockNumber?.toString(),
          gasUsed: receipt.gasUsed?.toString(),
          message: "Endereço atualizado com sucesso",
        },
      };
    } catch (error) {
      const contractError = ContractErrorHandler.handleContractError(
        error as Error
      );
      const errorInfo =
        contractError ||
        this.handleBlockchainError(error, "atualizar endereço");

      return {
        success: false,
        error: errorInfo.message,
      };
    }
  }
}
