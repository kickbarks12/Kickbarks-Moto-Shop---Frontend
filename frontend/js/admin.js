const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", loadProducts);

// 📦 LOAD PRODUCTS
async function loadProducts() {
  const container = document.getElementById("admin-products");

  const res = await fetch(`${API_URL}/products`);
  const products = await res.json();

  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="col-md-4">
        <div class="card p-3 shadow-sm">

          <img src="${p.image || 'https://via.placeholder.com/300'}"
               style="height:150px; object-fit:cover; border-radius:8px;">

          <h6 class="mt-2">${p.name}</h6>
          <p>₱${p.price}</p>

          <button onclick="deleteProduct('${p._id}')" class="btn btn-danger btn-sm">
            Delete
          </button>

        </div>
      </div>
    `;
  });
}

// ➕ ADD PRODUCT
async function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const image = document.getElementById("image").value;

  await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, price, image })
  });

  loadProducts();
}

// ❌ DELETE
async function deleteProduct(id) {
  await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadProducts();
}