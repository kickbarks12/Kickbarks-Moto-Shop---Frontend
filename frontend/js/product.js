document.addEventListener("DOMContentLoaded", loadProductDetails);

function getToken() {
  return localStorage.getItem("token");
}

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getProductImage(product) {
  if (product?.image) return product.image;

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === "string") {
      return firstImage.startsWith("http") ? firstImage : `${window.API_BASE}${firstImage}`;
    }
  }

  return "https://via.placeholder.com/700x600?text=No+Image";
}

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

async function loadProductDetails() {
  const container = document.getElementById("product-details");
  const productId = getProductId();

  if (!container) return;

  if (!productId) {
    container.innerHTML = `
      <div class="alert alert-danger rounded-4">
        Product ID is missing.
      </div>
    `;
    return;
  }

  container.innerHTML = `<div class="loading-state">Loading product details...</div>`;

  try {
    const res = await fetch(`${window.API_BASE}/api/products/${productId}`);
    const product = await res.json();

    if (!res.ok) {
      container.innerHTML = `
        <div class="alert alert-danger rounded-4">
          ${product.message || "Failed to load product."}
        </div>
      `;
      return;
    }

    const stockBadge = product.stock > 0
      ? `<span class="badge bg-success fs-6 rounded-pill px-3 py-2">In Stock</span>`
      : `<span class="badge bg-danger fs-6 rounded-pill px-3 py-2">Out of Stock</span>`;

    container.innerHTML = `
      <div class="product-hero-card">
        <div class="row g-0">
          <div class="col-lg-5 product-image-panel">
            <img
              src="${getProductImage(product)}"
              alt="${product.name}"
              class="img-fluid"
            >
          </div>

          <div class="col-lg-7">
            <div class="card-body p-4 p-lg-5">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <div class="text-primary fw-bold small text-uppercase mb-2">Kickbarks PhoneHub</div>
                  <h1 class="h2 fw-bold mb-1">${product.name}</h1>
                  <p class="text-muted mb-0">${product.brand || ""} ${product.model || ""}</p>
                </div>
                ${stockBadge}
              </div>

              <h2 class="fw-bold mb-3" style="color:#0d6efd;">${formatPrice(product.price)}</h2>

              <p class="text-muted mb-4">${product.description || "No description available."}</p>

              <div class="row g-3 mb-4">
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Brand</span><strong>${product.brand || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Model</span><strong>${product.model || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">RAM</span><strong>${product.ram || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Storage</span><strong>${product.storage || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Battery</span><strong>${product.battery || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Screen Size</span><strong>${product.screenSize || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Camera</span><strong>${product.camera || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Chipset</span><strong>${product.chipset || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Color</span><strong>${product.color || "-"}</strong></div></div>
                <div class="col-sm-6"><div class="spec-box"><span class="spec-label">Stock</span><strong>${product.stock ?? 0}</strong></div></div>
              </div>

              <div class="row g-3 align-items-end">
                <div class="col-sm-4">
                  <label for="quantity" class="form-label fw-semibold">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    class="form-control"
                    min="1"
                    max="${product.stock || 1}"
                    value="1"
                    ${product.stock <= 0 ? "disabled" : ""}
                  >
                </div>

                <div class="col-sm-8 d-grid gap-2 d-sm-flex">
                  <button
                    class="btn btn-primary btn-lg rounded-pill px-4"
                    onclick="addSingleProductToCart('${product._id}', ${product.stock || 0})"
                    ${product.stock <= 0 ? "disabled" : ""}
                  >
                    Add to Cart
                  </button>

                  <a href="shop.html" class="btn btn-outline-dark btn-lg rounded-pill px-4">
                    Back to Shop
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Load product details error:", error);
    container.innerHTML = `
      <div class="alert alert-danger rounded-4">
        Failed to load product details.
      </div>
    `;
  }
}

async function addSingleProductToCart(productId, stock) {
  const token = getToken();

  if (!token) {
    showToast("Please login first.", "danger");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 700);
    return;
  }

  if (stock <= 0) {
    showToast("This product is out of stock.", "danger");
    return;
  }

  const quantityInput = document.getElementById("quantity");
  const quantity = Number(quantityInput?.value || 1);

  if (quantity < 1) {
    showToast("Quantity must be at least 1.", "danger");
    return;
  }

  if (quantity > stock) {
    showToast("Requested quantity exceeds available stock.", "danger");
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
        quantity
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to add to cart.", "danger");
      return;
    }

    showToast("Added to cart!", "success");
    if (typeof updateCartCount === "function") {
      updateCartCount();
    }
  } catch (error) {
    console.error("Add single product to cart error:", error);
    showToast("Something went wrong.", "danger");
  }
}