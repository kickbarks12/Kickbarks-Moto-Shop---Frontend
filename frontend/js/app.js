const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("products");

  if (container) {
    loadProducts();
  }

  updateCartCount();
  setupAuthUI();
});

// 🔥 LOAD PRODUCTS
async function loadProducts() {
  const container = document.getElementById("products");
  const loading = document.getElementById("loading");
  const emptyMsg = document.getElementById("no-products");

  try {
    container.innerHTML = ""; // ✅ prevent duplicates

    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();

    loading.style.display = "none";

    if (!products.length) {
      emptyMsg.classList.remove("d-none");
      return;
    }

    products.forEach(product => {
      container.innerHTML += `
        <div class="col-md-4 col-lg-3">
          <div class="card product-card h-100 shadow-sm">

            <img src="${product.image || 'https://via.placeholder.com/300'}"
                 class="product-img"
                 onerror="this.src='https://via.placeholder.com/300'">

            <div class="card-body d-flex flex-column">
              <h6 class="fw-bold">${product.name}</h6>
              <p class="product-price mb-2">₱${product.price}</p>

              <button onclick="addToCart('${product._id}')"
                class="btn btn-dark mt-auto">
                Add to Cart
              </button>
            </div>

          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    loading.innerHTML = "<p class='text-danger'>Failed to load products</p>";
  }
}

// 🛒 ADD TO CART
async function addToCart(productId) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("Please login first", "danger");
    setTimeout(() => window.location.href = "login.html", 1000);
    return;
  }

  try {
    await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    showToast("Added to cart 🛒", "success");
    updateCartCount();

  } catch (err) {
    console.error(err);
    showToast("Failed to add to cart", "danger");
  }
}

// 🔢 CART COUNT
async function updateCartCount() {
  const token = localStorage.getItem("token");
  const badge = document.getElementById("cart-count");

  if (!badge) return;

  if (!token) {
    badge.innerText = 0;
    return;
  }

  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!data.items) {
      badge.innerText = 0;
      return;
    }

    const totalItems = data.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    badge.innerText = totalItems;

  } catch (err) {
    console.error(err);
    badge.innerText = 0;
  }
}

// 🔐 AUTH UI
function setupAuthUI() {
  const btn = document.getElementById("auth-btn");
  const token = localStorage.getItem("token");
  const ordersLinks = document.querySelectorAll('a[href="orders.html"]');

  if (!btn) return;

  if (token) {
    btn.innerText = "Logout";
    btn.onclick = () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    };

    ordersLinks.forEach(link => link.style.display = "inline-block");

  } else {
    btn.innerText = "Login";
    btn.onclick = () => {
      window.location.href = "login.html";
    };

    ordersLinks.forEach(link => link.style.display = "none");
  }
}

// 🔥 TOAST (replace alert)
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
  toast.style.zIndex = "9999";

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}