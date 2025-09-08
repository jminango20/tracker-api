export const ISCHEMA_REGISTRY_ABI = [
    {
      "inputs": [],
      "name": "DescriptionTooLong",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidDataHash",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidSchemaId",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidSchemaName",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "enum ISchemaRegistry.SchemaStatus",
          "name": "current",
          "type": "uint8"
        },
        {
          "internalType": "enum ISchemaRegistry.SchemaStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "InvalidStatusTransition",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidVersion",
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
        }
      ],
      "name": "NoActiveSchemaVersion",
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
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "NotSchemaOwner",
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
        }
      ],
      "name": "SchemaAlreadyExistsCannotRecreate",
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
      "name": "SchemaAlreadyInactive",
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
          "internalType": "enum ISchemaRegistry.SchemaStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "SchemaNotActive",
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
        }
      ],
      "name": "SchemaNotFoundInChannel",
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
      "name": "SchemaVersionNotFoundInChannel",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "SchemaCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "enum ISchemaRegistry.SchemaStatus",
          "name": "oldStatus",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "enum ISchemaRegistry.SchemaStatus",
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
      "name": "SchemaStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "previousVersion",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "newVersion",
          "type": "uint256"
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
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "SchemaUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            }
          ],
          "internalType": "struct ISchemaRegistry.SchemaInput",
          "name": "schema",
          "type": "tuple"
        }
      ],
      "name": "createSchema",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "schemaId",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        }
      ],
      "name": "deprecateSchema",
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
          "name": "schemaId",
          "type": "bytes32"
        }
      ],
      "name": "getActiveSchema",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "version",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
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
              "internalType": "enum ISchemaRegistry.SchemaStatus",
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
              "name": "updatedAt",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            }
          ],
          "internalType": "struct ISchemaRegistry.Schema",
          "name": "schema",
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
          "name": "schemaId",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        }
      ],
      "name": "getSchemaByVersion",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "version",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "dataHash",
              "type": "bytes32"
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
              "internalType": "enum ISchemaRegistry.SchemaStatus",
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
              "name": "updatedAt",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            }
          ],
          "internalType": "struct ISchemaRegistry.Schema",
          "name": "schema",
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
          "name": "schemaId",
          "type": "bytes32"
        }
      ],
      "name": "getSchemaInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "latestVersion",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "activeVersion",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
        },
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        }
      ],
      "name": "inactivateSchema",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
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
        },
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "enum ISchemaRegistry.SchemaStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "setSchemaStatus",
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
              "name": "id",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "newDataHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "channelName",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            }
          ],
          "internalType": "struct ISchemaRegistry.SchemaUpdateInput",
          "name": "schema",
          "type": "tuple"
        }
      ],
      "name": "updateSchema",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;