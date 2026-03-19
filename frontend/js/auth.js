const API_URL = "http://localhost:5000/api";

// 🔐 LOGIN
async function login() {
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const btn = event.target;

  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();

  // ✅ Validation
  if (!email || !password) {
    showToast("Please fill all fields", "danger");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Invalid email format", "danger");
    return;
  }

  try {
    btn.disabled = true;
    btn.innerText = "Logging in...";

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!data.token) {
      showToast("Invalid email or password ❌", "danger");
      btn.disabled = false;
      btn.innerText = "Login";
      return;
    }

    localStorage.setItem("token", data.token);

    showToast("Login successful ✅", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    showToast("Login failed ❌", "danger");
  }
}

// 📝 REGISTER
async function register() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const btn = event.target;

  // ✅ Validation
  if (!name || !email || !password) {
    showToast("Please fill all fields", "danger");
    return;
  }

  if (!validateEmail(email)) {
    showToast("Invalid email format", "danger");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "danger");
    return;
  }

  try {
    btn.disabled = true;
    btn.innerText = "Creating...";

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.message) {
      showToast(data.message, "danger");
      btn.disabled = false;
      btn.innerText = "Create Account";
      return;
    }

    showToast("Registration successful ✅", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    showToast("Registration failed ❌", "danger");
  }
}

// 📧 EMAIL VALIDATION
function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// 🔥 TOAST (same system across app)
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
  toast.style.zIndex = "9999";

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
}