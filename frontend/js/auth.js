const API_URL = "http://localhost:5000/api";

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("token", data.token);
    alert("Login successful");
    window.location.href = "index.html";
  });
}