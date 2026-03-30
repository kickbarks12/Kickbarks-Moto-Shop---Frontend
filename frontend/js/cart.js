document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  loadCart();

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
  }
});

function getToken() {
  return localStorage.getItem("token");
}

async function loadCart() {
  const container = document.getElementById("cart-items");
  const summaryItems = document.getElementById("summary-items");
  const summaryTotal = document.getElementById("summary-total");

  if (!container) return;

  container.innerHTML = `<p>Loading cart...</p>`;

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
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4 text-center">
            <h4 class="fw-bold mb-2">Your cart is empty</h4>
            <p class="text-muted mb-3">Looks like you haven’t added any phone yet.</p>
            <a href="shop.html" class="btn btn-warning">Shop Now</a>
          </div>
        </div>
      `;
      if (summaryItems) summaryItems.textContent = "0";
      if (summaryTotal) summaryTotal.textContent = "₱0";
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
        <div class="card border-0 shadow-sm rounded-4 mb-3">
          <div class="card-body p-3 p-md-4">
            <div class="row align-items-center g-3">
              <div class="col-md-3">
                <img
                  src="${product.image || 'https://via.placeholder.com/300x220?text=No+Image'}"
                  alt="${product.name || 'Product'}"
                  class="img-fluid rounded-4 w-100"
                  style="height: 180px; object-fit: cover;"
                >
              </div>

              <div class="col-md-5">
                <h5 class="fw-bold mb-1">${product.name || "Unnamed Product"}</h5>
                <p class="text-muted mb-1">${product.brand || ""} ${product.model || ""}</p>
                <p class="small text-muted mb-1">RAM: ${product.ram || "-"}</p>
                <p class="small text-muted mb-0">Storage: ${product.storage || "-"}</p>
              </div>

              <div class="col-md-2">
                <span class="text-muted d-block">Price</span>
                <strong>₱${price.toLocaleString()}</strong>
              </div>

              <div class="col-md-2">
                <span class="text-muted d-block">Qty</span>
                <strong>${quantity}</strong>
              </div>

              <div class="col-12 d-flex justify-content-between align-items-center pt-2 border-top">
                <strong>Subtotal: ₱${subtotal.toLocaleString()}</strong>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${product._id}')">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (summaryItems) summaryItems.textContent = totalItems;
    if (summaryTotal) summaryTotal.textContent = `₱${totalAmount.toLocaleString()}`;
  } catch (error) {
    console.error("Load cart error:", error);
    container.innerHTML = `<p class="text-danger">Failed to load cart.</p>`;
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
      alert(data.message || "Failed to remove item.");
      return;
    }

    await loadCart();
    if (typeof updateCartCount === "function") {
      updateCartCount();
    }
  } catch (error) {
    console.error("Remove from cart error:", error);
    alert("Something went wrong.");
  }
}

async function checkout() {
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.disabled = true;

  try {
    const res = await fetch(`${window.API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Checkout failed.");
      if (checkoutBtn) checkoutBtn.disabled = false;
      return;
    }

    alert("Checkout successful!");
    if (typeof updateCartCount === "function") {
      updateCartCount();
    }
    window.location.href = "orders.html";
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Something went wrong during checkout.");
    if (checkoutBtn) checkoutBtn.disabled = false;
  }
}