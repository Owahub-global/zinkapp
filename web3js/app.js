function safeSetText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

let presaleContract;
let tokenContract;

// Load presale contract stats
async function loadPresaleStats() {
  if (!provider || !isChainSupported) return;

  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const chain = chains[chainId];

    if (!chain || !ethers.utils.isAddress(chain.presaleAddress)) {
      showAlert("⚠ You're on the wrong network. Please switch.", "danger");
      return;
    }

    presaleContract = new ethers.Contract(chain.presaleAddress, chain.abi, provider);
    await presaleContract.getStats(); // confirm contract is working
  } catch (err) {
    console.warn("Skipping presale load — likely bad network or placeholder address.");
  }
}

// Load user balance and contribution
async function loadUserInfo() {
  if (!signer || !isChainSupported) return;

  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const chain = chains[chainId];

    if (
      !chain ||
      !ethers.utils.isAddress(chain.tokenAddress) ||
      !ethers.utils.isAddress(chain.presaleAddress)
    ) {
      showAlert("⚠ You're on the wrong network. Please switch.", "danger");
      return;
    }

    tokenContract = new ethers.Contract(chain.tokenAddress, chain.tokenAbi, provider);
    presaleContract = new ethers.Contract(chain.presaleAddress, chain.abi, provider);

    const balance = await tokenContract.balanceOf(userAddress);
    const contribution = await presaleContract.contributions(userAddress);

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
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const chain = chains[chainId];

      if (!chain || !ethers.utils.isAddress(chain.presaleAddress)) return;

      presaleContract = new ethers.Contract(chain.presaleAddress, chain.abi, provider);
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

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const chainConfig = chains[chainId];
      if (!chainConfig || !ethers.utils.isAddress(chainConfig.presaleAddress)) {
        showAlert("⚠ You're on the wrong network. Please switch.", "danger");
        return;
      }

      presaleContract = new ethers.Contract(chainConfig.presaleAddress, chainConfig.presaleAbi, provider);

      let stats;
      try {
        stats = await presaleContract.getStats();
      } catch {
        showAlert("⚠ Could not fetch presale data. Wrong contract or network.", "danger");
        return;
      }

      const minCap = stats[6]; // ensure it's a BigNumber
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

