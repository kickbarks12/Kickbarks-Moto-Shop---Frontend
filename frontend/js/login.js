document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", handleLogin);
  }
});

function showLoginAlert(message, type = "danger") {
  const alertBox = document.getElementById("login-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  const loginBtn = document.getElementById("login-btn");

  if (!email || !password) {
    showLoginAlert("Email and password are required.");
    return;
  }

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showLoginAlert(data.message || "Login failed.");
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
      }
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user?.role === "admin") {
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
      window.location.href = "admin/dashboard.html";
      return;
    }

    showLoginAlert("Login successful!", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  } catch (error) {
    console.error("Login error:", error);
    showLoginAlert("Something went wrong. Please try again.");
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  }
}