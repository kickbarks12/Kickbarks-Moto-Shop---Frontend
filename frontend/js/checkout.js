const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", loadCheckout);

// 🧾 LOAD CHECKOUT
async function loadCheckout() {
  const container = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");

  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    container.innerHTML = "";

    // 🔥 FIX HERE
    if (!data.items || data.items.length === 0) {
      container.innerHTML = "<p class='text-muted'>Cart is empty 🛒</p>";
      totalEl.innerText = 0;
      return;
    }

    let total = 0;

    data.items.forEach(item => {
      const subtotal = item.product.price * item.quantity;
      total += subtotal;

      container.innerHTML += `
        <div class="d-flex justify-content-between mb-2">
          <span>${item.product.name} x${item.quantity}</span>
          <strong>₱${subtotal}</strong>
        </div>
      `;
    });

    totalEl.innerText = total;

  } catch (err) {
    console.error(err);
  }
}

// 💳 PLACE ORDER
async function placeOrder() {
  const fullname = document.getElementById("fullname").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if (!fullname || !phone || !address) {
    showToast("Please fill all fields", "danger");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" // 🔥 IMPORTANT
      },
      body: JSON.stringify({
        fullname,
        phone,
        address,
        status: "Pending Payment"
      })
    });

    const data = await res.json();

    // 🔥 DEBUG LOG
    console.log("ORDER RESPONSE:", data);

    if (!res.ok) {
      showToast(data.message || "Order failed", "danger");
      return;
    }

    showToast("Order placed ✅", "success");

    setTimeout(() => {
      window.location.href = "orders.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    showToast("Checkout failed", "danger");
  }
}