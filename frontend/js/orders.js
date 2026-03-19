const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// 🔐 PROTECT PAGE
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

// 🚀 LOAD ORDERS
document.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {
  const container = document.getElementById("orders");
  const loading = document.getElementById("loading");
  const emptyMsg = document.getElementById("no-orders");

  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch orders");

    const orders = await res.json();

    loading.style.display = "none";

    if (!orders.length) {
      emptyMsg.classList.remove("d-none");
      return;
    }

    orders.forEach(order => {
      let itemsHTML = "";

      order.items.forEach(item => {
        itemsHTML += `
          <li>
            ${item.product.name} 
            (x${item.quantity}) - ₱${item.product.price}
          </li>
        `;
      });

      const date = new Date(order.createdAt).toLocaleString();

container.innerHTML += `
  <div class="card mb-4 shadow-sm border-0">
    <div class="card-body">

      <div class="d-flex justify-content-between mb-2">
        <h6 class="text-muted">Order ID: ${order._id.slice(-6)}</h6>
        <small class="text-muted">${date}</small>
      </div>

      <ul class="list-group mb-3">
        ${order.items.map(item => `
          <li class="list-group-item d-flex justify-content-between">
            <span>${item.product.name} (x${item.quantity})</span>
            <span>₱${item.product.price * item.quantity}</span>
          </li>
        `).join("")}
      </ul>

      <div class="text-end">
        <h5>Total: ₱${order.totalPrice}</h5>
      </div>

    </div>
  </div>
`;
    });

  } catch (err) {
    console.error(err);
    loading.innerHTML = "<p class='text-danger'>Failed to load orders</p>";
  }
}