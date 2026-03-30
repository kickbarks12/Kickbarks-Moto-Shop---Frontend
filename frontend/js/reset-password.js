document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reset-password-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password")?.value.trim();
    const confirmPassword = document.getElementById("confirm-password")?.value.trim();
    const btn = document.getElementById("reset-btn");

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      showInlineAlert("reset-alert", "Reset token is missing from the URL.");
      return;
    }

    if (!password || !confirmPassword) {
      showInlineAlert("reset-alert", "Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      showInlineAlert("reset-alert", "Passwords do not match.");
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Resetting...";
      }

      const res = await fetch(`${window.API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        showInlineAlert("reset-alert", data.message || "Failed to reset password.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Reset Password";
        }
        return;
      }

      showInlineAlert("reset-alert", data.message || "Password reset successful.", "success");
      showToast("Password reset successful.", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      console.error("Reset password error:", error);
      showInlineAlert("reset-alert", "Something went wrong.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Reset Password";
      }
    }
  });
});