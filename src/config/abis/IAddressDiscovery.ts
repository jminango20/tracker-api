export const IADDRESS_DISCOVERY_ABI = [
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "smartContract",
          "type": "bytes32"
        }
      ],
      "name": "ContractNotRegistered",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        }
      ],
      "name": "InvalidAddress",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "smartContract",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "oldAddress",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "updatedBy",
          "type": "address"
        }
      ],
      "name": "AddressUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "smartContract",
          "type": "bytes32"
        }
      ],
      "name": "getContractAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "smartContract",
          "type": "bytes32"
        }
      ],
      "name": "isRegistered",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "smartContract",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "newAddress",
          "type": "address"
        }
      ],
      "name": "updateAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;