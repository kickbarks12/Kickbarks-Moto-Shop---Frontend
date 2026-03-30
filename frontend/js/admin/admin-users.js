document.addEventListener("DOMContentLoaded", () => {
  guardAdminPage();
  setupAdminLogout();
  loadUsers();
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

function showAdminUsersAlert(message, type = "danger") {
  const alertBox = document.getElementById("admin-users-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

async function loadUsers() {
  const tbody = document.getElementById("users-table-body");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center text-muted">Loading users...</td>
    </tr>
  `;

  try {
    const res = await fetch(`${window.API_BASE}/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      }
    });

    const users = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-danger">
            ${users.message || "Failed to load users."}
          </td>
        </tr>
      `;
      return;
    }

    if (!Array.isArray(users) || users.length === 0) {
      document.getElementById("total-users").textContent = "0";
      document.getElementById("active-users").textContent = "0";
      document.getElementById("blocked-users").textContent = "0";

      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted">No users found.</td>
        </tr>
      `;
      return;
    }

    const totalUsers = users.length;
    const blockedUsers = users.filter(user => user.isBlocked).length;
    const activeUsers = totalUsers - blockedUsers;

    document.getElementById("total-users").textContent = totalUsers;
    document.getElementById("active-users").textContent = activeUsers;
    document.getElementById("blocked-users").textContent = blockedUsers;

    tbody.innerHTML = users.map(user => `
      <tr>
        <td><div class="fw-semibold">${user.name || "-"}</div></td>
        <td>${user.email || "-"}</td>
        <td>
          ${user.isBlocked
            ? '<span class="badge bg-danger admin-status-badge">Blocked</span>'
            : '<span class="badge bg-success admin-status-badge">Active</span>'}
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Load users error:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger">Something went wrong.</td>
      </tr>
    `;
    showAdminUsersAlert("Something went wrong while loading users.");
  }
}