const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// 🔐 Redirect if not logged in
if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});

// 🛒 LOAD CART
async function loadCart() {
  const cartEl = document.getElementById("cart");
  const totalEl = document.getElementById("total");
  const emptyEl = document.getElementById("empty-cart");

  try {
    cartEl.innerHTML = "";

    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    let total = 0;

    // ❌ EMPTY CART
    if (!data.items.length) {
      emptyEl.classList.remove("d-none");
      totalEl.innerText = 0;
      return;
    }

    emptyEl.classList.add("d-none");

    data.items.forEach(item => {
      const product = item.product;
      const subtotal = product.price * item.quantity;
      total += subtotal;

      cartEl.innerHTML += `
        <div class="list-group-item d-flex align-items-center justify-content-between">

          <!-- PRODUCT -->
          <div class="d-flex align-items-center gap-3">
            <img src="${product.image || 'https://via.placeholder.com/80'}"
                 width="70" height="70"
                 style="object-fit:cover; border-radius:8px;"
                 onerror="this.src='https://via.placeholder.com/80'">

            <div>
              <strong>${product.name}</strong><br>
              <small class="text-muted">₱${product.price}</small>
            </div>
          </div>

          <!-- CONTROLS -->
          <div class="d-flex align-items-center gap-2">

            <button 
              onclick="updateQty('${product._id}', -1)" 
              class="btn btn-sm btn-outline-danger"
              ${item.quantity <= 1 ? "disabled" : ""}
            >−</button>

            <span>${item.quantity}</span>

            <button 
              onclick="updateQty('${product._id}', 1)" 
              class="btn btn-sm btn-outline-success"
            >+</button>

            <button 
              onclick="removeItem('${product._id}')" 
              class="btn btn-sm btn-outline-dark"
            >✕</button>

          </div>

          <!-- SUBTOTAL -->
          <div class="fw-bold text-warning">
            ₱${subtotal}
          </div>

        </div>
      `;
    });

    totalEl.innerText = total;

  } catch (err) {
    console.error(err);
    cartEl.innerHTML = "<p class='text-danger'>Failed to load cart ❌</p>";
  }
}

// ➕➖ UPDATE QTY
async function updateQty(productId, change) {
  try {
    await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: change })
    });

    loadCart();
    updateCartCount();

  } catch (err) {
    console.error(err);
    showToast("Failed to update quantity", "danger");
  }
}

// ❌ REMOVE ITEM
async function removeItem(productId) {
  try {
    await fetch(`${API_URL}/cart/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    showToast("Item removed", "warning");
    loadCart();
    updateCartCount();

  } catch (err) {
    console.error(err);
    showToast("Failed to remove item", "danger");
  }
}

// 💳 CHECKOUT
async function checkout() {
  try {
    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    showToast("Order placed successfully ✅", "success");
    loadCart();
    updateCartCount();

  } catch (err) {
    console.error(err);
    showToast("Checkout failed", "danger");
  }
}

// 🔥 TOAST (same as app.js)
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
  toast.style.zIndex = "9999";

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}
function goCheckout() {
  const total = document.getElementById("total").innerText;

  if (total == "0") {
    showToast("Your cart is empty", "warning");
    return;
  }

  window.location.href = "checkout.html";
}