export const ITRANSACTION_ORCHESTRATOR_ABI = [
    {
      "inputs": [],
      "name": "InvalidNatureId",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidProcessId",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidStageId",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "errorMessage",
          "type": "string"
        }
      ],
      "name": "TransactionValidationFailed",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "enum IProcessRegistry.ProcessAction",
          "name": "action",
          "type": "uint8"
        }
      ],
      "name": "UnsupportedOperation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "pauseTransactions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "resumeTransactions",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "processId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "natureId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "stageId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32[]",
              "name": "targetAssetIds",
              "type": "bytes32[]"
            },
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "idLocal",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "dataHash",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                },
                {
                  "internalType": "uint256[]",
                  "name": "amounts",
                  "type": "uint256[]"
                },
                {
                  "internalType": "bytes32",
                  "name": "newAssetId",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "newAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "newIdLocal",
                  "type": "string"
                },
                {
                  "internalType": "bytes32",
                  "name": "newDataHash",
                  "type": "bytes32"
                }
              ],
              "internalType": "struct ITransactionOrchestrator.OperationData",
              "name": "operationData",
              "type": "tuple"
            }
          ],
          "internalType": "struct ITransactionOrchestrator.TransactionRequest",
          "name": "request",
          "type": "tuple"
        }
      ],
      "name": "submitTransaction",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "original",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalSplit",
          "type": "uint256"
        }
      ],
      "name": "AmountConservationViolated",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "AssetAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "AssetAlreadyUngrouped",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "AssetNotActive",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "AssetNotFound",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "AssetNotGrouped",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DuplicateAssetsInGroup",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        }
      ],
      "name": "EmptyLocation",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "provided",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimum",
          "type": "uint256"
        }
      ],
      "name": "InsufficientAssetsToGroup",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "provided",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "minimum",
          "type": "uint8"
        }
      ],
      "name": "InsufficientSplitParts",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "InvalidAmount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "InvalidAssetId",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "InvalidGroupAmount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "InvalidOwnerAddress",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "expected",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "found",
          "type": "address"
        }
      ],
      "name": "MixedOwnershipNotAllowed",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "NotAllowedTransferToSameOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "NotAssetOwner",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyTransactionOrchestrator",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "SelfReferenceInGroup",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "minimum",
          "type": "uint256"
        }
      ],
      "name": "SplitAmountTooSmall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "operation",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "status",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32[]",
          "name": "relatedAssetIds",
          "type": "bytes32[]"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "relatedAmounts",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "idLocal",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "dataHash",
          "type": "bytes32"
        }
      ],
      "name": "AssetOperationExecuted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "idLocal",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IAssetRegistry.CreateAssetInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "createAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "assetId",
          "type": "bytes32"
        }
      ],
      "name": "getAsset",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "idLocal",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "originOwner",
              "type": "address"
            },
            {
              "internalType": "enum IAssetRegistry.AssetStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "enum IAssetRegistry.AssetOperation",
              "name": "operation",
              "type": "uint8"
            },
            {
              "internalType": "bytes32[]",
              "name": "groupedAssets",
              "type": "bytes32[]"
            },
            {
              "internalType": "bytes32",
              "name": "groupedBy",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "parentAssetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "transformationId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32[]",
              "name": "childAssets",
              "type": "bytes32[]"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastUpdated",
              "type": "uint256"
            }
          ],
          "internalType": "struct IAssetRegistry.Asset",
          "name": "asset",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32[]",
              "name": "assetIds",
              "type": "bytes32[]"
            },
            {
              "internalType": "bytes32",
              "name": "groupAssetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "newIdLocal",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IAssetRegistry.GroupAssetsInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "groupAssets",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "newIdLocal",
              "type": "string"
            }
          ],
          "internalType": "struct IAssetRegistry.InactivateAssetInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "inactivateAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "uint256[]",
              "name": "amounts",
              "type": "uint256[]"
            },
            {
              "internalType": "string",
              "name": "newIdLocal",
              "type": "string"
            }
          ],
          "internalType": "struct IAssetRegistry.SplitAssetInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "splitAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "newIdLocal",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IAssetRegistry.TransferAssetInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "transferAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "newAssetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "newIdLocal",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "newAmount",
              "type": "uint256"
            }
          ],
          "internalType": "struct IAssetRegistry.TransformAssetInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "transformAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "newIdLocal",
              "type": "string"
            }
          ],
          "internalType": "struct IAssetRegistry.UngroupAssetsInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "ungroupAssets",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "assetId",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "newAmount",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "newIdLocal",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IAssetRegistry.UpdateAssetInput",
          "name": "input",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "originCaller",
          "type": "address"
        }
      ],
      "name": "updateAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;