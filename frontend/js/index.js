document.addEventListener("DOMContentLoaded", loadFeaturedProducts);

function getProductImage(product) {
  if (product?.image) return product.image;

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === "string") {
      return firstImage.startsWith("http") ? firstImage : `${window.API_BASE}${firstImage}`;
    }
  }

  return "https://via.placeholder.com/500x400?text=No+Image";
}

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

async function fetchProductsWithFallback() {
  let res = await fetch(`${window.API_BASE}/api/products?featured=true`);
  let products = await res.json();

  if (Array.isArray(products) && products.length > 0) {
    return products;
  }

  res = await fetch(`${window.API_BASE}/api/products`);
  products = await res.json();

  return Array.isArray(products) ? products : [];
}

async function loadFeaturedProducts() {
  const container = document.getElementById("featured-products");
  if (!container) return;

  container.innerHTML = `
    <div class="col-12">
      <div class="loading-state">Loading featured phones...</div>
    </div>
  `;

  try {
    const products = await fetchProductsWithFallback();

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="empty-state">No featured products yet.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = products.slice(0, 8).map(product => `
      <div class="col-md-6 col-lg-4 col-xl-3">
        <div class="card product-card h-100">
          <img src="${getProductImage(product)}" class="card-img-top" alt="${product.name}">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <h5 class="card-title mb-0">
                <a href="product.html?id=${product._id}" class="product-title-link">
                  ${product.name}
                </a>
              </h5>
              <span class="badge ${product.stock > 0 ? "bg-success" : "bg-danger"} badge-stock">
                ${product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <p class="product-meta mb-1">${product.brand || "-"} ${product.model || ""}</p>
            <div class="price-main mb-2">${formatPrice(product.price)}</div>
            <p class="small text-muted mb-3">
              RAM: ${product.ram || "-"} • Storage: ${product.storage || "-"}
            </p>

            <a href="product.html?id=${product._id}" class="btn btn-dark mt-auto rounded-pill">
              View Details
            </a>
          </div>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error("Featured products error:", error);
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state text-danger">Failed to load featured products.</div>
      </div>
    `;
  }
}