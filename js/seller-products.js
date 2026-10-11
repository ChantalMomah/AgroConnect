import { apiGet, apiDelete } from "./api.js";

const user = JSON.parse(localStorage.getItem("user"));

const ENDPOINT = "/products";

let sellerProducts = [];


const loggedInUser = JSON.parse(localStorage.getItem("user"));

const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get("userId");

const isPublicProfile = !!profileUserId;

const targetUserId = isPublicProfile
    ? profileUserId
    : loggedInUser.id;

const isBuyerViewingSeller =
    isPublicProfile && loggedInUser.role === "BUYER";    

function setupPageMode() {
    const pageTitle = document.getElementById("products-page-title");
    const pageDescription = document.getElementById("products-page-description");
    const sidebarProducts = document.querySelector(".sidebar-links a.active");

    if (isPublicProfile) {

        if (pageTitle) {
            pageTitle.textContent = "Products";
        }

        if (pageDescription) {
            pageDescription.textContent =
                "View agricultural products listed by this user.";
        }

        if (sidebarProducts) {
            sidebarProducts.textContent = "🛒 Products";
        }

    } else {

        if (pageTitle) {
            pageTitle.textContent = "My Products";
        }

        if (pageDescription) {
            pageDescription.textContent =
                "Manage your agricultural products, update listings, and add new products for buyers to discover.";
        }

    }
}



async function fetchSellerProducts() {

    try {

        const products = await apiGet(ENDPOINT);

        sellerProducts = products.filter(product => {

            const productUserId =
                product.userId ||
                product.seller?.id ||
                product.user?.id;

            return Number(productUserId) === Number(targetUserId);

        });

        updateStatistics();

        displayProducts(sellerProducts);

    }

    catch (error) {

        console.error(error);

        alert("Unable to load products.");

    }

}



function updateStatistics() {

    document.getElementById("total-products").textContent =
        sellerProducts.length;

    document.getElementById("available-products").textContent =
        sellerProducts.filter(product =>
            product.stockQuantity > 0
        ).length;

    document.getElementById("outofstock-products").textContent =
        sellerProducts.filter(product =>
            product.stockQuantity === 0
        ).length;

}



function displayProducts(products) {

    const container = document.getElementById("products-container");

    if (!container) return;

    if (products.length === 0) {

        if (isPublicProfile) {

            container.innerHTML = `
                <div class="no-products">
                    <h3>No Products Yet</h3>
                    <p>This user has not listed any products yet.</p>
                </div>
            `;

        } else {

            container.innerHTML = `
                <div class="no-products">
                    <h3>No Products Yet</h3>
                    <p>Click "Add New Product" to create your first listing.</p>
                </div>
            `;

        }

        return;
    }

    container.innerHTML = products.map(product => `

        <div class="product-card">

            <div class="product-image-section">

                <img
                    src="${product.imageUrl || "images/default-product.png"}"
                    alt="${product.name}"
                    class="product-image">

                <button
                    type="button"
                    class="expand-image-btn"
                    data-image="${product.imageUrl || "images/default-product.png"}"
                    title="View Full Image">

                    ⛶

                </button>

            </div>

            <div class="product-details">

                <h3 class="product-name">
                    ${product.name}
                </h3>

                <p class="product-description">
                    ${product.description || "No description available."}
                </p>

                <div class="product-meta">

                    <p>
                        <strong>Price:</strong>
                        ₦${Number(product.pricePerUnit).toLocaleString()} per ${product.unit}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${product.category
                            ? product.category.replaceAll("_", " ")
                            : "Not specified"}
                    </p>

                    <p>
                        <strong>State:</strong>
                        ${product.state}
                    </p>

                    <p>
                        <strong>Delivery To:</strong>
                        ${
                            product.deliveryStates &&
                            product.deliveryStates.length > 0
                                ? product.deliveryStates
                                    .map(state =>
                                        state.replace("_", " ")
                                    )
                                    .join(", ")
                                : "Not specified"
                        }
                    </p>

                    <p>
                        <strong>Stock:</strong>
                        ${product.stockQuantity} Available
                    </p>

                </div>

                ${
                    isBuyerViewingSeller && Number(product.stockQuantity) > 0
                        ? `

                            <div class="product-actions">

                                <div class="product-action-row">

                                    <div class="quantity-selector">

                                        <button
                                            type="button"
                                            class="qty-minus"
                                            data-id="${product.id}">−</button>

                                        <span
                                            class="qty-value"
                                            data-id="${product.id}">1</span>

                                        <button
                                            type="button"
                                            class="qty-plus"
                                            data-id="${product.id}"
                                            data-max="${product.stockQuantity}">+</button>

                                    </div>

                                    <button
                                        type="button"
                                        class="add-cart-btn"
                                        data-id="${product.id}">

                                        Add to Cart

                                    </button>

                                </div>

                                <p class="max-stock">
                                    Maximum: ${product.stockQuantity} ${product.unit}
                                </p>

                            </div>

                        `
                        : !isPublicProfile
                            ? `

                                <div class="product-actions">

                                    <button
                                        type="button"
                                        class="edit-btn"
                                        data-id="${product.id}">

                                        ✏ Edit

                                    </button>

                                    <button
                                        type="button"
                                        class="delete-btn"
                                        data-id="${product.id}">

                                        🗑 Delete

                                    </button>

                                </div>

                            `
                            : ""
                }

            </div>

        </div>

    `).join("");

    attachEditButtons();
    attachDeleteButtons();
    attachQuantityButtons();
    attachAddToCartButtons();
    attachExpandButtons();

}


// Expand Image
function attachExpandButtons() {

    document.querySelectorAll(".expand-image-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const imageUrl = button.dataset.image;

                if (!imageUrl) return;

                const overlay = document.createElement("div");

                overlay.className = "image-modal";

                overlay.innerHTML = `
                    <div class="image-modal-content">

                        <button
                            type="button"
                            class="close-image-modal">
                            ✕
                        </button>

                        <img
                            src="${imageUrl}"
                            alt="Product image">
                    </div>
                `;

                document.body.appendChild(overlay);

                // Close button
                overlay
                    .querySelector(".close-image-modal")
                    .addEventListener("click", () => {
                        overlay.remove();
                    });

                overlay.addEventListener("click", (event) => {

                    if (event.target === overlay) {
                        overlay.remove();
                    }

                });

            });

        });

}


function attachDeleteButtons() {

    document.querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const id = button.dataset.id;

                if (!confirm("Delete this product?")) return;

                try {

                    await apiDelete(
                        ENDPOINT + "/" + id
                    );

                    fetchSellerProducts();

                }

                catch (error) {

                    console.error(error);

                    alert(error.message);

                }

            });

        });

}



function attachAddToCartButtons() {

    document.querySelectorAll(".add-cart-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const productId =
                    Number(button.dataset.id);

                const product =
                    sellerProducts.find(
                        p =>
                            Number(p.id) ===
                            productId
                    );

                if (!product) return;

                const quantityElement =
                    document.querySelector(
                        `.qty-value[data-id="${productId}"]`
                    );

                if (!quantityElement) return;

                const quantity =
                    Number(quantityElement.textContent);

                if (quantity <= 0) return;

                let cart =
                    JSON.parse(
                        localStorage.getItem("cart")
                    ) || [];

                const existing =
                    cart.find(
                        item =>
                            Number(item.productId) ===
                            productId
                    );

                if (existing) {

                    existing.quantity += quantity;

                    existing.name =
                        product.name;

                    existing.imageUrl =
                        product.imageUrl;

                    existing.pricePerUnit =
                        product.pricePerUnit;

                    existing.unit =
                        product.unit;

                    existing.state =
                        product.state;

                    existing.deliveryStates =
                        product.deliveryStates || [];

                    existing.sellerId =
                        product.userId ||
                        product.user?.id ||
                        product.seller?.id;

                    existing.maxStock =
                        Number(product.stockQuantity) || 0;

                } else {

                    cart.push({

                        productId:
                            product.id,

                        name:
                            product.name,

                        imageUrl:
                            product.imageUrl,

                        pricePerUnit:
                            product.pricePerUnit,

                        unit:
                            product.unit,

                        state:
                            product.state,

                        deliveryStates:
                            product.deliveryStates || [],

                        sellerId:
                            product.userId ||
                            product.user?.id ||
                            product.seller?.id,

                        quantity:
                            quantity,

                        maxStock:
                            Number(product.stockQuantity) || 0

                    });

                }

                localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
                );

                alert("Product added to cart!");

            });

        });

}

function attachQuantityButtons() {

    document.querySelectorAll(".qty-plus")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id =
                    button.dataset.id;

                const value =
                    document.querySelector(
                        `.qty-value[data-id="${id}"]`
                    );

                if (!value) return;

                let quantity =
                    Number(value.textContent);

                value.textContent =
                    quantity + 1;

            });

        });


    document.querySelectorAll(".qty-minus")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id =
                    button.dataset.id;

                const value =
                    document.querySelector(
                        `.qty-value[data-id="${id}"]`
                    );

                if (!value) return;

                let quantity =
                    Number(value.textContent);

                if (quantity > 1) {

                    value.textContent =
                        quantity - 1;

                }

            });

        });

}



function attachEditButtons() {

    document.querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id = button.dataset.id;

                // Use the existing Add Product page
                window.location.href =
                    "add-product.html?id=" + id;

            });

        });

}



function setupAddProductButton() {

    const button =
        document.getElementById("add-product-btn");

    if (!button) return;

    if (isPublicProfile) {

        button.style.display = "none";

        return;

    }

    button.addEventListener("click", () => {

        window.location.href =
            "add-product.html";

    });

}

document.addEventListener("DOMContentLoaded", () => {

    setupPageMode();
    fetchSellerProducts();
    setupAddProductButton();

    const backBtn = document.getElementById("back-btn");

    if (backBtn && isPublicProfile) {

        backBtn.style.display = "inline-flex";

        backBtn.addEventListener("click", () => {

            window.location.href = `profile.html?id=${targetUserId}`;

        });

    } else if (backBtn) {

        backBtn.style.display = "none";

    }

});
