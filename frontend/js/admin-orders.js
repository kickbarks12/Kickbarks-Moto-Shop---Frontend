const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", loadOrders);

// 📦 LOAD ORDERS
async function loadOrders() {
  const container = document.getElementById("admin-orders");

  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orders = await res.json();

    container.innerHTML = "";

    orders.forEach(order => {
      let total = 0;

      const itemsHTML = order.items.map(item => {
        const subtotal = item.product.price * item.quantity;
        total += subtotal;

        return `
          <div class="d-flex justify-content-between small">
            <span>${item.product.name} x${item.quantity}</span>
            <span>₱${subtotal}</span>
          </div>
        `;
      }).join("");

      container.innerHTML += `
        <div class="card p-3 shadow-sm admin-order-card">

          <!-- HEADER -->
          <div class="d-flex justify-content-between mb-2">
            <strong>${order._id}</strong>

            <span class="badge ${getStatusBadge(order.status)}">
              ${order.status || "Pending"}
            </span>
          </div>

          <!-- CUSTOMER -->
          <div class="mb-2">
            <strong>👤 ${order.fullname || "N/A"}</strong><br>
            <small>📞 ${order.phone || "-"}</small><br>
            <small>📍 ${order.address || "-"}</small>
          </div>

          <!-- ITEMS -->
          <div class="mb-2">
            ${itemsHTML}
          </div>

          <hr>

          <!-- FOOTER -->
          <div class="d-flex justify-content-between">
            <small>${new Date(order.createdAt).toLocaleString()}</small>
            <strong class="text-warning">₱${total}</strong>
          </div>

          <!-- STATUS -->
          <select onchange="updateStatus('${order._id}', this.value)" class="form-select mt-3">
            ${renderOptions(order.status)}
          </select>

        </div>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}

// 🔄 STATUS OPTIONS
function renderOptions(current) {
  const statuses = ["Pending Payment", "Processing", "Shipped", "Delivered"];

  return statuses.map(s => `
    <option value="${s}" ${s === current ? "selected" : ""}>
      ${s}
    </option>
  `).join("");
}

// 🎨 BADGE COLOR
function getStatusBadge(status) {
  if (status === "Pending Payment") return "bg-warning text-dark";
  if (status === "Processing") return "bg-info";
  if (status === "Shipped") return "bg-primary";
  if (status === "Delivered") return "bg-success";
  return "bg-secondary";
}

// 🔁 UPDATE STATUS
async function updateStatus(id, status) {
  await fetch(`${API_URL}/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  loadOrders();
}