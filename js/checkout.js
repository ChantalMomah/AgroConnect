import { apiGet, apiPut } from "./api.js";
import { requireAuth } from "./auth.js";

if (!requireAuth()) {
    throw new Error("Not authenticated.");
}


const singleOrderId =
    localStorage.getItem("checkoutOrderId");

const selectedOrderIds =
    JSON.parse(
        localStorage.getItem("checkoutOrderIds")
    ) || [];

let currentOrders = [];

const ENDPOINT = "/orders";

if (
    selectedOrderIds.length === 0 &&
    !singleOrderId
) {
    alert("No order selected for checkout.");
    location.href = "buyer-orders.html";
}

// PAGE INITIALIZATION

loadOrder();

setupDelivery();

setupPayment();

setupPayButton();

setupTransferButton();

loadSavedPaymentInformation();



async function loadOrder() {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (!user) return;


    try {

        const orders =
            await apiGet(
                `${ENDPOINT}/user/${user.id}`
            );


        // Support multi-order checkout
        if (selectedOrderIds.length > 0) {

            currentOrders =
                orders.filter(order =>
                    selectedOrderIds.includes(
                        order.id
                    )
                );

        }

        // Support single-order checkout
        else if (singleOrderId) {

            currentOrders =
                orders.filter(order =>
                    order.id == singleOrderId
                );

        }


        if (currentOrders.length === 0) {

            alert("Order not found.");

            location.href =
                "buyer-orders.html";

            return;
        }


        let subtotal = 0;


        document
            .getElementById("checkout-order")
            .innerHTML =

            currentOrders.map(order => {

                const product =
                    order.product || {};

                subtotal +=
                    Number(order.totalPrice);


                return `

                    <div class="checkout-item">

                        <span>
                            ${product.name || "Product"}
                        </span>

                        <strong>
                            ₦${Number(
                                order.totalPrice
                            ).toLocaleString()}
                        </strong>

                    </div>

                    <div class="checkout-item">

                        <span>
                            Quantity
                        </span>

                        <strong>
                            ${order.quantity}
                            ${product.unit || ""}
                        </strong>

                    </div>

                `;

            }).join("");


        const fee =
            getPlatformFee(subtotal);

        const total =
            subtotal + fee;


        document
            .getElementById("checkout-subtotal")
            .textContent =
            "₦" +
            subtotal.toLocaleString();


        document
            .getElementById("checkout-fee")
            .textContent =
            "₦" +
            fee.toLocaleString();


        document
            .getElementById("checkout-total")
            .textContent =
            "₦" +
            total.toLocaleString();


        document
            .getElementById("pay-btn")
            .textContent =
            "Pay ₦" +
            total.toLocaleString();

    }

    catch (error) {

        console.error(
            "Unable to load checkout:",
            error
        );

        alert(
            "Unable to load your order."
        );

    }

}


function getPlatformFee(subtotal) {

    if (subtotal < 10000) {
        return 250;
    }

    if (subtotal < 50000) {
        return 500;
    }

    return 1000;

}




function setupDelivery() {

    const addressSection =
        document.getElementById(
            "delivery-address-section"
        );

    const addressInput =
        document.getElementById(
            "delivery-address"
        );

    const pickupMessage =
        document.getElementById(
            "pickup-message"
        );

    const deliveryText =
        document.getElementById(
            "delivery-text"
        );


    function updateDeliveryDisplay(radio) {

        const pickup =
            radio.value === "PICKUP";


        document
            .querySelectorAll(
                ".delivery-option"
            )
            .forEach(option =>
                option.classList.remove(
                    "active"
                )
            );


        radio
            .closest(
                ".delivery-option"
            )
            .classList.add(
                "active"
            );


        addressSection.style.display =
            pickup
                ? "none"
                : "block";


        addressInput.required =
            !pickup;


        pickupMessage.style.display =
            pickup
                ? "block"
                : "none";


        deliveryText.textContent =
            pickup
                ? "No delivery fee"
                : "Calculated with seller";

    }


    document
        .querySelectorAll(
            "input[name='delivery']"
        )
        .forEach(radio => {

            radio.addEventListener(
                "change",
                () => {
                    updateDeliveryDisplay(radio);
                }
            );

        });


    const selectedDelivery =
        document.querySelector(
            "input[name='delivery']:checked"
        );


    if (selectedDelivery) {

        updateDeliveryDisplay(
            selectedDelivery
        );

    }

}




function getDeliveryInformation() {

    const selectedDelivery =
        document.querySelector(
            "input[name='delivery']:checked"
        );


    if (!selectedDelivery) {

        alert(
            "Please select a delivery method."
        );

        return null;

    }


    const deliveryMethod =
        selectedDelivery.value;


    const addressInput =
        document.getElementById(
            "delivery-address"
        );


    if (deliveryMethod === "DELIVERY") {

        const address =
            addressInput.value.trim();


        if (!address) {

            alert(
                "Please enter your delivery address."
            );

            addressInput.focus();

            return null;

        }


        return {
            method: "DELIVERY",
            address: address
        };

    }


    return {
        method: "PICKUP",
        address: null
    };

}




async function saveDeliveryInformation(
    deliveryInfo
) {

    for (
        const order
        of currentOrders
    ) {

        let url =
            `${ENDPOINT}/${order.id}/delivery`;


        const params =
            new URLSearchParams();


        params.append(
            "deliveryMethod",
            deliveryInfo.method
        );


        if (
            deliveryInfo.method === "DELIVERY"
        ) {

            params.append(
                "deliveryAddress",
                deliveryInfo.address
            );

        }


        await apiPut(
            `${url}?${params.toString()}`
        );

    }

}




function setupPayment() {

    const payButton =
        document.getElementById(
            "pay-btn"
        );


    document
        .querySelectorAll(
            "input[name='payment']"
        )
        .forEach(radio => {

            radio.addEventListener(
                "change",
                () => {

                    document
                        .querySelectorAll(
                            ".payment-option"
                        )
                        .forEach(option =>
                            option.classList.remove(
                                "active"
                            )
                        );


                    radio
                        .closest(
                            ".payment-option"
                        )
                        .classList.add(
                            "active"
                        );


                    const transfer =
                        radio.value ===
                        "TRANSFER";


                    document
                        .getElementById(
                            "card-form"
                        )
                        .style.display =
                        transfer
                            ? "none"
                            : "block";


                    document
                        .getElementById(
                            "transfer-box"
                        )
                        .style.display =
                        transfer
                            ? "block"
                            : "none";


                    payButton.style.display =
                        transfer
                            ? "none"
                            : "block";

                }
            );

        });

}




async function markOrdersAsPaid() {

    for (
        const order
        of currentOrders
    ) {

        await apiPut(
            `${ENDPOINT}/${order.id}/status?status=PAID`
        );

    }

}




function setupPayButton() {

    const button =
        document.getElementById(
            "pay-btn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        async () => {

            const deliveryInfo =
                getDeliveryInformation();


            if (!deliveryInfo) {
                return;
            }


            try {

                // Save delivery information
                await saveDeliveryInformation(
                    deliveryInfo
                );


                // Mark orders as paid
                await markOrdersAsPaid();


                alert(
                    "Payment successful!"
                );


                localStorage.removeItem(
                    "checkoutOrderId"
                );

                localStorage.removeItem(
                    "checkoutOrderIds"
                );


                location.href =
                    "buyer-orders.html";

            }

            catch (error) {

                console.error(
                    "Payment failed:",
                    error
                );

                alert(
                    "Payment failed: " +
                    error.message
                );

            }

        }
    );

}



function setupTransferButton() {

    const button =
        document.getElementById(
            "transfer-confirm-btn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        async () => {

            const deliveryInfo =
                getDeliveryInformation();


            if (!deliveryInfo) {
                return;
            }


            try {

                // Save delivery information
                await saveDeliveryInformation(
                    deliveryInfo
                );


                // Mark orders as paid
                await markOrdersAsPaid();


                alert(
                    "Transfer submitted! Your payment has been recorded."
                );


                localStorage.removeItem(
                    "checkoutOrderId"
                );

                localStorage.removeItem(
                    "checkoutOrderIds"
                );


                location.href =
                    "buyer-orders.html";

            }

            catch (error) {

                console.error(
                    "Transfer confirmation failed:",
                    error
                );

                alert(
                    "Unable to confirm transfer: " +
                    error.message
                );

            }

        }
    );

}




async function loadSavedPaymentInformation() {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (!user) return;


    try {

        const savedUser =
            await apiGet(
                "/users/" +
                user.id
            );


        const bankName =
            savedUser.bankName || "";


        const accountName =
            savedUser.accountName || "";


        const accountNumber =
            savedUser.accountNumber || "";


        if (
            !bankName &&
            !accountName &&
            !accountNumber
        ) {

            return;

        }


        const savedPaymentBox =
            document.getElementById(
                "saved-payment-box"
            );


        const savedBankName =
            document.getElementById(
                "saved-bank-name"
            );


        const savedAccountName =
            document.getElementById(
                "saved-account-name"
            );


        const savedAccountNumber =
            document.getElementById(
                "saved-account-number"
            );


        if (!savedPaymentBox) return;


        savedBankName.textContent =
            bankName ||
            "Not provided";


        savedAccountName.textContent =
            accountName ||
            "Not provided";


        if (accountNumber) {

            const lastFour =
                accountNumber.slice(-4);


            savedAccountNumber.textContent =
                "••••••" +
                lastFour;

        }

        else {

            savedAccountNumber.textContent =
                "Not provided";

        }


        savedPaymentBox.style.display =
            "block";

    }

    catch (error) {

        console.error(
            "Unable to load saved payment information:",
            error
        );

    }

}