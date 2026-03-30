document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-password-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const btn = document.getElementById("forgot-btn");

    if (!email) {
      showInlineAlert("forgot-alert", "Please enter your email.");
      return;
    }

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending...";
      }

      const res = await fetch(`${window.API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        showInlineAlert("forgot-alert", data.message || "Failed to send reset link.");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Send Reset Link";
        }
        return;
      }

      showInlineAlert("forgot-alert", data.message || "Reset link sent successfully.", "success");
      showToast("Reset link request sent.", "success");

      if (btn) {
        btn.disabled = false;
        btn.textContent = "Send Reset Link";
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      showInlineAlert("forgot-alert", "Something went wrong.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Send Reset Link";
      }
    }
  });
});