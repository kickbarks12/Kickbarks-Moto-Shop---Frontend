document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
  showToast("Please login first.", "danger");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 700);
  return;
}

  loadOrders();
});

function getToken() {
  return localStorage.getItem("token");
}

function getProductImage(product) {
  if (product?.image) return product.image;

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === "string") {
      return firstImage.startsWith("http") ? firstImage : `${window.API_BASE}${firstImage}`;
    }
  }

  return "https://via.placeholder.com/200x160?text=No+Image";
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

function formatPrice(value) {
  return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

function getStatusBadge(status) {
  const statusMap = {
    Pending: "warning",
    Processing: "info",
    Shipped: "primary",
    Delivered: "success",
    Cancelled: "danger",
    "Pending Payment": "warning"
  };

  const badgeType = statusMap[status] || "secondary";
  return `<span class="badge bg-${badgeType} rounded-pill px-3 py-2">${status || "Pending"}</span>`;
}

async function loadOrders() {
  const container = document.getElementById("orders-container");
  if (!container) return;

  container.innerHTML = `<div class="loading-state">Loading orders...</div>`;

  try {
    const res = await fetch(`${window.API_BASE}/api/orders`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const orders = await res.json();

    if (!res.ok) {
      container.innerHTML = `
        <div class="alert alert-danger rounded-4">
          ${orders.message || "Failed to load orders."}
        </div>
      `;
      return;
    }

    if (!Array.isArray(orders) || orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h4 class="fw-bold mb-2">No orders yet</h4>
          <p class="mb-3">You haven’t placed any phone order yet.</p>
          <a href="shop.html" class="btn btn-primary rounded-pill px-4">Start Shopping</a>
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
              <div class="order-item mb-3">
                <div class="row g-3 align-items-center">
                  <div class="col-md-2">
                    <img
                      src="${getProductImage(product)}"
                      alt="${product.name || 'Product'}"
                      class="order-item-image"
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
                    <strong>${formatPrice(price)}</strong>
                  </div>

                  <div class="col-md-1">
                    <span class="text-muted d-block">Qty</span>
                    <strong>${quantity}</strong>
                  </div>

                  <div class="col-md-2">
                    <span class="text-muted d-block">Subtotal</span>
                    <strong>${formatPrice(subtotal)}</strong>
                  </div>
                </div>
              </div>
            `;
          }).join("")
        : "";

      return `
        <div class="order-card mb-4">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h5 class="fw-bold mb-1">Order #${String(order._id).slice(-6).toUpperCase()}</h5>
              <p class="text-muted mb-0">Placed on ${formatDate(order.createdAt)}</p>
            </div>
            ${getStatusBadge(order.status)}
          </div>

          ${itemsHtml}

          <div class="d-flex justify-content-between align-items-center pt-3 border-top">
            <span class="fw-semibold">Total Amount</span>
            <h5 class="price-main mb-0">${formatPrice(order.totalPrice || 0)}</h5>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    console.error("Load orders error:", error);
    container.innerHTML = `
      <div class="alert alert-danger rounded-4">
        Something went wrong while loading your orders.
      </div>
    `;
  }
}