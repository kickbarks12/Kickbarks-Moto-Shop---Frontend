document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const btn = document.getElementById("login-btn");

    if (!email || !password) {
      showInlineAlert("login-alert", "Please fill in email and password.");
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Logging in...";
      }

      const res = await fetch(`${window.API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showInlineAlert("login-alert", data.message || "Login failed.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Login";
        }
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      showInlineAlert("login-alert", "Login successful.", "success");
      showToast("Welcome back!", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      showInlineAlert("login-alert", "Something went wrong.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Login";
      }
    }
  });
});