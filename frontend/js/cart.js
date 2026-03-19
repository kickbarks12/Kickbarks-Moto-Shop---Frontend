const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", loadCart);

async function loadCart() {
  const cartEl = document.getElementById("cart");
  const totalEl = document.getElementById("total");

  try {
    cartEl.innerHTML = "Loading...";

    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();

    cartEl.innerHTML = "";
    let total = 0;

    if (!data.items.length) {
      cartEl.innerHTML = "<p class='text-center'>Your cart is empty 🛒</p>";
      totalEl.innerText = 0;
      return;
    }

    data.items.forEach(item => {
      total += item.product.price * item.quantity;

      cartEl.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <strong>${item.product.name}</strong><br>
            ₱${item.product.price}
          </div>

          <div>
            <button 
              onclick="updateQty('${item.product._id}', -1)" 
              class="btn btn-sm btn-danger"
              ${item.quantity <= 1 ? "disabled" : ""}
            >-</button>

            <span class="mx-2">${item.quantity}</span>

            <button onclick="updateQty('${item.product._id}', 1)" class="btn btn-sm btn-success">+</button>

            <button onclick="removeItem('${item.product._id}')" class="btn btn-sm btn-dark ms-2">X</button>
          </div>
        </li>
      `;
    });

    totalEl.innerText = total;

  } catch (err) {
    console.error(err);
    cartEl.innerHTML = "<p class='text-danger'>Failed to load cart ❌</p>";
  }
}

// ➕➖ UPDATE QTY
async function updateQty(productId, change) {
  await fetch(`${API_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity: change })
  });

  loadCart();
}

// ❌ REMOVE ITEM
async function removeItem(productId) {
  await fetch(`${API_URL}/cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadCart();
}

// 💳 CHECKOUT
async function checkout() {
  await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });

  alert("Order placed ✅");
  loadCart();
}
