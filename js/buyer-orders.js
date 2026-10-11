
import {
    apiGet,
    apiPost,
    apiDelete
} from "./api.js";

import {
    requireAuth
} from "./auth.js";


if (!requireAuth()) {
    throw new Error("User not authenticated.");
}

const user =
    JSON.parse(
        localStorage.getItem("user")
    );

if (!user || user.role !== "BUYER") {

    alert("Access denied.");

    window.location.href =
        "dashboard.html";

    throw new Error("Unauthorized");
}


// ==========================================
// Endpoints
// ==========================================

const ENDPOINT = "/orders";

const PRODUCTS_ENDPOINT = "/products";


// ==========================================
// Cart
// ==========================================

let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];

const selectedOrders = new Set();



async function refreshCartStock() {

    try {

        const products =
            await apiGet(
                PRODUCTS_ENDPOINT
            );

        let cartChanged = false;

        cart = cart.map(item => {

            const product =
                products.find(
                    product =>
                        Number(product.id) ===
                        Number(item.productId)
                );

            if (!product) {

                return item;

            }

            const currentStock =
                Number(product.stockQuantity) || 0;

            if (
                Number(item.maxStock) !==
                currentStock
            ) {

                item.maxStock =
                    currentStock;

                cartChanged = true;

            }

           

            item.name =
                product.name;

            item.pricePerUnit =
                product.pricePerUnit;

            item.unit =
                product.unit;

            item.imageUrl =
                product.imageUrl;

            item.state =
                product.state;

            item.deliveryStates =
                product.deliveryStates || [];

            cartChanged = true;

            return item;

        });

        if (cartChanged) {

            saveCartToStorage();

        }

    }

    catch (error) {

        console.error(
            "Unable to refresh cart stock:",
            error
        );

        

    }

}



function saveCartToStorage() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}




async function fetchMyOrders() {

    try {

        const orders =
            await apiGet(
                ENDPOINT +
                "/user/" +
                user.id
            );

        displayOrders(orders);

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to load your orders: " +
            error.message
        );

    }

}




async function displayCart() {

    

    await refreshCartStock();

    const container =
        document.getElementById(
            "cart-container"
        );

    const summary =
        document.getElementById(
            "cart-summary"
        );

    const count =
        document.getElementById(
            "cart-count"
        );

    if (!container) return;


    if (count) {

        count.textContent =
            cart.length;

    }


    if (cart.length === 0) {

        container.innerHTML = `
            <div class="empty-orders">

                <h3>Your cart is empty</h3>

                <p>
                    Add products from the Products page
                    and they will appear here.
                </p>

            </div>
        `;

        if (summary) {

            summary.style.display =
                "none";

        }

        return;

    }


    let total = 0;


    container.innerHTML =
        cart.map(item => {

            const quantity =
                Number(item.quantity) || 0;

            const currentStock =
                Number(item.maxStock);

            const hasStockInformation =
                Number.isFinite(currentStock);

            const isOutOfStock =
                hasStockInformation &&
                currentStock <= 0;

            const exceedsStock =
                hasStockInformation &&
                quantity > currentStock;


            const itemTotal =
                Number(item.pricePerUnit || 0) *
                quantity;

            total += itemTotal;


            let stockMessage = "";


            if (isOutOfStock) {

                stockMessage = `
                    <p class="cart-stock-warning">

                        <strong>
                            Out of Stock
                        </strong>

                        <br>

                        This product is currently
                        unavailable.

                        <br>

                        Your quantity of
                        <strong>${quantity}</strong>
                        has been kept in your cart.

                    </p>
                `;

            }

            else if (exceedsStock) {

                stockMessage = `
                    <p class="cart-stock-warning">

                        <strong>
                            Only ${currentStock}
                            ${item.unit || "units"}
                            currently available.
                        </strong>

                        <br>

                        Your cart contains
                        ${quantity}.

                        <br>

                        Please reduce your quantity
                        before placing the order.

                    </p>
                `;

            }

            else if (hasStockInformation) {

                stockMessage = `
                    <p class="cart-stock-available">

                        ${currentStock}
                        ${item.unit || "units"}
                        currently available

                    </p>
                `;

            }


            return `

                <div
                    class="order-card"
                    data-product-id="${item.productId}">

                    <img
                        src="${
                            item.imageUrl ||
                            "images/default-product.png"
                        }"
                        class="order-image"
                        alt="${item.name}">


                    <div class="order-info">

                        <h3>
                            ${item.name}
                        </h3>


                        <p>
                            ₦${Number(
                                item.pricePerUnit || 0
                            ).toLocaleString()}
                            / ${item.unit || ""}
                        </p>


                        ${stockMessage}


                        <div class="quantity-actions">

                            <div class="order-quantity">

                                <button
                                    type="button"
                                    class="cart-minus"
                                    data-id="${item.productId}"
                                    ${
                                        quantity <= 1
                                            ? "disabled"
                                            : ""
                                    }>
                                    −
                                </button>


                                <span>
                                    ${quantity}
                                </span>


                                <button
                                    type="button"
                                    class="cart-plus"
                                    data-id="${item.productId}">
                                    +
                                </button>

                            </div>


                            <button
                                type="button"
                                class="remove-cart-btn"
                                data-id="${item.productId}">

                                Remove

                            </button>

                        </div>

                    </div>


                    <div class="order-price">

                        <span>
                            Total
                        </span>


                        <strong>
                            ₦${itemTotal.toLocaleString()}
                        </strong>


                        <button
                            type="button"
                            class="place-order-btn btn btn-plum"
                            data-id="${item.productId}"
                            ${
                                isOutOfStock ||
                                exceedsStock ||
                                quantity <= 0
                                    ? "disabled"
                                    : ""
                            }>

                            ${
                                isOutOfStock
                                    ? "Out of Stock"
                                    : exceedsStock
                                        ? "Reduce Quantity"
                                        : "Place Order"
                            }

                        </button>

                    </div>

                </div>

            `;

        }).join("");


    const totalElement =
        document.getElementById(
            "cart-total"
        );

    if (totalElement) {

        totalElement.textContent =
            "₦" +
            total.toLocaleString();

    }


    if (summary) {

        summary.style.display =
            "flex";

    }


    attachCartButtons();

}




function attachCartButtons() {

    document
        .querySelectorAll(".cart-minus")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    const item =
                        cart.find(
                            item =>
                                Number(item.productId) ===
                                id
                        );

                    if (!item) return;


                    if (
                        Number(item.quantity) > 1
                    ) {

                        item.quantity =
                            Number(item.quantity) - 1;

                        saveCart();

                    }

                }
            );

        });


    document
        .querySelectorAll(".cart-plus")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    const item =
                        cart.find(
                            item =>
                                Number(item.productId) ===
                                id
                        );

                    if (!item) return;


                    

                    item.quantity =
                        Number(item.quantity) + 1;

                    saveCart();

                }
            );

        });


    document
        .querySelectorAll(".remove-cart-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    cart =
                        cart.filter(
                            item =>
                                Number(item.productId) !==
                                id
                        );

                    saveCart();

                }
            );

        });


    document
        .querySelectorAll(".place-order-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(
                            button.dataset.id
                        );

                    placeSingleOrder(
                        productId
                    );

                }
            );

        });

}




function saveCart() {

    saveCartToStorage();

    displayCart();

}




async function placeSingleOrder(productId) {

    

    await refreshCartStock();

    const item =
        cart.find(
            item =>
                Number(item.productId) ===
                productId
        );

    if (!item) return;


    const quantity =
        Number(item.quantity) || 0;

    const currentStock =
        Number(item.maxStock);


    if (quantity <= 0) {

        alert(
            "Please select a valid quantity."
        );

        return;

    }


    if (
        Number.isFinite(currentStock) &&
        currentStock <= 0
    ) {

        alert(
            "This product is currently out of stock."
        );

        displayCart();

        return;

    }


    if (
        Number.isFinite(currentStock) &&
        quantity > currentStock
    ) {

        alert(
            `Only ${currentStock} ${item.unit || "units"} are currently available. Your cart contains ${quantity}. Please reduce the quantity before placing the order.`
        );

        displayCart();

        return;

    }


    const confirmed =
        confirm(
            `Place an order for ${item.name}?`
        );

    if (!confirmed) return;


    const button =
        document.querySelector(
            `.place-order-btn[data-id="${productId}"]`
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Placing...";

    }


    try {

        await apiPost(
            ENDPOINT +
            "/create/" +
            user.id,
            {
                productId:
                    Number(item.productId),

                quantity:
                    quantity
            }
        );


        

        cart =
            cart.filter(
                cartItem =>
                    Number(cartItem.productId) !==
                    productId
            );


        saveCartToStorage();

        await fetchMyOrders();

        await displayCart();


        alert(
            "Order placed successfully and is waiting for seller confirmation."
        );


    }

    catch (error) {

        console.error(
            "Unable to place order:",
            error
        );


       

        alert(
            "Unable to place order: " +
            error.message
        );


        await refreshCartStock();

        await displayCart();

    }

}




function displayOrders(orders) {

    const pendingContainer =
        document.getElementById(
            "pending-orders-container"
        );

    const ongoingContainer =
        document.getElementById(
            "ongoing-orders-container"
        );


    if (!pendingContainer || !ongoingContainer) {
        return;
    }


    const pending =
        orders.filter(
            order =>
                [
                    "PENDING",
                    "ACCEPTED"
                ].includes(order.status)
        );


    const ongoing =
        orders.filter(
            order =>
                [
                    "PAID",
                    "SHIPPED"
                ].includes(order.status)
        );


    const pendingIds =
        new Set(
            pending.map(
                order =>
                    Number(order.id)
            )
        );


    for (const id of selectedOrders) {

        if (!pendingIds.has(id)) {

            selectedOrders.delete(id);

        }

    }


    const pendingCount =
        document.getElementById(
            "pending-count"
        );

    const ongoingCount =
        document.getElementById(
            "ongoing-count"
        );


    if (pendingCount) {

        pendingCount.textContent =
            pending.length;

    }


    if (ongoingCount) {

        ongoingCount.textContent =
            ongoing.length;

    }




    if (pending.length === 0) {

        pendingContainer.innerHTML = `
            <div class="empty-orders">

                <h3>No pending orders</h3>

                <p>
                    Orders waiting for seller confirmation
                    will appear here.
                </p>

            </div>
        `;

    }

    else {

        pendingContainer.innerHTML =
            pending
                .map(
                    order =>
                        createOrderCard(order)
                )
                .join("");

    }


   

    if (ongoing.length === 0) {

        ongoingContainer.innerHTML = `
            <div class="empty-orders">

                <h3>No ongoing orders</h3>

                <p>
                    Accepted and paid orders
                    will appear here.
                </p>

            </div>
        `;

    }

    else {

        ongoingContainer.innerHTML =
            ongoing
                .map(
                    order =>
                        createOrderCard(order)
                )
                .join("");

    }


    attachCheckoutSelection();

    updateCheckoutButton();

}




function attachCheckoutSelection() {

    document
        .querySelectorAll(".checkout-checkbox")
        .forEach(box => {

            const id =
                Number(
                    box.dataset.id
                );


            box.checked =
                selectedOrders.has(id);


            box.addEventListener(
                "change",
                () => {

                    if (box.checked) {

                        selectedOrders.add(id);

                    }

                    else {

                        selectedOrders.delete(id);

                    }

                    updateCheckoutButton();

                }
            );

        });

}




function updateCheckoutButton() {

    const wrapper =
        document.getElementById(
            "pending-checkout"
        );

    const button =
        document.getElementById(
            "checkout-selected-btn"
        );


    if (!wrapper || !button) {
        return;
    }


    if (selectedOrders.size === 0) {

        wrapper.style.display =
            "none";

        button.textContent =
            "Proceed to Checkout (0)";

        return;

    }


    wrapper.style.display =
        "flex";

    button.textContent =
        `Proceed to Checkout (${selectedOrders.size})`;

}




function createOrderCard(order) {

    const product =
        order.product || {};

    const status =
        order.status || "PENDING";


    return `

        <div class="order-card">

            <img
                src="${
                    product.imageUrl ||
                    "images/default-product.png"
                }"
                class="order-image"
                alt="${
                    product.name ||
                    "Product"
                }">


            <div class="order-info">

                <h3>
                    ${
                        product.name ||
                        "Unknown Product"
                    }
                </h3>


                <p>
                    Quantity:
                    ${order.quantity}
                    ${product.unit || ""}
                </p>


                <p>
                    Order #${order.id}
                </p>


                <span
                    class="order-status status-${status.toLowerCase()}">

                    ${formatStatus(status)}

                </span>

            </div>


            <div class="order-price">

                <span>
                    Total
                </span>


                <strong>
                    ₦${Number(
                        order.totalPrice || 0
                    ).toLocaleString()}
                </strong>


                ${
                    status === "ACCEPTED"
                    ? `
                        <label class="checkout-select">

                            <input
                                type="checkbox"
                                class="checkout-checkbox"
                                data-id="${order.id}">

                            <span>
                                Ready to Checkout
                            </span>

                        </label>
                    `
                    : ""
                }


                ${
                    ["PENDING", "ACCEPTED"].includes(status)
                    ? `
                        <button
                            type="button"
                            class="delete-order-btn"
                            onclick="deleteOrder(${order.id})">

                            Delete Order

                        </button>
                    `
                    : ""
                }

            </div>

        </div>

    `;

}




function formatStatus(status) {

    const labels = {

        PENDING:
            "Pending - Waiting for Seller",

        ACCEPTED:
            "Accepted - Continue to Payment",

        PAID:
            "Paid",

        SHIPPED:
            "Shipped",

        DELIVERED:
            "Completed",

        CANCELLED:
            "Cancelled"

    };

    return labels[status] || status;

}




async function deleteOrder(orderId) {

    const confirmed =
        confirm(
            "Delete this order? Any reserved stock will be returned to the seller."
        );


    if (!confirmed) return;


    try {

        await apiDelete(
            `${ENDPOINT}/${orderId}`
        );


        selectedOrders.delete(
            Number(orderId)
        );


        await fetchMyOrders();


        alert(
            "Order deleted."
        );

    }

    catch (error) {

        console.error(
            "Unable to delete order:",
            error
        );

        alert(
            "Unable to delete order: " +
            error.message
        );

    }

}




function proceedToCheckout() {

    if (selectedOrders.size === 0) {

        alert(
            "Select at least one accepted order."
        );

        return;

    }


    localStorage.setItem(
        "checkoutOrderIds",
        JSON.stringify(
            [...selectedOrders]
        )
    );


    window.location.href =
        "checkout.html";

}




window.deleteOrder =
    deleteOrder;

window.proceedToCheckout =
    proceedToCheckout;




document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await displayCart();

        await fetchMyOrders();


        const checkoutSelectedButton =
            document.getElementById(
                "checkout-selected-btn"
            );


        if (checkoutSelectedButton) {

            checkoutSelectedButton.addEventListener(
                "click",
                proceedToCheckout
            );

        }

    }
);