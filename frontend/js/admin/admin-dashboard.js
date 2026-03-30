document.addEventListener("DOMContentLoaded", () => {
  guardAdminPage();
  setupAdminLogout();
  loadDashboard();
});

function getAdminToken() {
  return localStorage.getItem("adminToken") || localStorage.getItem("token");
}

function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("adminUser")) ||
      JSON.parse(localStorage.getItem("user")) ||
      null;
  } catch {
    return null;
  }
}

function guardAdminPage() {
  const token = getAdminToken();
  const user = getAdminUser();

  if (!token || !user || user.role !== "admin") {
    alert("Admin access only.");
    window.location.href = "../login.html";
    return;
  }
}

function setupAdminLogout() {
  const btn = document.getElementById("admin-logout-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "../login.html";
  });
}

function showDashboardAlert(message, type = "danger") {
  const alertBox = document.getElementById("dashboard-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

async function loadDashboard() {
  try {
    const [productsRes, ordersRes] = await Promise.all([
  fetch(`${window.API_BASE}/api/products`),
  fetch(`${window.API_BASE}/api/orders/admin/all`, {
    headers: {
      Authorization: `Bearer ${getAdminToken()}`
    }
  })
]);

    const products = await productsRes.json();
    const orders = await ordersRes.json();

    const productsList = Array.isArray(products) ? products : [];
    const ordersList = Array.isArray(orders) ? orders : [];

    document.getElementById("total-products").textContent = productsList.length;
    document.getElementById("total-orders").textContent = ordersList.length;

    const pendingCount = ordersList.filter(order => order.status === "Pending").length;
    document.getElementById("pending-orders").textContent = pendingCount;

    renderRecentOrders(ordersList);
  } catch (error) {
    console.error("Dashboard load error:", error);
    showDashboardAlert("Failed to load dashboard data.");
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById("recent-orders");
  if (!container) return;

  if (!Array.isArray(orders) || orders.length === 0) {
    container.innerHTML = `<p class="text-muted mb-0">No recent orders found.</p>`;
    return;
  }

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  container.innerHTML = recent.map(order => {
    const customerName = order.user?.name || "Unknown Customer";
    const total = Number(order.totalPrice || 0).toLocaleString();

    return `
      <div class="border rounded-4 p-3 mb-2">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div>
            <strong>Order #${String(order._id).slice(-6).toUpperCase()}</strong>
            <div class="small text-muted">${customerName}</div>
            <div class="small text-muted">
              ${new Date(order.createdAt).toLocaleString("en-PH")}
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-warning text-dark">${order.status || "Pending"}</span>
            <div class="small fw-semibold mt-1">₱${total}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}