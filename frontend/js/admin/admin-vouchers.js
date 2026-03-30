document.addEventListener("DOMContentLoaded", () => {
  guardAdminPage();
  setupAdminLogout();
  loadVouchers();

  const form = document.getElementById("voucher-form");
  if (form) {
    form.addEventListener("submit", createVoucher);
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

function showAdminVouchersAlert(message, type = "danger") {
  const alertBox = document.getElementById("admin-vouchers-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

async function loadVouchers() {
  const tbody = document.getElementById("voucher-table-body");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center text-muted">Loading vouchers...</td>
    </tr>
  `;

  try {
    const res = await fetch(`${window.API_BASE}/api/admin/vouchers`, {
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-danger">
            ${data.message || "Failed to load vouchers."}
          </td>
        </tr>
      `;
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted">No vouchers found.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.map(voucher => `
      <tr>
        <td><span class="fw-bold">${voucher.code || "-"}</span></td>
        <td>
          ${voucher.discountType === "percent"
            ? '<span class="badge bg-primary admin-status-badge">Percent</span>'
            : '<span class="badge bg-secondary admin-status-badge">Fixed</span>'}
        </td>
        <td>
          ${voucher.discountType === "percent"
            ? `${voucher.discountValue || 0}%`
            : `₱${Number(voucher.discountValue || 0).toLocaleString()}`}
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Load vouchers error:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">Something went wrong.</td>
      </tr>
    `;
    showAdminVouchersAlert("Something went wrong while loading vouchers.");
  }
}

async function createVoucher(event) {
  event.preventDefault();

  const btn = document.getElementById("create-voucher-btn");
  const code = document.getElementById("code")?.value.trim();
  const discountType = document.getElementById("discountType")?.value;
  const discountValue = document.getElementById("discountValue")?.value;

  if (!code || !discountType || !discountValue) {
    showAdminVouchersAlert("Please fill in all voucher fields.");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Creating...";
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/admin/vouchers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify({
        code,
        discountType,
        discountValue: Number(discountValue)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showAdminVouchersAlert(data.message || "Failed to create voucher.");
      return;
    }

    showAdminVouchersAlert("Voucher created successfully!", "success");
    document.getElementById("voucher-form")?.reset();
    await loadVouchers();
  } catch (error) {
    console.error("Create voucher error:", error);
    showAdminVouchersAlert("Something went wrong while creating voucher.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Create Voucher";
    }
  }
}