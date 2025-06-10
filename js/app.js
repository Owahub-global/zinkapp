// =========================
// Alien Wallet App Logic
// =========================

function createWallet(wordCount = 12) {
  const strength = wordCount === 24 ? 32 : 16;
  const entropy = ethers.utils.randomBytes(strength);
  const mnemonic = ethers.utils.entropyToMnemonic(entropy);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);

  // Save to localStorage
  localStorage.setItem("walletAddress", wallet.address);
  localStorage.setItem("mnemonic", mnemonic);
  localStorage.setItem("privateKey", wallet.privateKey);

  // Go to save.html
  window.location.href = "save.html";
}

function importWallet(input) {
  let wallet, mnemonic = null;
  const trimmed = input.trim();

  try {
    if (trimmed.split(" ").length >= 12) {
      wallet = ethers.Wallet.fromMnemonic(trimmed);
      mnemonic = trimmed;
    } else {
      wallet = new ethers.Wallet(trimmed);
    }

    // Save to localStorage
    localStorage.setItem("walletAddress", wallet.address);
    localStorage.setItem("privateKey", wallet.privateKey);
    if (mnemonic) localStorage.setItem("mnemonic", mnemonic);

    // Redirect to dashboard
    window.location.href = "index.html";

  } catch (err) {
    alert("❌ Invalid seed phrase or private key.");
  }
}

// =========================
// UI Event Handling
// =========================

document.addEventListener("DOMContentLoaded", () => {
  // Create button modal trigger
  document.getElementById("create-wallet-btn")?.addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("createWalletModal")).show();
  });

  // Import button modal trigger
  document.getElementById("import-wallet-btn")?.addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("importWalletModal")).show();
  });

  // Attach global handler for Create button (used in modal)
  window.createWalletUI = function (words = 12) {
    createWallet(words);
  };

  // Import modal confirm button logic
  const confirmBtn = document.querySelector("#importWalletModal .btn-primary");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const input = document.querySelector(".input-area").innerText.trim();
      if (input.length > 0) {
        importWallet(input);
      } else {
        alert("Please paste your seed phrase or private key.");
      }
    });
  }
});
