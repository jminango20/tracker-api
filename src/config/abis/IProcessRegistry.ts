export const IPROCESS_REGISTRY_ABI = [
    {
      "inputs": [],
      "name": "DescriptionTooLong",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "schemaId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        }
      ],
      "name": "DuplicateSchemaInList",
      "type": "error"
    },
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
      "inputs": [
        {
          "internalType": "enum IProcessRegistry.ProcessStatus",
          "name": "current",
          "type": "uint8"
        },
        {
          "internalType": "enum IProcessRegistry.ProcessStatus",
          "name": "newStatus",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "InvalidProcessStatusTransition",
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
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "processId",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "caller",
          "type": "address"
        }
      ],
      "name": "NotProcessOwner",
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
        }
      ],
      "name": "ProcessAlreadyExists",
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
          "name": "processId",
          "type": "bytes32"
        }
      ],
      "name": "ProcessAlreadyInactive",
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
          "name": "processId",
          "type": "bytes32"
        }
      ],
      "name": "ProcessNotFound",
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
          "name": "schemaId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        }
      ],
      "name": "SchemaNotActiveInChannel",
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
          "name": "schemaId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        }
      ],
      "name": "SchemaNotFoundInChannel",
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
      "name": "SchemasRequiredForAction",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "processId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "natureId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "stageId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "enum IProcessRegistry.ProcessAction",
          "name": "action",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ProcessCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "processId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "enum IProcessRegistry.ProcessStatus",
          "name": "oldStatus",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "enum IProcessRegistry.ProcessStatus",
          "name": "newStatus",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "updatedBy",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ProcessStatusChanged",
      "type": "event"
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
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schemaId",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "version",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IProcessRegistry.SchemaReference[]",
              "name": "schemas",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IProcessRegistry.ProcessAction",
              "name": "action",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            }
          ],
          "internalType": "struct IProcessRegistry.ProcessInput",
          "name": "processInput",
          "type": "tuple"
        }
      ],
      "name": "createProcess",
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
        }
      ],
      "name": "getProcess",
      "outputs": [
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
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "schemaId",
                  "type": "bytes32"
                },
                {
                  "internalType": "uint256",
                  "name": "version",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IProcessRegistry.SchemaReference[]",
              "name": "schemas",
              "type": "tuple[]"
            },
            {
              "internalType": "enum IProcessRegistry.ProcessAction",
              "name": "action",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "enum IProcessRegistry.ProcessStatus",
              "name": "status",
              "type": "uint8"
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
          "internalType": "struct IProcessRegistry.Process",
          "name": "process",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
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
        }
      ],
      "name": "inactivateProcess",
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
          "internalType": "enum IProcessRegistry.ProcessStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "setProcessStatus",
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
        }
      ],
      "name": "validateProcessForSubmission",
      "outputs": [
        {
          "internalType": "bool",
          "name": "isValid",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const