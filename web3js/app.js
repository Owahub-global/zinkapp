function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

let presaleContract;
let tokenContract;

// Load presale contract stats
async function loadPresaleStats() {
  if (!provider || !presaleAddress || !presaleAbi || !isChainSupported) {
    console.warn("Presale not ready — missing provider or unsupported chain.");
    return;
  }

  try {
    presaleContract = new ethers.Contract(presaleAddress, presaleAbi, provider);
    await presaleContract.getStats(); // Required to initialize
  } catch (err) {
    console.error("❌ loadPresaleStats failed:", err);
    showAlert("❌ Failed to load presale stats. Wrong network or not deployed.", "danger");
  }
}

// Load user balance and contribution
async function loadUserInfo() {
  if (!signer || !presaleContract || !tokenAddress || !tokenAbi || !isChainSupported) return;

  try {
    // Validate addresses
    if (!ethers.utils.isAddress(tokenAddress) || !ethers.utils.isAddress(userAddress)) {
      console.warn("Invalid token or user address.");
      return;
    }

    tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

    const balance = await tokenContract.balanceOf(userAddress);
    const contribution = await presaleContract.contributions(userAddress);

    safeSetText("userTokens", ethers.utils.formatUnits(balance, 18));
    safeSetText("userBNB", ethers.utils.formatEther(contribution));
  } catch (err) {
    console.error("Failed to load user info:", err);
    showAlert("❌ Failed to load your info. You may be on the wrong network.", "danger");
  }
}

// Token preview from input
const bnbInput = document.getElementById("bnbAmount");
if (bnbInput) {
  bnbInput.oninput = async function () {
    const amount = bnbInput.value;
    if (!amount || isNaN(amount) || !presaleContract || !isChainSupported) return;

    try {
      const tokens = await presaleContract.getTokenAmount(ethers.utils.parseEther(amount));
      safeSetText("previewZK", ethers.utils.formatUnits(tokens, 18));
    } catch (err) {
      console.error("Preview error:", err);
    }
  };
}

// Buy token function
const buyBtn = document.getElementById("buyBtn");
if (buyBtn) {
  buyBtn.onclick = async function () {
    const value = document.getElementById("bnbAmount").value;
    if (!signer || !value || isNaN(value) || !isChainSupported) {
      showAlert("⚠️ Enter a valid BNB amount", "warning");
      return;
    }

    try {
      const amountInEther = ethers.utils.parseEther(value);
      const balance = await provider.getBalance(userAddress);
      const stats = await presaleContract.getStats();
      const minCap = stats[6];

      if (amountInEther.lt(minCap)) {
        showAlert("❌ Enter at least the minimum contribution", "danger");
        return;
      }

      if (balance.lt(amountInEther)) {
        showAlert("❌ Insufficient BNB balance", "danger");
        return;
      }

      const presaleWithSigner = presaleContract.connect(signer);
      const tx = await presaleWithSigner.buyTokens({ value: amountInEther });
      await tx.wait();

      showAlert("✅ Purchase successful!", "success");

      await Promise.all([
        loadUserInfo(),
        loadPresaleStats()
      ]);

    } catch (err) {
      console.error("Transaction failed:", err);
      const reason = err?.data?.message || err?.message || "Transaction failed";
      showAlert(`❌ ${reason}`, "danger");
    }
  };
}
