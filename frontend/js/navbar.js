function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

async function updateCartCount() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;

  const token = getToken();

  if (!token) {
    cartCountEl.textContent = "0";
    return;
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      cartCountEl.textContent = "0";
      return;
    }

    const cart = await res.json();
    const items = Array.isArray(cart.items) ? cart.items : [];
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    cartCountEl.textContent = totalQty;
  } catch (error) {
    console.error("Cart count error:", error);
    cartCountEl.textContent = "0";
  }
}

function setupNavbar() {
  const authArea = document.getElementById("auth-area");
  if (!authArea) return;

  const user = getUser();
  const token = getToken();

  if (token && user) {
    authArea.innerHTML = `
      <a href="profile.html" class="btn btn-outline-light btn-sm">Profile</a>
      <a href="orders.html" class="btn btn-outline-light btn-sm">Orders</a>
      <button id="logout-btn" class="btn btn-warning btn-sm">Logout</button>
    `;

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "login.html";
      });
    }
  } else {
    authArea.innerHTML = `
      <a href="login.html" class="btn btn-outline-light btn-sm">Login</a>
      <a href="register.html" class="btn btn-warning btn-sm">Register</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  updateCartCount();
});