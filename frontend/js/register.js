document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const confirmPassword = document.getElementById("confirm-password")?.value.trim();
    const btn = document.getElementById("register-btn");

    if (!name || !email || !password || !confirmPassword) {
      showInlineAlert("register-alert", "Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      showInlineAlert("register-alert", "Passwords do not match.");
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Registering...";
      }

      const res = await fetch(`${window.API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showInlineAlert("register-alert", data.message || "Registration failed.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Register";
        }
        return;
      }

      showInlineAlert("register-alert", "Registration successful. Redirecting to login...", "success");
      showToast("Account created successfully.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      console.error("Register error:", error);
      showInlineAlert("register-alert", "Something went wrong.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Register";
      }
    }
  });
});