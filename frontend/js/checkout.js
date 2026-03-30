document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("Please login first.", "danger");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
    return;
  }

  loadCheckout();

  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      placeOrder();
    });
  }
});

function getToken() {
  return localStorage.getItem("token");
}

function showCheckoutAlert(message, type = "danger") {
  const alertBox = document.getElementById("checkout-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-4" role="alert">
      ${message}
    </div>
  `;
}

async function loadCheckout() {
  const container = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!container || !totalEl) return;

  container.innerHTML = `<div class="loading-state">Loading order summary...</div>`;

  try {
    const res = await fetch(`${window.API_BASE}/api/cart`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="mb-3">Cart is empty.</p>
          <a href="shop.html" class="btn btn-primary rounded-pill px-4">Go to Shop</a>
        </div>
      `;
      totalEl.textContent = "0";
      if (placeOrderBtn) placeOrderBtn.disabled = true;
      return;
    }

    let total = 0;

    container.innerHTML = items.map(item => {
      const product = item.product || {};
      const qty = Number(item.quantity || 0);
      const subtotal = Number(product.price || 0) * qty;
      total += subtotal;

      return `
        <div class="checkout-line">
          <div>
            <strong>${product.name || "Product"}</strong>
            <div class="small text-muted">Qty: ${qty}</div>
          </div>
          <strong>₱${subtotal.toLocaleString("en-PH")}</strong>
        </div>
      `;
    }).join("");

    totalEl.textContent = total.toLocaleString("en-PH");
  } catch (err) {
    console.error("Checkout load error:", err);
    container.innerHTML = `<div class="empty-state text-danger">Failed to load checkout items.</div>`;
  }
}

async function placeOrder() {
  const fullname = document.getElementById("fullname")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();
  const payment = document.getElementById("payment")?.value || "COD";
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!fullname || !phone || !address) {
    showCheckoutAlert("Please fill all shipping details.");
    showToast("Please fill all shipping details.", "danger");
    return;
  }

  if (placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Placing order...";
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullname,
        phone,
        address,
        paymentMethod: payment,
        status: "Pending"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showCheckoutAlert(data.message || "Order failed.");
      showToast(data.message || "Order failed.", "danger");
      if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = "Place Order";
      }
      return;
    }

    showCheckoutAlert("Order placed successfully!", "success");
    showToast("Order placed successfully!", "success");

    if (typeof updateCartCount === "function") {
      updateCartCount();
    }

    setTimeout(() => {
      window.location.href = "orders.html";
    }, 900);
  } catch (err) {
    console.error("Place order error:", err);
    showCheckoutAlert("Something went wrong while placing your order.");
    showToast("Something went wrong while placing your order.", "danger");
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
    }
  }
}