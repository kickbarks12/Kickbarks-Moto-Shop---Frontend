const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("products");
  const loading = document.getElementById("loading");
  const emptyMsg = document.getElementById("no-products");

  // If not shop page → stop
  if (!container) return;

  loadProducts();
  updateCartCount();
});

// 🔥 LOAD PRODUCTS
async function loadProducts() {
  const container = document.getElementById("products");
  const loading = document.getElementById("loading");
  const emptyMsg = document.getElementById("no-products");

  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();

    loading.style.display = "none";

    if (!products.length) {
      emptyMsg.classList.remove("d-none");
      return;
    }

    products.forEach(product => {
      container.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <img src="${product.image}" class="card-img-top">
            <div class="card-body d-flex flex-column">
              <h5>${product.name}</h5>
              <p class="text-muted">₱${product.price}</p>

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

// ---

// ## 🛒 ADD TO CART + UPDATE COUNT

async function addToCart(productId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity: 1 })
  });

  alert("Added to cart 🛒");
  updateCartCount(); // 🔥 update badge
}

// ---

// ## 🔢 CART COUNT

async function updateCartCount() {
  const token = localStorage.getItem("token");
  const badge = document.getElementById("cart-count");

  if (!badge || !token) return;

  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    const totalItems = data.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    badge.innerText = totalItems;

  } catch (err) {
    console.error(err);
  }
}
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

    // show orders
    ordersLinks.forEach(link => link.style.display = "inline-block");

  } else {
    btn.innerText = "Login";
    btn.onclick = () => {
      window.location.href = "login.html";
    };

    // hide orders
    ordersLinks.forEach(link => link.style.display = "none");
  }
}

setupAuthUI();