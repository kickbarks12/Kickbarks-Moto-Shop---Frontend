document.addEventListener("DOMContentLoaded", () => {
  guardAdminPage();
  setupAdminLogout();
  loadAdminOrders();
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

function showAdminOrdersAlert(message, type = "danger") {
  const alertBox = document.getElementById("admin-orders-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

function formatOrderDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

async function loadAdminOrders() {
  const tbody = document.getElementById("admin-orders-table-body");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center text-muted">Loading orders...</td>
    </tr>
  `;

  try {
    const res = await fetch(`${window.API_BASE}/api/orders/admin/all`, {
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      }
    });

    const orders = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            ${orders.message || "Failed to load orders."}
          </td>
        </tr>
      `;
      return;
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">No orders found.</td>
        </tr>
      `;
      return;
    }

    const sortedOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    tbody.innerHTML = sortedOrders.map(order => {
      const itemCount = Array.isArray(order.items)
        ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        : 0;

      return `
        <tr>
          <td><strong>#${String(order._id).slice(-6).toUpperCase()}</strong></td>
          <td>${formatOrderDate(order.createdAt)}</td>
          <td>${itemCount}</td>
          <td>₱${Number(order.totalPrice || 0).toLocaleString()}</td>
          <td>
            <span class="badge ${getStatusBadgeClass(order.status)} admin-status-badge">
              ${order.status || "Pending"}
            </span>
          </td>
          <td>
            <select
              class="form-select form-select-sm"
              onchange="updateOrderStatus('${order._id}', this.value)"
            >
              <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Processing" ${order.status === "Processing" ? "selected" : ""}>Processing</option>
              <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
              <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
              <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
  } catch (error) {
    console.error("Load admin orders error:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger">Something went wrong.</td>
      </tr>
    `;
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "Pending":
      return "bg-warning text-dark";
    case "Processing":
      return "bg-info text-dark";
    case "Shipped":
      return "bg-primary";
    case "Delivered":
      return "bg-success";
    case "Cancelled":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${window.API_BASE}/api/orders/admin/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!res.ok) {
      showAdminOrdersAlert(data.message || "Failed to update order status.");
      return;
    }

    showAdminOrdersAlert("Order status updated successfully.", "success");
    await loadAdminOrders();
  } catch (error) {
    console.error("Update order status error:", error);
    showAdminOrdersAlert("Something went wrong while updating status.");
  }
}