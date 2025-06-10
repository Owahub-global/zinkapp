// Predefined default EVM chains
const DEFAULT_CHAINS = {
  1: {
    name: "Ethereum Mainnet",
    rpc: "https://rpc.ankr.com/eth",
    symbol: "ETH",
    logo: "logos/eth.png",
    explorer: "https://etherscan.io",
  },
  56: {
    name: "BSC Mainnet",
    rpc: "https://bsc-dataseed.binance.org/",
    symbol: "BNB",
    logo: "logos/bnb.png",
    explorer: "https://bscscan.com",
  },
  137: {
    name: "Polygon",
    rpc: "https://polygon-rpc.com/",
    symbol: "MATIC",
    logo: "logos/polygon.png",
    explorer: "https://polygonscan.com",
  },
  42161: {
    name: "Arbitrum One",
    rpc: "https://arb1.arbitrum.io/rpc",
    symbol: "ETH",
    logo: "logos/arbitrum.png",
    explorer: "https://arbiscan.io",
  },
  10: {
    name: "Optimism",
    rpc: "https://mainnet.optimism.io",
    symbol: "ETH",
    logo: "logos/optimism.png",
    explorer: "https://optimistic.etherscan.io",
  },
  43114: {
    name: "Avalanche C-Chain",
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    symbol: "AVAX",
    logo: "logos/avax.png",
    explorer: "https://snowtrace.io",
  },
  250: {
    name: "Fantom Opera",
    rpc: "https://rpcapi.fantom.network",
    symbol: "FTM",
    logo: "logos/fantom.png",
    explorer: "https://ftmscan.com",
  },
  8453: {
    name: "Base Mainnet",
    rpc: "https://mainnet.base.org",
    symbol: "ETH",
    logo: "logos/base.png",
    explorer: "https://basescan.org",
  },
  324: {
    name: "zkSync Era",
    rpc: "https://mainnet.era.zksync.io",
    symbol: "ETH",
    logo: "logos/zksync.png",
    explorer: "https://explorer.zksync.io",
  },
  59144: {
    name: "Linea",
    rpc: "https://rpc.linea.build",
    symbol: "ETH",
    logo: "logos/linea.png",
    explorer: "https://lineascan.build",
  },
  534352: {
    name: "Scroll",
    rpc: "https://rpc.scroll.io",
    symbol: "ETH",
    logo: "logos/scroll.png",
    explorer: "https://scrollscan.com",
  },
  25: {
    name: "Cronos",
    rpc: "https://evm.cronos.org",
    symbol: "CRO",
    logo: "logos/cronos.png",
    explorer: "https://cronoscan.com",
  },
};

// Load user-added chains from localStorage
function getUserChains() {
  return JSON.parse(localStorage.getItem("userChains") || "{}");
}

// Merge default and user chains
function getAllChains() {
  return { ...DEFAULT_CHAINS, ...getUserChains() };
}

// Save a new chain added by user
function addCustomChain(chainId, chainData) {
  const chains = getUserChains();
  chains[chainId] = chainData;
  localStorage.setItem("userChains", JSON.stringify(chains));
}
