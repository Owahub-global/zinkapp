function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

let presaleContract;
let tokenContract;
let countdownInterval;

// Load presale contract stats
async function loadPresaleStats() {
  if (!provider || !isChainSupported) return;

  try {
    const { chainId } = await provider.getNetwork();
    const chain = chains[Number(chainId)];

    if (!chain || !ethers.utils.isAddress(chain.presaleAddress)) {
      console.warn("Unsupported chain or invalid presale address");
      return;
    }

    presaleContract = new ethers.Contract(chain.presaleAddress, chain.presaleAbi, provider);
    const stats = await presaleContract.getStats(); // Confirm contract responds

    // Countdown: call the timer starter
    const endTime = Number(stats[5].toString());
    startCountdown(endTime);

  } catch (err) {
    console.warn("Skipping presale load — likely bad network or placeholder address.");
  }
}

// Start countdown timer
function startCountdown(endTime) {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = Math.max(endTime - now, 0);
    safeSetText("timeLeft", formatTime(timeLeft));
    if (timeLeft === 0) clearInterval(countdownInterval);
  }, 1000);
}

// Format time
function formatTime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

// Load user balance and contribution
async function loadUserInfo() {
  if (!signer || !isChainSupported) return;

  try {
    const { chainId } = await provider.getNetwork();
    const chain = chains[Number(chainId)];

    if (
      !chain ||
      !ethers.utils.isAddress(chain.tokenAddress) ||
      !ethers.utils.isAddress(chain.presaleAddress)
    ) {
      return;
    }

    tokenContract = new ethers.Contract(chain.tokenAddress, chain.tokenAbi, provider);
    presaleContract = new ethers.Contract(chain.presaleAddress, chain.presaleAbi, provider);

    const [balance, contribution] = await Promise.all([
      tokenContract.balanceOf(userAddress),
      presaleContract.contributions(userAddress)
    ]);

    safeSetText("userTokens", ethers.utils.formatUnits(balance, 18));
    safeSetText("userBNB", ethers.utils.formatEther(contribution));
  } catch (err) {
    console.warn("Skipping user load — likely unsupported network.");
  }
}

// Token preview from input
const bnbInput = document.getElementById("bnbAmount");
if (bnbInput) {
  bnbInput.oninput = async function () {
    const amount = bnbInput.value;
    if (!amount || isNaN(amount) || !isChainSupported) return;

    try {
      const { chainId } = await provider.getNetwork();
      const chain = chains[Number(chainId)];

      if (!chain || !ethers.utils.isAddress(chain.presaleAddress)) return;

      presaleContract = new ethers.Contract(chain.presaleAddress, chain.presaleAbi, provider);
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

      const { chainId } = await provider.getNetwork();
      const chain = chains[Number(chainId)];

      if (!chain || !ethers.utils.isAddress(chain.presaleAddress)) {
        showAlert("⚠ You're on the wrong network. Please switch.", "danger");
        return;
      }

      presaleContract = new ethers.Contract(chain.presaleAddress, chain.presaleAbi, provider);

      let stats;
      try {
        stats = await presaleContract.getStats();
      } catch {
        showAlert("⚠ Could not fetch presale data. Wrong contract or network.", "danger");
        return;
      }

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

      if (err.code === "ACTION_REJECTED") {
        console.warn("User rejected the transaction.");
        return;
      }

      const reason = err?.data?.message || err?.message || "Transaction failed";
      showAlert(`❌ ${reason}`, "danger");
    }
  };
}
