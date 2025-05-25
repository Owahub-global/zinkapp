const chains = {
  // 🔹 Testnets First
  97: {
    name: "BNB Testnet",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    presaleAddress: "0x3B4f322A9e7d9a3fa035825BBA13177C60b7F1E0",
    tokenAddress: "0x299f4361Be1cC70A6DbF3daDF711Fbc5272CD59D",
    presaleAbi,
    tokenAbi
  },
  11155111: {
    name: "Ethereum Sepolia",
    rpc: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    presaleAddress: "0xYourSepoliaPresaleAddress",
    tokenAddress: "0xYourSepoliaTokenAddress",
    presaleAbi,
    tokenAbi
  },

  // 🔹 Mainnets
  56: {
    name: "BNB Mainnet",
    rpc: "https://bsc-dataseed.binance.org/",
    presaleAddress: "0xYourBNBMainnetPresaleAddress",
    tokenAddress: "0xYourBNBMainnetTokenAddress",
    presaleAbi,
    tokenAbi
  },
  1: {
    name: "Ethereum Mainnet",
    rpc: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    presaleAddress: "0xYourEthereumPresaleAddress",
    tokenAddress: "0xYourEthereumTokenAddress",
    presaleAbi,
    tokenAbi
  },
  137: {
    name: "Polygon Mainnet",
    rpc: "https://polygon-rpc.com/",
    presaleAddress: "0xYourPolygonPresaleAddress",
    tokenAddress: "0xYourPolygonTokenAddress",
    presaleAbi,
    tokenAbi
  },
  10: {
    name: "Optimism Mainnet",
    rpc: "https://mainnet.optimism.io",
    presaleAddress: "0xYourOptimismPresaleAddress",
    tokenAddress: "0xYourOptimismTokenAddress",
    presaleAbi,
    tokenAbi
  },
  42161: {
    name: "Arbitrum One",
    rpc: "https://arb1.arbitrum.io/rpc",
    presaleAddress: "0xYourArbitrumPresaleAddress",
    tokenAddress: "0xYourArbitrumTokenAddress",
    presaleAbi,
    tokenAbi
  },
  43114: {
    name: "Avalanche C-Chain",
    rpc: "https://api.avax.network/ext/bc/C/rpc",
    presaleAddress: "0xYourAvalanchePresaleAddress",
    tokenAddress: "0xYourAvalancheTokenAddress",
    presaleAbi,
    tokenAbi
  },

  // 🔹 Extra Testnets
  80001: {
    name: "Polygon Mumbai",
    rpc: "https://rpc-mumbai.maticvigil.com",
    presaleAddress: "0xYourMumbaiPresaleAddress",
    tokenAddress: "0xYourMumbaiTokenAddress",
    presaleAbi,
    tokenAbi
  },
  420: {
    name: "Optimism Goerli",
    rpc: "https://goerli.optimism.io",
    presaleAddress: "0xYourOptimismGoerliPresaleAddress",
    tokenAddress: "0xYourOptimismGoerliTokenAddress",
    presaleAbi,
    tokenAbi
  },
  421613: {
    name: "Arbitrum Goerli",
    rpc: "https://goerli-rollup.arbitrum.io/rpc",
    presaleAddress: "0xYourArbitrumGoerliPresaleAddress",
    tokenAddress: "0xYourArbitrumGoerliTokenAddress",
    presaleAbi,
    tokenAbi
  },
  43113: {
    name: "Avalanche Fuji",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    presaleAddress: "0xYourAvalancheFujiPresaleAddress",
    tokenAddress: "0xYourAvalancheFujiTokenAddress",
    presaleAbi,
    tokenAbi
  }
};

// 🔁 Web3Modal requires this for WalletConnect v2
const rpcMap = {};
Object.keys(chains).forEach((id) => {
  rpcMap[id] = chains[id].rpc;
});
