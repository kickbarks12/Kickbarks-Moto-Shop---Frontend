document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadBrandOptions();

  const filterBtn = document.getElementById("filter-btn");
  if (filterBtn) {
    filterBtn.addEventListener("click", loadProducts);
  }
});

function getToken() {
  return localStorage.getItem("token");
}

async function loadBrandOptions() {
  const brandSelect = document.getElementById("brand-filter");
  if (!brandSelect) return;

  try {
    const res = await fetch(`${window.API_BASE}/api/products`);
    const products = await res.json();

    if (!Array.isArray(products)) return;

    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();

    brandSelect.innerHTML = `
      <option value="">All Brands</option>
      ${brands.map(brand => `<option value="${brand}">${brand}</option>`).join("")}
    `;
  } catch (error) {
    console.error("Load brands error:", error);
  }
}

async function loadProducts() {
  const container = document.getElementById("shop-products");
  if (!container) return;

  const search = document.getElementById("search-input")?.value.trim() || "";
  const brand = document.getElementById("brand-filter")?.value || "";
  const ram = document.getElementById("ram-filter")?.value || "";
  const maxPrice = document.getElementById("price-filter")?.value || "";

  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (brand) params.append("brand", brand);
  if (ram) params.append("ram", ram);
  if (maxPrice) params.append("maxPrice", maxPrice);

  container.innerHTML = `<p>Loading products...</p>`;

  try {
    const res = await fetch(`${window.API_BASE}/api/products?${params.toString()}`);
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = `<p class="text-muted">No products found.</p>`;
      return;
    }

    container.innerHTML = products.map(product => {
      const stockBadge = product.stock > 0
        ? `<span class="badge bg-success badge-stock">In Stock</span>`
        : `<span class="badge bg-danger badge-stock">Out of Stock</span>`;

      return `
        <div class="col-md-6 col-lg-4 col-xl-3">
          <div class="card product-card h-100 shadow-sm">
            <img
              src="${product.image || 'https://via.placeholder.com/300x220?text=No+Image'}"
              class="card-img-top"
              alt="${product.name}"
            >
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0">${product.name}</h5>
                ${stockBadge}
              </div>

              <p class="text-muted mb-1">${product.brand || ""} ${product.model || ""}</p>
              <p class="fw-bold text-warning mb-2">₱${Number(product.price || 0).toLocaleString()}</p>

              <p class="small text-muted mb-1">RAM: ${product.ram || "-"}</p>
              <p class="small text-muted mb-1">Storage: ${product.storage || "-"}</p>
              <p class="small text-muted mb-3">Chipset: ${product.chipset || "-"}</p>

              <div class="mt-auto d-grid gap-2">
                <a href="product.html?id=${product._id}" class="btn btn-dark">View Details</a>
                <button
                  class="btn btn-warning"
                  onclick="addToCart('${product._id}', ${product.stock || 0})"
                  ${product.stock <= 0 ? "disabled" : ""}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error("Load products error:", error);
    container.innerHTML = `<p class="text-danger">Failed to load products.</p>`;
  }
}

async function addToCart(productId, stock) {
  const token = getToken();

  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (stock <= 0) {
    alert("This product is out of stock.");
    return;
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        productId,
        quantity: 1
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to add to cart");
      return;
    }

    alert("Added to cart!");
    if (typeof updateCartCount === "function") {
      updateCartCount();
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Something went wrong.");
  }
}