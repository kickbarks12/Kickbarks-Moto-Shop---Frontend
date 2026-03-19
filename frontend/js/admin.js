const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

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

  alert("Product added ✅");
  loadProducts();
}

async function loadProducts() {
  const res = await fetch(`${API_URL}/products`);
  const products = await res.json();

  const list = document.getElementById("admin-products");
  list.innerHTML = "";

  products.forEach(p => {
    list.innerHTML += `
      <li>
        ${p.name} - ₱${p.price}
        <button onclick="deleteProduct('${p._id}')">Delete</button>
      </li>
    `;
  });
}

async function deleteProduct(id) {
  await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  loadProducts();
}

loadProducts();