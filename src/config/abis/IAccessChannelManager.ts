export const IACCESS_CHANNEL_MANAGER_ABI = [
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
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ChannelActivated",
      "type": "event"
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
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ChannelCreated",
      "type": "event"
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
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ChannelDeactivated",
      "type": "event"
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
          "internalType": "address",
          "name": "member",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newMemberCount",
          "type": "uint256"
        }
      ],
      "name": "ChannelMemberAdded",
      "type": "event"
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
          "internalType": "address",
          "name": "member",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newMemberCount",
          "type": "uint256"
        }
      ],
      "name": "ChannelMemberRemoved",
      "type": "event"
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
          "indexed": false,
          "internalType": "address[]",
          "name": "members",
          "type": "address[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newMemberCount",
          "type": "uint256"
        }
      ],
      "name": "ChannelMembersAdded",
      "type": "event"
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
          "indexed": false,
          "internalType": "address[]",
          "name": "members",
          "type": "address[]"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newMemberCount",
          "type": "uint256"
        }
      ],
      "name": "ChannelMembersRemoved",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "channelName",
          "type": "bytes32"
        }
      ],
      "name": "activateChannel",
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
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "addChannelMember",
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
          "internalType": "address[]",
          "name": "members",
          "type": "address[]"
        }
      ],
      "name": "addChannelMembers",
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
          "internalType": "address[]",
          "name": "members",
          "type": "address[]"
        }
      ],
      "name": "areChannelMembers",
      "outputs": [
        {
          "internalType": "bool[]",
          "name": "results",
          "type": "bool[]"
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
        }
      ],
      "name": "createChannel",
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
        }
      ],
      "name": "desactivateChannel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "page",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pageSize",
          "type": "uint256"
        }
      ],
      "name": "getAllChannelsPaginated",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "channels",
          "type": "bytes32[]"
        },
        {
          "internalType": "uint256",
          "name": "totalChannels",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPages",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "hasNextPage",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getChannelCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
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
          "name": "channelName",
          "type": "bytes32"
        }
      ],
      "name": "getChannelInfo",
      "outputs": [
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "memberCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
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
          "name": "channelName",
          "type": "bytes32"
        }
      ],
      "name": "getChannelMemberCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
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
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "page",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pageSize",
          "type": "uint256"
        }
      ],
      "name": "getChannelMembersPaginated",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "members",
          "type": "address[]"
        },
        {
          "internalType": "uint256",
          "name": "totalMembers",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalPages",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "hasNextPage",
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
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "isChannelMember",
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
          "name": "channelName",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "removeChannelMember",
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
          "internalType": "address[]",
          "name": "members",
          "type": "address[]"
        }
      ],
      "name": "removeChannelMembers",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;