document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  loadProfile();

  const form = document.getElementById("profile-form");
  if (form) {
    form.addEventListener("submit", saveProfileLocally);
  }
});

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

function showProfileAlert(message, type = "success") {
  const alertBox = document.getElementById("profile-alert");
  if (!alertBox) return;

  alertBox.innerHTML = `
    <div class="alert alert-${type} rounded-3" role="alert">
      ${message}
    </div>
  `;
}

function loadProfile() {
  const user = getStoredUser();
  if (!user) return;

  const name = user.name || "User";
  const email = user.email || "No email";
  const role = user.role || "user";
  const firstLetter = name.charAt(0).toUpperCase();

  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const profileRole = document.getElementById("profile-role");
  const profileAvatar = document.getElementById("profile-avatar");
  const accountRole = document.getElementById("account-role");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");

  if (profileName) profileName.textContent = name;
  if (profileEmail) profileEmail.textContent = email;
  if (profileRole) profileRole.textContent = role;
  if (profileAvatar) profileAvatar.textContent = firstLetter;
  if (accountRole) accountRole.textContent = role;
  if (nameInput) nameInput.value = name;
  if (emailInput) emailInput.value = email;
}

function saveProfileLocally(event) {
  event.preventDefault();

  const user = getStoredUser();
  if (!user) return;

  const nameInput = document.getElementById("name");
  const updatedName = nameInput?.value.trim();

  if (!updatedName) {
    showProfileAlert("Name cannot be empty.", "danger");
    return;
  }

  const updatedUser = {
    ...user,
    name: updatedName
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));
  loadProfile();
  showProfileAlert("Profile updated locally.", "success");
}