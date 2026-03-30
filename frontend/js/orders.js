document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  loadOrders();
});

function getToken() {
  return localStorage.getItem("token");
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return date.toLocaleString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getStatusBadge(status) {
  const statusMap = {
    Pending: "warning",
    Processing: "info",
    Shipped: "primary",
    Delivered: "success",
    Cancelled: "danger"
  };

  const badgeType = statusMap[status] || "secondary";
  return `<span class="badge bg-${badgeType}">${status || "Pending"}</span>`;
}

async function loadOrders() {
  const container = document.getElementById("orders-container");
  if (!container) return;

  container.innerHTML = `<p>Loading orders...</p>`;

  try {
    const res = await fetch(`${window.API_BASE}/api/orders`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const orders = await res.json();

    if (!res.ok) {
      container.innerHTML = `
        <div class="alert alert-danger">
          ${orders.message || "Failed to load orders."}
        </div>
      `;
      return;
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      container.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4 text-center">
            <h4 class="fw-bold mb-2">No orders yet</h4>
            <p class="text-muted mb-3">You haven’t placed any phone order yet.</p>
            <a href="shop.html" class="btn btn-warning">Start Shopping</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const itemsHtml = Array.isArray(order.items)
        ? order.items.map(item => {
            const product = item.product || {};
            const quantity = Number(item.quantity || 0);
            const price = Number(product.price || 0);
            const subtotal = quantity * price;

            return `
              <div class="border rounded-4 p-3 mb-3 bg-light-subtle">
                <div class="row g-3 align-items-center">
                  <div class="col-md-2">
                    <img
                      src="${product.image || 'https://via.placeholder.com/200x160?text=No+Image'}"
                      alt="${product.name || 'Product'}"
                      class="img-fluid rounded-3 w-100"
                      style="height: 120px; object-fit: cover;"
                    >
                  </div>

                  <div class="col-md-5">
                    <h6 class="fw-bold mb-1">${product.name || "Unnamed Product"}</h6>
                    <p class="text-muted mb-1">${product.brand || ""} ${product.model || ""}</p>
                    <p class="small text-muted mb-0">
                      RAM: ${product.ram || "-"} | Storage: ${product.storage || "-"}
                    </p>
                  </div>

                  <div class="col-md-2">
                    <span class="text-muted d-block">Price</span>
                    <strong>₱${price.toLocaleString()}</strong>
                  </div>

                  <div class="col-md-1">
                    <span class="text-muted d-block">Qty</span>
                    <strong>${quantity}</strong>
                  </div>

                  <div class="col-md-2">
                    <span class="text-muted d-block">Subtotal</span>
                    <strong>₱${subtotal.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            `;
          }).join("")
        : "";

      return `
        <div class="card border-0 shadow-sm rounded-4 mb-4">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <h5 class="fw-bold mb-1">Order #${String(order._id).slice(-6).toUpperCase()}</h5>
                <p class="text-muted mb-0">Placed on ${formatDate(order.createdAt)}</p>
              </div>
              ${getStatusBadge(order.status)}
            </div>

            ${itemsHtml}

            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
              <span class="fw-semibold">Total Amount</span>
              <h5 class="fw-bold text-warning mb-0">₱${Number(order.totalPrice || 0).toLocaleString()}</h5>
            </div>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error("Load orders error:", error);
    container.innerHTML = `
      <div class="alert alert-danger">
        Something went wrong while loading your orders.
      </div>
    `;
  }
}