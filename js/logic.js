function renderChainList() {
  const container = document.getElementById("chainListContainer");
  container.innerHTML = ""; // Clear previous list

  const chains = getAllChains();

  for (const chainId in chains) {
    const chain = chains[chainId];
    const li = document.createElement("li");
    li.className = "list-group-item bg-dark text-white list-group-item-action d-flex align-items-center gap-2";
    li.innerHTML = `
      <img src="${chain.logo}" width="24" height="24" class="rounded-circle border border-secondary" />
      <div class="flex-grow-1">${chain.name}</div>
      <small class="text-secondary">#${chainId}</small>
    `;
    li.onclick = () => {
      selectChain(chainId);
      const modal = bootstrap.Modal.getInstance(document.getElementById("chainModal"));
      if (modal) modal.hide();
    };
    container.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", renderChainList);
