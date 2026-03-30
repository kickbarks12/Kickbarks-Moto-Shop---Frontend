function ensureToastContainer() {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container-custom";
    document.body.appendChild(container);
  }

  return container;
}

function showToast(message, type = "primary") {
  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `custom-toast custom-toast-${type}`;
  toast.innerHTML = `
    <div class="custom-toast-body">
      <span>${message}</span>
      <button type="button" class="custom-toast-close">&times;</button>
    </div>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector(".custom-toast-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => toast.remove());
  }

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

function showInlineAlert(containerId, message, type = "danger") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type} rounded-4">${message}</div>`;
}