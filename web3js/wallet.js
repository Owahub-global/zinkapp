// wallet.js
let provider;
let signer;
let userAddress;
let refreshInterval;
let isChainSupported = false; // used to block contract calls

// ---- Web3Modal setup ----
const projectId = "efa9752a2808a896f2ee15158466c98c"; // Your WalletConnect Cloud Project ID

const SafeWalletConnectProvider = window.WalletConnectProvider?.default || window.WalletConnectProvider;

const providerOptions = {
  walletconnect: {
    package: SafeWalletConnectProvider,
    options: {
      projectId,
      rpc: rpcMap // this should be defined globally in chains.js
    }
  }
};

const Web3ModalClass = window.Web3Modal?.default || window.Web3Modal;
const web3Modal = new Web3ModalClass({
  cacheProvider: false,
  providerOptions
});

if (web3Modal.cachedProvider) {
  web3Modal.clearCachedProvider();
}

function shortenAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

function showAlert(message, type = "success") {
  const existing = document.querySelector(".custom-alert");
  if (existing) existing.remove();

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} position-fixed top-0 end-0 m-3 custom-alert`;
  alert.style.zIndex = 9999;
  alert.setAttribute("role", "alert");
  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => alert.remove(), 4000);
}

function updateWalletButton() {
  const btn = document.getElementById("connectWallet");
  if (btn && userAddress) {
    btn.textContent = shortenAddress(userAddress);
    btn.disabled = true;
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-outline-light");
  }
}

async function detectAndSetChain() {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const chainName = chains[chainId]?.name;
    const display = document.getElementById("currentChain");

    if (chainName) {
      isChainSupported = true;
      if (display) display.textContent = chainName;
    } else {
      isChainSupported = false;
      showAlert("⚠ Please switch to a supported network (e.g., BNB Testnet)", "danger");
      if (display) display.textContent = `Unsupported Chain (${chainId})`;
    }
  } catch (err) {
    isChainSupported = false;
    console.error("detectAndSetChain failed:", err);
    showAlert("❌ Could not detect network", "danger");
  }
}

async function checkWalletConnection() {
  if (!window.ethereum) return false;

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = accounts[0];
      updateWalletButton();
      await detectAndSetChain();
      return isChainSupported;
    }
    return false;
  } catch (err) {
    console.error("Connection check failed:", err);
    return false;
  }
}

function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);

  refreshInterval = setInterval(() => {
    if (!provider || !isChainSupported) return;
    loadPresaleStats().catch(console.error);
    if (userAddress) loadUserInfo().catch(console.error);
  }, 1000);
}

async function connectWallet() {
  try {
    const instance = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    updateWalletButton();
    await detectAndSetChain();

    if (!isChainSupported) return;

    showAlert("✅ Wallet connected");
    startAutoRefresh();

    await Promise.all([
      loadPresaleStats(),
      loadUserInfo()
    ]);

    instance.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        userAddress = null;
        const btn = document.getElementById("connectWallet");
        if (btn) {
          btn.textContent = "Connect Wallet";
          btn.disabled = false;
          btn.classList.add("btn-warning");
          btn.classList.remove("btn-outline-light");
        }
      } else {
        userAddress = accounts[0];
        updateWalletButton();
      }
    });

    instance.on("chainChanged", async () => {
      await detectAndSetChain();
      if (isChainSupported) {
        showAlert("✅ Network supported");
        startAutoRefresh();
        loadPresaleStats().catch(console.error);
        loadUserInfo().catch(console.error);
      } else {
        showAlert("⚠ Please switch to a supported network", "danger");
      }
    });

  } catch (err) {
    console.error("Wallet connection failed:", err);
    showAlert("❌ Wallet connection failed: " + (err.message || ""), "danger");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectWallet");
  if (connectBtn) connectBtn.addEventListener("click", connectWallet);

  checkWalletConnection().then((connected) => {
    if (connected && isChainSupported) {
      startAutoRefresh();
      setTimeout(() => {
        loadPresaleStats().catch(console.error);
        loadUserInfo().catch(console.error);
      }, 200);
    }
  });
});
