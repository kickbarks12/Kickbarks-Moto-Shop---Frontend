document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  if (form) {
    form.addEventListener("submit", handleRegister);
  }
});

function showRegisterAlert(message, type = "danger") {
  const alertBox = document.getElementById("register-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confirmPassword = document.getElementById("confirm-password")?.value;
  const registerBtn = document.getElementById("register-btn");

  if (!name || !email || !password || !confirmPassword) {
    showRegisterAlert("All fields are required.");
    return;
  }

  if (password.length < 6) {
    showRegisterAlert("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    showRegisterAlert("Passwords do not match.");
    return;
  }

  if (registerBtn) {
    registerBtn.disabled = true;
    registerBtn.textContent = "Creating account...";
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showRegisterAlert(data.message || "Registration failed.");
      if (registerBtn) {
        registerBtn.disabled = false;
        registerBtn.textContent = "Register";
      }
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showRegisterAlert("Registration successful!", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  } catch (error) {
    console.error("Register error:", error);
    showRegisterAlert("Something went wrong. Please try again.");
    if (registerBtn) {
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  }
}