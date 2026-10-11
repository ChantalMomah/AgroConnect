import { apiGet, apiPost, apiPut } from "./api.js";

const ENDPOINT = "/orders";

// Fetch current user's orders 
export async function fetchMyOrders() {
  try {
    const orders = await apiGet(ENDPOINT + "/my");
    displayOrders(orders);
    return orders;
  } catch (error) {
    alert("Error fetching orders: " + error.message);
  }
}

// Render orders into the HTML container
function displayOrders(orders) {
  const container = document.getElementById("orders-container");
  if (!container) return;

  if (!orders || orders.length === 0) {
    container.innerHTML = "<p>You have no orders yet.</p>";
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Total Price</th>
          <th>Status</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  orders.forEach(function (order) {
    html += `
      <tr>
        <td>${order.id}</td>
        <td>${order.productName}</td>
        <td>${order.quantity}</td>
        <td>₦${order.totalPrice}</td>
        <td>${order.status}</td>
        <td>${order.createdAt || "N/A"}</td>
        <td>
          <select onchange="updateOrderStatus(${order.id}, this.value)">
            <option value="">Change Status</option>
            <option value="CONFIRMED">Confirm</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancel</option>
          </select>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

// ---------- Create a new order ----------
export async function createOrder(orderData) {
  try {
    const newOrder = await apiPost(ENDPOINT, orderData);
    alert("Order placed successfully!");
    fetchMyOrders();
    return newOrder;
  } catch (error) {
    alert("Error placing order: " + error.message);
  }
}

// ---------- Update order status ----------
export async function updateOrderStatus(orderId, status) {
  if (!status) return;

  try {
    await apiPut(ENDPOINT + "/" + orderId + "/status", { status: status });
    alert("Order status updated!");
    fetchMyOrders();
  } catch (error) {
    alert("Error updating order: " + error.message);
  }
}

// ---------- Handle order form submission ----------
export async function handleOrderFormSubmit(event) {
  event.preventDefault();

  const orderData = {
    productId: parseInt(document.getElementById("order-product-id").value),
    quantity: parseInt(document.getElementById("order-quantity").value),
  };

  await createOrder(orderData);
  event.target.reset();
}

// ---------- Load orders when page loads ----------
document.addEventListener("DOMContentLoaded", function () {
  fetchMyOrders();

  const form = document.getElementById("order-form");
  if (form) {
    form.addEventListener("submit", handleOrderFormSubmit);
  }
});
