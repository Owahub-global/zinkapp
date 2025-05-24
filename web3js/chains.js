// chains.js
const chains = {
  97: {
    name: "BNB Testnet",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    presaleAddress: "0xYourTestnetPresaleAddress",
    abi: presaleAbi
  },
  56: {
    name: "BNB Mainnet",
    rpc: "https://bsc-dataseed.binance.org/",
    presaleAddress: "0xYourMainnetPresaleAddress",
    abi: presaleAbi
  },
  1: {
    name: "Ethereum Mainnet",
    rpc: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    presaleAddress: "0xYourEthereumPresaleAddress",
    abi: presaleAbi
  }
};

const rpcMap = {
  97: chains[97].rpc,
  56: chains[56].rpc,
  1: chains[1].rpc
};
