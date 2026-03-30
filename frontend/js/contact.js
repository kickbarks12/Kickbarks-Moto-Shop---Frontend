document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const subject = document.getElementById("subject")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    if (!name || !email || !subject || !message) {
      showInlineAlert("contact-alert", "Please fill all fields.");
      return;
    }

    showInlineAlert("contact-alert", "Message captured on frontend. Connect this to your backend contact route if needed.", "success");
    showToast("Message form submitted.", "success");
    form.reset();
  });
});