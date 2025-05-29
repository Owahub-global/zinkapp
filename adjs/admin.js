let adminContract;
let isAdmin = false;

async function initAdmin() {
  await checkAdminStatus();
  if (isAdmin) {
    await loadAdminData();
    setupEventListeners();
    startAdminDataRefresh();
  }
}

async function checkAdminStatus() {
  if (!userAddress) return;
  try {
    const presale = new ethers.Contract(presaleAddress, presaleAbi, provider);
    const owner = await presale.owner();
    isAdmin = owner.toLowerCase() === userAddress.toLowerCase();
    if (isAdmin) {
      adminContract = new ethers.Contract(presaleAddress, presaleAbi, signer);
      const adminBtn = document.getElementById('adminConnectBtn');
      if (adminBtn) {
        adminBtn.textContent = shortenAddress(userAddress);
        adminBtn.classList.add('disabled');
      }
    } else {
      showAlert("Connected wallet is not admin", "danger");
    }
  } catch (err) {
    console.error("Admin check failed:", err);
    showAlert("Admin check failed: " + (err.message || ""), "danger");
  }
}

async function loadAdminData() {
  if (!isAdmin) return;
  try {
    const stats = await adminContract.getStats();
    const bnbBalance = await provider.getBalance(presaleAddress);
    const tokenBalance = await adminContract.remainingTokens();
    const isPaused = await adminContract.paused();

    // Countdown
    startAdminCountdown(Number(stats[5]));

    // Safely format values
    const formattedRate = ethers.formatUnits(stats[0].toString(), 18); 
    const formattedCap = ethers.formatEther(stats[1]); // in BNB
    const formattedMin = ethers.formatEther(stats[6]);
    const formattedMax = ethers.formatEther(stats[7]);

    document.getElementById('rateCurrent').textContent = formattedRate;
    document.getElementById('capCurrent').textContent = formattedCap;
    document.getElementById('minCurrent').textContent = formattedMin;
    document.getElementById('maxCurrent').textContent = formattedMax;

    // Time inputs as ISO string for <input type="datetime-local">
    document.getElementById('startTimeInput').value = new Date(Number(stats[4]) * 1000).toISOString().slice(0, 16);
    document.getElementById('endTimeInput').value = new Date(Number(stats[5]) * 1000).toISOString().slice(0, 16);

    // Balances
    document.getElementById('bnbBalance').textContent = ethers.formatEther(bnbBalance);
    document.getElementById('unsoldTokens').textContent = ethers.formatUnits(tokenBalance, 18);
    document.getElementById('totalRaisedAdmin').textContent = ethers.formatEther(stats[2]);
    document.getElementById('tokensSoldAdmin').textContent = ethers.formatUnits(stats[3], 18);

    // Presale Status
    const now = BigInt(Math.floor(Date.now() / 1000));
    const start = BigInt(stats[4]);
    const end = BigInt(stats[5]);

    const isActive = !stats[8] && now >= start && now <= end;

    document.getElementById('presaleActive').textContent = isActive ? 'Yes' : 'No';
    document.getElementById('presaleActive').className = isActive ? 'badge bg-success' : 'badge bg-danger';
    document.getElementById('presalePaused').textContent = isPaused ? 'Yes' : 'No';
  } catch (err) {
    console.error("Failed to load admin data:", err);
    showAlert("❌ Failed to load admin data", "danger");
  }
}




function setupEventListeners() {
  document.getElementById('pauseBtn')?.addEventListener('click', pausePresale);
  document.getElementById('resumeBtn')?.addEventListener('click', resumePresale);
  document.getElementById('setRateBtn')?.addEventListener('click', setRate);
  document.getElementById('setCapBtn')?.addEventListener('click', setCap);
  document.getElementById('setMinBtn')?.addEventListener('click', setMinContribution);
  document.getElementById('setMaxBtn')?.addEventListener('click', setMaxContribution);
  document.getElementById('setTimeBtn')?.addEventListener('click', setTimeframe);
  document.getElementById('withdrawBNBBtn')?.addEventListener('click', withdrawBNB);
  document.getElementById('withdrawTokensBtn')?.addEventListener('click', withdrawTokens);
}

let adminRefreshInterval;
function startAdminDataRefresh() {
  adminRefreshInterval = setInterval(loadAdminData, 5000);
}

// ---- Graceful admin actions ----

async function pausePresale() {
  try {
    const tx = await adminContract.pausePresale();
    await tx.wait();
    showAlert("Presale paused successfully", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to pause presale", "danger");
  }
}

async function resumePresale() {
  try {
    const tx = await adminContract.resumePresale();
    await tx.wait();
    showAlert("Presale resumed successfully", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to resume presale", "danger");
  }
}

async function setRate() {
  try {
    const rawRate = document.getElementById('rateInput').value;
    const rate = ethers.parseUnits(rawRate, 18); // <— not 0!
    const tx = await adminContract.setRate(rate);
    await tx.wait();
    showAlert("Rate updated successfully", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to set rate", "danger");
  }
}


async function setCap() {
  try {
    const cap = ethers.parseEther(document.getElementById('capInput').value);
    const tx = await adminContract.setCap(cap);
    await tx.wait();
    showAlert("Cap updated successfully", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to set cap", "danger");
  }
}

async function setMinContribution() {
  const value = document.getElementById("minInput").value;
  if (!value) return showAlert("Enter minimum amount", "warning");
  try {
    const tx = await adminContract.setMinContribution(ethers.parseEther(value));
    await tx.wait();
    showAlert("Min contribution updated", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to set min", "danger");
  }
}

async function setMaxContribution() {
  const value = document.getElementById("maxInput").value;
  if (!value) return showAlert("Enter max amount", "warning");
  try {
    const tx = await adminContract.setMaxContribution(ethers.parseEther(value));
    await tx.wait();
    showAlert("Max contribution updated", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to set max", "danger");
  }
}

async function setTimeframe() {
const startStr = document.getElementById("startTimeInput").value;
const endStr = document.getElementById("endTimeInput").value;

if (!startStr || !endStr) return showAlert("Enter both start and end times", "warning");

const start = Math.floor(new Date(startStr).getTime() / 1000);
const end = Math.floor(new Date(endStr).getTime() / 1000);

try {
  const tx = await adminContract.setTimeFrame(start, end);

    await tx.wait();
    showAlert("Presale timeframe updated", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to set timeframe", "danger");
  }
}

async function withdrawBNB() {
  try {
    const tx = await adminContract.withdrawBNB(userAddress);
    await tx.wait();
    showAlert("✅ BNB withdrawn", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to withdraw BNB", "danger");
  }
}

async function withdrawTokens() {
  try {
    const tx = await adminContract.withdrawUnsoldTokens(userAddress);
    await tx.wait();
    showAlert("✅ Unsold tokens withdrawn", "success");
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    showAlert("Failed to withdraw tokens", "danger");
  }
}

window.addEventListener('load', () => {
  const checkAdmin = setInterval(() => {
    if (userAddress) {
      clearInterval(checkAdmin);
      initAdmin();
    }
  }, 500);
});



async function fundPresale() {
  const amount = document.getElementById("fundInput").value;
  if (!amount || isNaN(amount)) {
    showAlert("⚠ Enter a valid token amount", "warning");
    return;
  }

  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
    const amountInUnits = ethers.parseUnits(amount, 18); // adjust if your token has a different decimal

    const tx = await tokenContract.transfer(presaleAddress, amountInUnits);
    await tx.wait();

    showAlert("✅ Token funding successful", "success");
    loadAdminData(); // refresh UI
  } catch (err) {
    if (err.code === "ACTION_REJECTED") return;
    console.error("Funding failed:", err);
    showAlert("❌ Token funding failed", "danger");
  }
}


let adminCountdownInterval;

function startAdminCountdown(endTime) {
  console.log("Admin countdown triggered with:", endTime); // debug

  clearInterval(adminCountdownInterval);

  adminCountdownInterval = setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = Math.max(endTime - now, 0);
    const el = document.getElementById("adminCountdown");

    if (el) el.textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) clearInterval(adminCountdownInterval);
  }, 1000);
}

function formatTime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}
