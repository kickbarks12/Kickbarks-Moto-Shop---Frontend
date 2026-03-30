document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  loadProfile();

  const form = document.getElementById("profile-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveProfile();
    });
  }
});

function getToken() {
  return localStorage.getItem("token");
}

function getInitial(name) {
  return (name || "U").charAt(0).toUpperCase();
}

async function loadProfile() {
  try {
    const res = await fetch(`${window.API_BASE}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      credentials: "include"
    });

    const user = await res.json();

    if (!res.ok) {
      showInlineAlert("profile-alert", user.message || "Failed to load profile.");
      return;
    }

    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";

    document.getElementById("profile-name").textContent = user.name || "User";
    document.getElementById("profile-email").textContent = user.email || "No email";
    document.getElementById("profile-role").textContent = user.role || "user";
    document.getElementById("account-role").textContent = user.role || "user";

    const avatar = document.getElementById("profile-avatar");
    if (avatar) {
      if (user.avatar) {
        avatar.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="profile-avatar-image">`;
      } else {
        avatar.textContent = getInitial(user.name);
      }
    }

    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Profile load error:", error);
    showInlineAlert("profile-alert", "Something went wrong while loading profile.");
  }
}

async function saveProfile() {
  const name = document.getElementById("name")?.value.trim();

  if (!name) {
    showInlineAlert("profile-alert", "Name is required.");
    return;
  }

  try {
    const res = await fetch(`${window.API_BASE}/api/users/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name }),
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      showInlineAlert("profile-alert", data.message || "Failed to update profile.");
      return;
    }

    showInlineAlert("profile-alert", "Profile updated successfully.", "success");
    showToast("Profile updated.", "success");
    await loadProfile();
  } catch (error) {
    console.error("Profile save error:", error);
    showInlineAlert("profile-alert", "Something went wrong while saving profile.");
  }
}