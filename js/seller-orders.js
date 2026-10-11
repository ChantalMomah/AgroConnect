import { apiGet, apiPut } from "./api.js";
import { requireAuth } from "./auth.js";



if (!requireAuth()) {
    throw new Error("User not authenticated.");
}

const user = JSON.parse(localStorage.getItem("user"));


if (
    !user ||
    (user.role !== "FARMER" &&
     user.role !== "INPUT_SELLER")
) {
    alert("Access denied.");
    window.location.href = "dashboard.html";
    throw new Error("Unauthorized");
}



const ENDPOINT = "/orders";



export async function fetchSellerOrders() {

    try {

        const sellerId = user.id;

        const [
            requests,
            ongoing,
            completed
        ] = await Promise.all([

            apiGet(
                `${ENDPOINT}/seller/${sellerId}/requests`
            ),

            apiGet(
                `${ENDPOINT}/seller/${sellerId}/ongoing`
            ),

            apiGet(
                `${ENDPOINT}/seller/${sellerId}/completed`
            )

        ]);


        displayOrderSections(
            requests,
            ongoing,
            completed
        );


    } catch (error) {

        console.error(
            "Error fetching seller orders:",
            error
        );

        const container =
            document.getElementById("orders-container");

        if (container) {

            container.innerHTML = `
                <div class="empty-orders">

                    <h3>Unable to load orders</h3>

                    <p>
                        ${error.message}
                    </p>

                </div>
            `;

        }

    }

}



function displayOrderSections(
    requests,
    ongoing,
    completed
) {

    const container =
        document.getElementById("orders-container");

    if (!container) return;


    container.innerHTML = `

        <!-- ==================================
             ORDER REQUESTS
        =================================== -->

        <section class="orders-section">

            <div class="section-heading">

                <h2>Order Requests</h2>

                <span class="section-count">
                    ${requests?.length || 0}
                </span>

            </div>

            <div class="orders-list">

                ${
                    requests && requests.length > 0
                    ? requests
                        .map(order =>
                            createOrderCard(
                                order,
                                "REQUEST"
                            )
                        )
                        .join("")
                    : createEmptySection(
                        "No order requests",
                        "New orders placed for your products will appear here."
                    )
                }

            </div>

        </section>


        <!-- ==================================
             ONGOING ORDERS
        =================================== -->

        <section class="orders-section">

            <div class="section-heading">

                <h2>Ongoing Orders</h2>

                <span class="section-count">
                    ${ongoing?.length || 0}
                </span>

            </div>

            <div class="orders-list">

                ${
                    ongoing && ongoing.length > 0
                    ? ongoing
                        .map(order =>
                            createOrderCard(
                                order,
                                "ONGOING"
                            )
                        )
                        .join("")
                    : createEmptySection(
                        "No ongoing orders",
                        "Orders will appear here after the buyer's payment has been confirmed."
                    )
                }

            </div>

        </section>


        <!-- ==================================
             COMPLETED ORDERS
        =================================== -->

        <section class="orders-section">

            <div class="section-heading">

                <h2>Completed Orders</h2>

                <span class="section-count">
                    ${completed?.length || 0}
                </span>

            </div>

            <div class="orders-list">

                ${
                    completed && completed.length > 0
                    ? completed
                        .map(order =>
                            createOrderCard(
                                order,
                                "COMPLETED"
                            )
                        )
                        .join("")
                    : createEmptySection(
                        "No completed orders",
                        "Orders you have successfully delivered will appear here."
                    )
                }

            </div>

        </section>

    `;

}



function createOrderCard(order, section) {

    const product = order.product || {};
    const buyer = order.buyer || {};

    const productName =
        product.name ||
        order.productName ||
        "Unknown Product";

    const buyerName =
        buyer.fullName ||
        order.buyerName ||
        "Unknown Buyer";

    const buyerPhone =
        buyer.phoneNumber ||
        order.buyerPhoneNumber ||
        "Phone number unavailable";

    const buyerLocation =
        buyer.state ||
        order.buyerState ||
        "Location unavailable";

    const image =
        product.imageUrl ||
        order.imageUrl ||
        "images/default-product.png";

    const unit =
        product.unit || "";

    const quantity =
        order.quantity ?? 0;

    const totalPrice =
        Number(order.totalPrice || 0).toLocaleString();

    const date =
        order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : "N/A";


  
    // DELIVERY INFORMATION

    let deliveryInformation = "";


    if (
        (section === "ONGOING" ||
         section === "COMPLETED") &&
        order.status !== "PENDING" &&
        order.status !== "ACCEPTED"
    ) {

        if (order.deliveryMethod === "DELIVERY") {

            deliveryInformation = `

                <div class="delivery-information">

                    <p>
                        <strong>Delivery Method:</strong>
                        Seller-arranged Delivery
                    </p>

                    <p>
                        <strong>Delivery Address:</strong>
                        ${order.deliveryAddress || "Address unavailable"}
                    </p>

                </div>

            `;

        }

        else if (order.deliveryMethod === "PICKUP") {

            deliveryInformation = `

                <div class="delivery-information">

                    <p>
                        <strong>Delivery Method:</strong>
                        Pickup
                    </p>

                    <p>
                        <strong>Pickup:</strong>
                        Buyer will collect the order from the seller.
                    </p>

                </div>

            `;

        }

    }


    let actions = "";



    // REQUEST ACTIONS

    if (section === "REQUEST") {

        if (order.status === "PENDING") {

            actions = `
                <div class="order-actions">

                    <button
                        class="order-action-btn"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'ACCEPTED'
                        )">

                        Accept

                    </button>

                    <button
                        class="order-cancel-btn"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'CANCELLED',
                            'PENDING'
                        )">

                        Deny

                    </button>

                </div>
            `;

        }

        else if (order.status === "ACCEPTED") {

            const acceptedTime =
                new Date(order.createdAt);

            const now =
                new Date();

            const hoursPassed =
                (now - acceptedTime) /
                (1000 * 60 * 60);


            if (hoursPassed >= 24) {

                actions = `
                    <div class="order-actions">

                        <button
                            class="order-cancel-btn"
                            onclick="updateOrderStatus(
                                ${order.id},
                                'CANCELLED',
                                'ACCEPTED'
                            )">

                            Cancel Acceptance

                        </button>

                    </div>
                `;

            }

            else {

                const hoursLeft =
                    Math.ceil(
                        24 - hoursPassed
                    );

                actions = `
                    <div class="order-actions">

                        <span class="waiting-payment">

                            Waiting for payment
                            (${hoursLeft}h left)

                        </span>

                    </div>
                `;

            }

        }

    }


 

    else if (section === "ONGOING") {

        if (order.status === "PAID") {

            actions = `

                <div class="order-actions">

                    <button
                        class="order-action-btn"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'SHIPPED'
                        )">

                        Mark as Shipped

                    </button>

                </div>

            `;

        }

        else if (order.status === "SHIPPED") {

            actions = `

                <div class="order-actions">

                    <button
                        class="order-action-btn"
                        onclick="updateOrderStatus(
                            ${order.id},
                            'DELIVERED'
                        )">

                        Mark as Delivered

                    </button>

                </div>

            `;

        }

    }




    else if (section === "COMPLETED") {

        actions = `

            <span class="completed-label">
                Completed
            </span>

        `;

    }


    return `

        <div class="order-card">

            <img
                src="${image}"
                alt="${productName}"
                class="order-image"
                onerror="this.src='images/default-product.png'">

            <div class="order-info">

                <h3>${productName}</h3>

                <p>
                    <strong>Buyer:</strong>
                    ${buyerName}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${buyerPhone}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${buyerLocation.replaceAll("_", " ")}
                </p>

                <p>
                    <strong>Quantity:</strong>
                    ${quantity} ${unit}
                </p>

                <p>
                    <strong>Order Date:</strong>
                    ${date}
                </p>

                ${deliveryInformation}

                <span class="order-status ${getStatusClass(order.status)}">
                    ${formatStatus(order.status)}
                </span>

            </div>

            <div class="order-price">

                <span>Total</span>

                <strong>₦${totalPrice}</strong>

                ${actions}

            </div>

        </div>

    `;

}




function createEmptySection(
    title,
    message
) {

    return `

        <div class="empty-orders">

            <h3>
                ${title}
            </h3>

            <p>
                ${message}
            </p>

        </div>

    `;

}




function getStatusClass(status) {

    switch (status) {

        case "PENDING":
            return "status-pending";

        case "ACCEPTED":
            return "status-accepted";

        case "PAID":
            return "status-confirmed";

        case "SHIPPED":
            return "status-shipped";

        case "DELIVERED":
            return "status-delivered";

        case "CANCELLED":
            return "status-cancelled";

        default:
            return "";

    }

}




function formatStatus(status) {

    if (!status) return "Unknown";


    const statusMap = {

        PENDING: "Pending",

        ACCEPTED: "Accepted - Awaiting Payment",

        PAID: "Paid",

        SHIPPED: "Shipped",

        DELIVERED: "Completed",

        CANCELLED: "Denied"

    };


    return statusMap[status] || status;

}




export async function updateOrderStatus(
    orderId,
    status,
    currentStatus = null
) {

    if (!orderId || !status) {
        return;
    }


    let message =
        "Update this order?";


    if (status === "ACCEPTED") {

        message =
            "Accept this order? The requested quantity will be reserved from your available stock.";

    }


    if (status === "CANCELLED") {

        if (currentStatus === "PENDING") {

            message =
                "Deny this order request?";

        }

        else if (currentStatus === "ACCEPTED") {

            message =
                "Cancel this accepted order? The reserved stock will be returned to your available stock.";

        }

    }


    if (status === "SHIPPED") {

        message =
            "Mark this order as shipped?";

    }


    if (status === "DELIVERED") {

        message =
            "Mark this order as delivered?";

    }


    if (!confirm(message)) {

        return;

    }


    try {

        await apiPut(
            `${ENDPOINT}/${orderId}/status?status=${status}`
        );


        let successMessage =
            "Order updated successfully.";


        if (
            status === "ACCEPTED"
        ) {

            successMessage =
                "Order accepted successfully. The requested quantity has been reserved from your available stock.";

        }

        else if (
            status === "CANCELLED" &&
            currentStatus === "PENDING"
        ) {

            successMessage =
                "Order request denied.";

        }

        else if (
            status === "CANCELLED" &&
            currentStatus === "ACCEPTED"
        ) {

            successMessage =
                "Order acceptance cancelled. The reserved stock is now available again.";

        }


        alert(successMessage);


        await fetchSellerOrders();


    } catch (error) {

        console.error(
            "Error updating order:",
            error
        );


        alert(
            "Error updating order: " +
            error.message
        );

    }

}



// MAKE FUNCTION AVAILABLE TO HTML

window.updateOrderStatus =
    updateOrderStatus;


// LOAD ORDERS

document.addEventListener(
    "DOMContentLoaded",
    function () {

        fetchSellerOrders();

    }
);