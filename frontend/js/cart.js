document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("Please login first.", "danger");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
    return;
  }

  loadCart();
});

function getToken() {
  return localStorage.getItem("token");
}

function getProductImage(product) {
  if (product?.image) return product.image;

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === "string") {
      return firstImage.startsWith("http") ? firstImage : `${window.API_BASE}${firstImage}`;
    }
  }

  return "https://via.placeholder.com/300x220?text=No+Image";
}

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

async function loadCart() {
  const container = document.getElementById("cart-items");
  const summaryItems = document.getElementById("summary-items");
  const summaryTotal = document.getElementById("summary-total");
  const summaryItemsTop = document.getElementById("summary-items-top");
  const summaryTotalTop = document.getElementById("summary-total-top");

  if (!container) return;

  container.innerHTML = `<div class="loading-state">Loading cart...</div>`;

  try {
    const res = await fetch(`${window.API_BASE}/api/cart`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const cart = await res.json();
    const items = Array.isArray(cart.items) ? cart.items : [];

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h4 class="fw-bold mb-2">Your cart is empty</h4>
          <p class="mb-3">Looks like you haven’t added any phone yet.</p>
          <a href="shop.html" class="btn btn-primary rounded-pill px-4">Shop Now</a>
        </div>
      `;

      if (summaryItems) summaryItems.textContent = "0";
      if (summaryTotal) summaryTotal.textContent = "₱0";
      if (summaryItemsTop) summaryItemsTop.textContent = "0";
      if (summaryTotalTop) summaryTotalTop.textContent = "₱0";
      return;
    }

    let totalItems = 0;
    let totalAmount = 0;

    container.innerHTML = items.map(item => {
      const product = item.product || {};
      const quantity = Number(item.quantity || 0);
      const price = Number(product.price || 0);
      const subtotal = quantity * price;

      totalItems += quantity;
      totalAmount += subtotal;

      return `
        <div class="cart-item-card mb-3">
          <div class="row align-items-center g-3">
            <div class="col-md-3">
              <img src="${getProductImage(product)}" alt="${product.name || 'Product'}" class="cart-item-image">
            </div>

            <div class="col-md-4">
              <h5 class="fw-bold mb-1">${product.name || "Unnamed Product"}</h5>
              <p class="text-muted mb-1">${product.brand || ""} ${product.model || ""}</p>
              <p class="small text-muted mb-1">RAM: ${product.ram || "-"}</p>
              <p class="small text-muted mb-0">Storage: ${product.storage || "-"}</p>
            </div>

            <div class="col-md-2">
              <span class="text-muted d-block">Price</span>
              <strong>${formatPrice(price)}</strong>
            </div>

            <div class="col-md-1">
              <span class="text-muted d-block">Qty</span>
              <strong>${quantity}</strong>
            </div>

            <div class="col-md-2">
              <span class="text-muted d-block">Subtotal</span>
              <strong>${formatPrice(subtotal)}</strong>
            </div>
          </div>

          <div class="d-flex justify-content-end pt-3 mt-3 border-top">
            <button class="btn btn-outline-danger rounded-pill px-4" onclick="removeFromCart('${product._id}')">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join("");

    if (summaryItems) summaryItems.textContent = totalItems;
    if (summaryTotal) summaryTotal.textContent = formatPrice(totalAmount);
    if (summaryItemsTop) summaryItemsTop.textContent = totalItems;
    if (summaryTotalTop) summaryTotalTop.textContent = formatPrice(totalAmount);
  } catch (error) {
    console.error("Load cart error:", error);
    container.innerHTML = `<div class="empty-state text-danger">Failed to load cart.</div>`;
  }
}

async function removeFromCart(productId) {
  try {
    const res = await fetch(`${window.API_BASE}/api/cart/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to remove item.", "danger");
      return;
    }

    showToast("Item removed from cart.", "success");
    await loadCart();

    if (typeof updateCartCount === "function") {
      updateCartCount();
    }
  } catch (error) {
    console.error("Remove from cart error:", error);
    showToast("Something went wrong.", "danger");
  }
}