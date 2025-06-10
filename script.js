// Tab switch logic
  const tabToken = document.getElementById("tab-token");
  const tabNft = document.getElementById("tab-nft");
  const tokenList = document.getElementById("token-list");
  const nftList = document.getElementById("nft-list");

  tabToken.addEventListener("click", () => {
    tabToken.classList.add("text-white", "fw-bold");
    tabToken.classList.remove("text-secondary");
    tabNft.classList.add("text-secondary");
    tabNft.classList.remove("text-white", "fw-bold");
    tabToken.querySelector(".tab-underline")?.classList.remove("d-none");
    tokenList.classList.remove("d-none");
    nftList.classList.add("d-none");
  });

  tabNft.addEventListener("click", () => {
    tabNft.classList.add("text-white", "fw-bold");
    tabNft.classList.remove("text-secondary");
    tabToken.classList.add("text-secondary");
    tabToken.classList.remove("text-white", "fw-bold");
    tabToken.querySelector(".tab-underline")?.classList.add("d-none");
    tokenList.classList.add("d-none");
    nftList.classList.remove("d-none");
  });


  // hide bals

  const toggleEye = document.getElementById("toggleEye");
  const balanceAmount = document.getElementById("balanceAmount");

  let isVisible = true;
  toggleEye.addEventListener("click", () => {
    isVisible = !isVisible;
    balanceAmount.textContent = isVisible ? "$243.34" : "*******";
    toggleEye.className = isVisible ? "bi bi-eye text-secondary fs-5" : "bi bi-eye-slash text-secondary fs-5";
  });

  // modal
    function selectChain(name) {
      document.querySelector('.text-success').textContent = name;
      const modal = bootstrap.Modal.getInstance(document.getElementById('chainModal'));
      modal.hide();
    }


     // Shorten the address for display
   const fullAddress = localStorage.getItem("walletAddress");
  const shortAddress = fullAddress.slice(0, 6) + "..." + fullAddress.slice(-4);
  document.getElementById("walletAddressDisplay").innerText = shortAddress;

  function copyWalletAddress() {
    navigator.clipboard.writeText(fullAddress).then(() => {
      showCopyAlert();
    });
  }

  function showCopyAlert() {
    const alertBox = document.createElement("div");
    alertBox.className = "alert alert-success text-center position-fixed top-0 start-50 translate-middle-x mt-3";
    alertBox.style.zIndex = "9999";
    alertBox.style.width = "300px";
    alertBox.innerText = "Wallet address copied!";
    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.remove();
    }, 2000);
  }
