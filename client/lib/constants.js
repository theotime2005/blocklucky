export const BLOCKLUCKY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ticketNumber",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "TicketPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "prize",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ticketCount",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      }
    ],
    "name": "WinnerSelected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxParticipants",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "duration",
        "type": "uint256"
      }
    ],
    "name": "RoundConfigured",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "RoundForced",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "buyTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentLotteryPhase",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "forceDraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
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
    "inputs": [],
    "name": "getLatestRound",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "roundId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "prize",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ticketCount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct BlockLucky.RoundSummary",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayers",
    "outputs": [
      {
        "internalType": "address payable[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getRoundSummary",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "roundId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "winner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "prize",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ticketCount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct BlockLucky.RoundSummary",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRoundCount",
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
    "inputs": [],
    "name": "lastWinner",
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
    "inputs": [],
    "name": "maxParticipants",
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
    "inputs": [],
    "name": "owner",
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
    "inputs": [],
    "name": "roundActive",
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
    "inputs": [],
    "name": "roundDeadline",
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
    "inputs": [],
    "name": "roundDuration",
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
    "inputs": [],
    "name": "roundId",
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
    "inputs": [],
    "name": "ticketPrice",
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
        "internalType": "uint256",
        "name": "_ticketPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxParticipants",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_roundDuration",
        "type": "uint256"
      }
    ],
    "name": "updateConfiguration",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract address (a remplacer apres deploiement)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// Chain ID (Ethereum Mainnet = 1, Sepolia = 11155111)
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1");

// Etherscan URL
export const ETHERSCAN_URL = 
  CHAIN_ID === 1 
    ? "https://etherscan.io" 
    : CHAIN_ID === 11155111 
    ? "https://sepolia.etherscan.io"
    : "https://etherscan.io";

// Ticket price in ETH (0.1 ETH)
export const TICKET_PRICE_ETH = "0.1";

