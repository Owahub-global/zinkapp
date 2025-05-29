

let provider;
let signer;
let userAddress;
let refreshInterval;

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
  const connectBtn = document.getElementById("connectWallet");
  if (connectBtn && userAddress) {
    connectBtn.textContent = shortenAddress(userAddress);
    connectBtn.disabled = true;
    connectBtn.classList.remove("btn-warning");
    connectBtn.classList.add("btn-outline-light");
  }
}

async function checkWalletConnection() {
  if (typeof window.ethereum === "undefined") return false;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      userAddress = accounts[0];
      updateWalletButton();
      return true;
    }
    return false;
  } catch (err) {
    console.error("Connection check failed:", err);
    return false;
  }
}

function startAutoRefresh() {
  // Clear existing interval if any
  if (refreshInterval) clearInterval(refreshInterval);
  
  // Refresh every second
  refreshInterval = setInterval(() => {
    if (provider) {
      loadPresaleStats().catch(console.error);
      if (userAddress) {
        loadUserInfo().catch(console.error);
      }
    }
  }, 1000);
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    showAlert("MetaMask is not installed!", "danger");
    return;
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    updateWalletButton();
    showAlert("✅ Wallet connected");
    startAutoRefresh();

    // Initial load
    await Promise.all([
      loadPresaleStats(),
      loadUserInfo()
    ]);

  } catch (err) {
    console.error("Wallet connection failed:", err);
    showAlert("❌ Wallet connection failed: " + (err.message || ""), "danger");
  }
}

// Handle chain changes
window.ethereum?.on('chainChanged', () => {
  window.location.reload();
});

// Handle account changes
window.ethereum?.on('accountsChanged', (accounts) => {
  if (accounts.length === 0) {
    // Wallet disconnected
    userAddress = null;
    const connectBtn = document.getElementById("connectWallet");
    if (connectBtn) {
      connectBtn.textContent = "Connect Wallet";
      connectBtn.disabled = false;
      connectBtn.classList.add("btn-warning");
      connectBtn.classList.remove("btn-outline-light");
    }
  } else {
    // Account changed
    userAddress = accounts[0];
    updateWalletButton();
  }
});

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectWallet");
  if (connectBtn) {
    connectBtn.addEventListener("click", connectWallet);
  }

  // Check existing connection
  checkWalletConnection().then(isConnected => {
    if (isConnected) {
      startAutoRefresh();
      setTimeout(() => {
        loadPresaleStats().catch(console.error);
        loadUserInfo().catch(console.error);
      }, 200);
    }
  });
});