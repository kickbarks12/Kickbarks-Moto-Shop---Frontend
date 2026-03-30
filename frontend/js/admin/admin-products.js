document.addEventListener("DOMContentLoaded", () => {
  guardAdminPage();
  setupAdminLogout();
  loadProducts();

  const form = document.getElementById("product-form");
  if (form) {
    form.addEventListener("submit", createProduct);
  }
});

function getAdminToken() {
  return localStorage.getItem("adminToken");
}

function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("adminUser")) || null;
  } catch {
    return null;
  }
}

function guardAdminPage() {
  const token = getAdminToken();
  const user = getAdminUser();

  if (!token || !user || user.role !== "admin") {
    alert("Admin access only.");
    window.location.href = "./admin-login.html";
  }
}

function setupAdminLogout() {
  const btn = document.getElementById("admin-logout-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "./admin-login.html";
  });
}

function showAdminProductsAlert(message, type = "danger") {
  const alertBox = document.getElementById("admin-products-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

async function loadProducts() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center text-muted">Loading products...</td>
    </tr>
  `;

  try {
    const res = await fetch(`${window.API_BASE}/api/products`);
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted">No products found.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(product => `
      <tr>
        <td>
          <img
            src="${product.image || 'https://via.placeholder.com/80x80?text=No+Image'}"
            alt="${product.name || 'Product Image'}"
            class="admin-thumb"
          >
        </td>
        <td>${product.name || "-"}</td>
        <td>${product.brand || "-"}</td>
        <td>₱${Number(product.price || 0).toLocaleString()}</td>
        <td>${product.stock ?? 0}</td>
        <td>
          ${product.featured
            ? '<span class="badge bg-success admin-status-badge">Yes</span>'
            : '<span class="badge bg-secondary admin-status-badge">No</span>'}
        </td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product._id}')">
            Delete
          </button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Load admin products error:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">Failed to load products.</td>
      </tr>
    `;
  }
}

async function createProduct(event) {
  event.preventDefault();

  const btn = document.getElementById("save-product-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Saving...";
  }

  try {
    const formData = new FormData();
    formData.append("name", document.getElementById("name")?.value.trim() || "");
    formData.append("brand", document.getElementById("brand")?.value.trim() || "");
    formData.append("model", document.getElementById("model")?.value.trim() || "");
    formData.append("category", document.getElementById("category")?.value.trim() || "Smartphone");
    formData.append("price", document.getElementById("price")?.value || "0");
    formData.append("stock", document.getElementById("stock")?.value || "0");
    formData.append("color", document.getElementById("color")?.value.trim() || "");
    formData.append("ram", document.getElementById("ram")?.value.trim() || "");
    formData.append("storage", document.getElementById("storage")?.value.trim() || "");
    formData.append("battery", document.getElementById("battery")?.value.trim() || "");
    formData.append("screenSize", document.getElementById("screenSize")?.value.trim() || "");
    formData.append("camera", document.getElementById("camera")?.value.trim() || "");
    formData.append("chipset", document.getElementById("chipset")?.value.trim() || "");
    formData.append("description", document.getElementById("description")?.value.trim() || "");
    formData.append("featured", document.getElementById("featured")?.checked);

    const imageFile = document.getElementById("image")?.files?.[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await fetch(`${window.API_BASE}/api/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      showAdminProductsAlert(data.message || "Failed to create product.");
      return;
    }

    showAdminProductsAlert("Product created successfully!", "success");
    document.getElementById("product-form")?.reset();
    await loadProducts();
  } catch (error) {
    console.error("Create product error:", error);
    showAdminProductsAlert("Something went wrong while creating the product.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Save Product";
    }
  }
}

async function deleteProduct(productId) {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  try {
    const res = await fetch(`${window.API_BASE}/api/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      showAdminProductsAlert(data.message || "Failed to delete product.");
      return;
    }

    showAdminProductsAlert("Product deleted successfully!", "success");
    await loadProducts();
  } catch (error) {
    console.error("Delete product error:", error);
    showAdminProductsAlert("Something went wrong while deleting the product.");
  }
}