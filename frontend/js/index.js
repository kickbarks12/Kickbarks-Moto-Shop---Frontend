document.addEventListener("DOMContentLoaded", loadFeaturedProducts);

async function loadFeaturedProducts() {
  const container = document.getElementById("featured-products");
  if (!container) return;

  container.innerHTML = `<p>Loading products...</p>`;

  try {
    const res = await fetch(`${window.API_BASE}/api/products?featured=true`);
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = `<p class="text-muted">No featured products yet.</p>`;
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="col-md-4 col-lg-3">
        <div class="card product-card h-100 shadow-sm">
          <img src="${product.image || 'https://via.placeholder.com/300x220?text=No+Image'}" class="card-img-top" alt="${product.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.name}</h5>
            <p class="text-muted mb-1">${product.brand || ""} ${product.model || ""}</p>
            <p class="fw-bold text-warning mb-2">₱${Number(product.price).toLocaleString()}</p>
            <p class="small text-muted mb-3">RAM: ${product.ram || "-"} | Storage: ${product.storage || "-"}</p>
            <a href="product.html?id=${product._id}" class="btn btn-dark mt-auto">View Details</a>
          </div>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error("Featured products error:", error);
    container.innerHTML = `<p class="text-danger">Failed to load featured products.</p>`;
  }
}