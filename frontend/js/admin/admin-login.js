document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("admin-login-form");
  if (form) {
    form.addEventListener("submit", handleAdminLogin);
  }
});

function showAdminLoginAlert(message, type = "danger") {
  const alertBox = document.getElementById("admin-login-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const email = document.getElementById("admin-email")?.value.trim();
  const password = document.getElementById("admin-password")?.value;
  const loginBtn = document.getElementById("admin-login-btn");

  if (!email || !password) {
    showAdminLoginAlert("Email and password are required.");
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    const res = await fetch(`${window.API_BASE}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showAdminLoginAlert(data.message || "Admin login failed.");
      return;
    }

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.admin));

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    showAdminLoginAlert("Admin login successful!", "success");

    setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 500);
  } catch (error) {
    console.error("Admin login error:", error);
    showAdminLoginAlert("Something went wrong. Please try again.");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Admin Login";
  }
}