import { apiGet } from "./api.js";

const ENDPOINT = "/products";

let allProducts = [];

let currentSlide = 0;
let carouselInterval;


async function fetchProducts() {

    try {

        allProducts = await apiGet(ENDPOINT);

        syncCartWithCurrentStock(allProducts);

        displayBestSellers(allProducts);

        displayProducts(allProducts);

    }

    catch (error) {

        alert("Unable to load products.");

        console.error(error);

    }

}



function syncCartWithCurrentStock(products) {

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    if (cart.length === 0) return;

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

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    }

}



function displayBestSellers(products) {

    const slidesContainer =
        document.getElementById("best-sellers-slides");

    const dotsContainer =
        document.getElementById("carousel-dots");

    if (!slidesContainer || !dotsContainer) return;

    

    const bestSellers =
        products.slice(0, 3);

    if (bestSellers.length === 0) {

        slidesContainer.innerHTML = "";

        dotsContainer.innerHTML = "";

        return;

    }

    slidesContainer.innerHTML =
        bestSellers.map((product, index) => `

            <div
                class="best-seller-slide ${index === 0 ? "active" : ""}"
                data-product-id="${product.id}">

                <img
                    src="${
                        product.imageUrl ||
                        "images/default-product.png"
                    }"
                    class="best-seller-image"
                    alt="${product.name}">

                <div class="best-seller-info">

                    <span class="best-seller-label">
                        ⭐ Best Seller
                    </span>

                    <h2>
                        ${product.name}
                    </h2>

                    <p class="best-seller-price">
                        ₦${Number(
                            product.pricePerUnit || 0
                        ).toLocaleString()}
                        / ${product.unit || ""}
                    </p>

                </div>

            </div>

        `).join("");

    dotsContainer.innerHTML =
        bestSellers.map((product, index) => `

            <button
                type="button"
                class="carousel-dot ${index === 0 ? "active" : ""}"
                data-slide="${index}"
                aria-label="Go to slide ${index + 1}">
            </button>

        `).join("");

    setupCarousel(bestSellers);

}



function setupCarousel(bestSellers) {

    const slides =
        document.querySelectorAll(
            ".best-seller-slide"
        );

    const dots =
        document.querySelectorAll(
            ".carousel-dot"
        );

    const previousButton =
        document.querySelector(
            ".carousel-prev"
        );

    const nextButton =
        document.querySelector(
            ".carousel-next"
        );

    if (slides.length <= 1) {

        if (previousButton)
            previousButton.style.display = "none";

        if (nextButton)
            nextButton.style.display = "none";

        return;

    }

    function showSlide(index) {

        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        dots.forEach(dot => {
            dot.classList.remove("active");
        });

        currentSlide =
            (index + slides.length) %
            slides.length;

        slides[currentSlide]
            .classList.add("active");

        dots[currentSlide]
            .classList.add("active");

    }

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                showSlide(
                    currentSlide - 1
                );

                restartCarousel();

            }
        );

    }

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                showSlide(
                    currentSlide + 1
                );

                restartCarousel();

            }
        );

    }

    dots.forEach(dot => {

        dot.addEventListener(
            "click",
            () => {

                showSlide(
                    Number(
                        dot.dataset.slide
                    )
                );

                restartCarousel();

            }
        );

    });

 

    slides.forEach(slide => {

        slide.addEventListener(
            "click",
            () => {

                const productId =
                    Number(
                        slide.dataset.productId
                    );

                const product =
                    bestSellers.find(
                        item =>
                            Number(item.id) ===
                            productId
                    );

                if (product) {

                    openProductModal(product);

                }

            }
        );

    });

    function startCarousel() {

        carouselInterval =
            setInterval(() => {

                showSlide(
                    currentSlide + 1
                );

            }, 5000);

    }

    function restartCarousel() {

        clearInterval(
            carouselInterval
        );

        startCarousel();

    }

    startCarousel();

}



function displayProducts(products) {

    const container =
        document.getElementById("products-container");

    if (!container) return;

    if (products.length === 0) {

        container.innerHTML =
            `<div class="no-products">
                No products found.
            </div>`;

        return;

    }

    container.innerHTML =
        products.map(product => {

            const stock =
                Number(product.stockQuantity) || 0;

            return `

            <div class="product-card">

                <img
                    src="${
                        product.imageUrl ||
                        "images/default-product.png"
                    }"
                    class="product-image"
                    alt="${product.name}">

                <div class="product-info">

                    <h3 class="product-name">
                        ${product.name}
                    </h3>

                    <p class="product-seller">
                        Sold by
                        <span
                            class="seller-link"
                            data-seller-id="${product.seller?.id || ''}">

                            ${
                                product.seller?.businessName ||
                                product.seller?.fullName ||
                                "Unknown Seller"
                            }

                        </span>
                    </p>

                    <p class="product-price">
                        ₦${Number(
                            product.pricePerUnit || 0
                        ).toLocaleString()}
                        / ${product.unit || ""}
                    </p>

                    <p class="product-location">
                        ${
                            product.state ||
                            "State not specified"
                        }
                    </p>

                    <p>
                        ${product.description ?? ""}
                    </p>

                    <div class="product-actions">

                        <button
                            type="button"
                            class="btn btn-plum view-details-btn"
                            data-id="${product.id}">

                            View Details

                        </button>

                        <button
                            type="button"
                            class="btn add-to-cart-btn"
                            data-id="${product.id}"
                            ${stock <= 0 ? "disabled" : ""}>

                            ${
                                stock <= 0
                                    ? "Out of Stock"
                                    : "Add to Cart"
                            }

                        </button>

                    </div>

                </div>

            </div>

            `;

        }).join("");

    attachViewDetailsButtons();
    attachAddToCartButtons();

}



function attachAddToCartButtons() {

    document
        .querySelectorAll(".add-to-cart-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const productId =
                        Number(button.dataset.id);

                    const product =
                        allProducts.find(
                            item =>
                                Number(item.id) ===
                                productId
                        );

                    if (!product) return;

                    const stock =
                        Number(product.stockQuantity) || 0;

                    if (stock <= 0) return;

                    // Add 1 unit to cart.
                    // Cart does NOT reserve stock.
                    addToCart(product, 1);

                    button.textContent =
                        "✓ Added to Cart";

                    button.disabled = true;

                    setTimeout(() => {

                        button.textContent =
                            "Add to Cart";

                        button.disabled = false;

                    }, 1000);

                }
            );

        });

}



function attachViewDetailsButtons() {

    document
        .querySelectorAll(".view-details-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const productId =
                    Number(button.dataset.id);

                const product =
                    allProducts.find(
                        item =>
                            Number(item.id) ===
                            productId
                    );

                if (!product) return;

                openProductModal(product);

            });

        });

    document
        .querySelectorAll(".seller-link")
        .forEach(link => {

            link.addEventListener("click", () => {

                const sellerId =
                    link.dataset.sellerId;

                if (!sellerId) return;

                window.location.href =
                    `profile.html?id=${sellerId}`;

            });

        });

}



function openProductModal(product) {

    const existingModal =
        document.querySelector(
            ".product-details-modal"
        );

    if (existingModal) {
        existingModal.remove();
    }

    const imageUrl =
        product.imageUrl ||
        "images/default-product.png";

    const deliveryStates =
        product.deliveryStates &&
        product.deliveryStates.length > 0

        ? product.deliveryStates
            .map(state =>
                formatState(state)
            )
            .join(", ")

        : "Not specified";

    const stock =
        Number(product.stockQuantity) || 0;

    const modal =
        document.createElement("div");

    modal.className =
        "product-details-modal";

    modal.innerHTML = `

        <div class="product-details-modal-content">

            <button
                type="button"
                class="close-product-modal"
                title="Close">

                ✕

            </button>

            <div class="product-details-modal-image">

                <img
                    src="${imageUrl}"
                    alt="${product.name}">

            </div>

            <div class="product-details-modal-info">

                <h2>
                    ${product.name}
                </h2>

                <p class="modal-description">

                    ${
                        product.description ||
                        "No description available."
                    }

                </p>

                <div class="modal-product-details">

                    <div class="modal-detail-item">

                        <strong>Price</strong>

                        <span>
                            ₦${Number(
                                product.pricePerUnit || 0
                            ).toLocaleString()}
                            / ${product.unit || ""}
                        </span>

                    </div>

                    <div class="modal-detail-item">

                        <strong>Category</strong>

                        <span>
                            ${
                                product.category
                                    ? formatState(product.category)
                                    : "Not specified"
                            }
                        </span>

                    </div>

                    <div class="modal-detail-item">

                        <strong>Seller's State</strong>

                        <span>
                            ${
                                product.state
                                    ? formatState(product.state)
                                    : "Not specified"
                            }
                        </span>

                    </div>

                    <div class="modal-detail-item">

                        <strong>Delivery To</strong>

                        <span>
                            ${deliveryStates}
                        </span>

                    </div>

                    <div class="modal-detail-item">

                        <strong>Available Stock</strong>

                        <span>
                            ${stock} ${product.unit || ""}
                        </span>

                    </div>

                </div>

                <div class="quantity-section">

                    <label>
                        Quantity
                    </label>

                    <div class="quantity-control">

                        <button
                            type="button"
                            class="quantity-minus"
                            ${stock <= 0 ? "disabled" : ""}>
                                −
                        </button>

                        <span class="quantity-value">
                            ${stock > 0 ? 1 : 0}
                        </span>

                        <button
                            type="button"
                            class="quantity-plus"
                            ${stock <= 0 ? "disabled" : ""}>
                                +
                        </button>

                    </div>

                    <p class="quantity-help">

                        Maximum:
                        ${stock} ${product.unit || ""}

                    </p>

                </div>

                <div class="modal-total">

                    <span>
                        Total
                    </span>

                    <strong class="modal-total-price">

                        ₦${Number(
                            product.pricePerUnit || 0
                        ).toLocaleString()}

                    </strong>

                </div>

                <button
                    type="button"
                    class="add-to-cart-modal-btn"
                    ${stock <= 0 ? "disabled" : ""}>

                    ${
                        stock <= 0
                            ? "Out of Stock"
                            : "Add to Cart"
                    }

                </button>

            </div>

        </div>

    `;

    document.body.appendChild(modal);

    

    let quantity =
        stock > 0 ? 1 : 0;

    const quantityValue =
        modal.querySelector(
            ".quantity-value"
        );

    const minusButton =
        modal.querySelector(
            ".quantity-minus"
        );

    const plusButton =
        modal.querySelector(
            ".quantity-plus"
        );

    const totalPrice =
        modal.querySelector(
            ".modal-total-price"
        );

    function updateQuantity() {

        quantityValue.textContent =
            quantity;

        const total =
            Number(product.pricePerUnit || 0)
            * quantity;

        totalPrice.textContent =
            "₦" +
            total.toLocaleString();

        minusButton.disabled =
            quantity <= 1;

        plusButton.disabled =
            quantity >= stock;

    }

    minusButton.addEventListener(
        "click",
        () => {

            if (quantity > 1) {

                quantity--;

                updateQuantity();

            }

        }
    );

    plusButton.addEventListener(
        "click",
        () => {

            if (quantity < stock) {

                quantity++;

                updateQuantity();

            }

        }
    );



    const addToCartButton =
        modal.querySelector(
            ".add-to-cart-modal-btn"
        );

    if (addToCartButton) {

        addToCartButton.addEventListener(
            "click",
            () => {

                if (quantity <= 0) return;

                addToCart(
                    product,
                    quantity
                );

                addToCartButton.textContent =
                    "✓ Added to Cart";

                addToCartButton.disabled =
                    true;

                setTimeout(() => {

                    modal.remove();

                }, 700);

            }
        );

    }

 

    modal
        .querySelector(
            ".close-product-modal"
        )
        .addEventListener(
            "click",
            () => modal.remove()
        );

    

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.remove();

            }

        }
    );

  

    document.addEventListener(
        "keydown",
        function closeWithEscape(event) {

            if (event.key === "Escape") {

                modal.remove();

                document.removeEventListener(
                    "keydown",
                    closeWithEscape
                );

            }

        }
    );

    updateQuantity();

}



function addToCart(product, quantity) {

    if (quantity <= 0) return;

    let cart =
        JSON.parse(
            localStorage.getItem("cart")
        ) || [];

    const existingItem =
        cart.find(
            item =>
                Number(item.productId) ===
                Number(product.id)
        );

    const currentStock =
        Number(product.stockQuantity) || 0;

    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity || 0)
            + Number(quantity);

        existingItem.name =
            product.name;

        existingItem.pricePerUnit =
            product.pricePerUnit;

        existingItem.unit =
            product.unit;

        existingItem.imageUrl =
            product.imageUrl;

        existingItem.state =
            product.state;

        existingItem.deliveryStates =
            product.deliveryStates || [];

        existingItem.maxStock =
            currentStock;

    }

    else {

        cart.push({

            productId:
                product.id,

            name:
                product.name,

            pricePerUnit:
                product.pricePerUnit,

            unit:
                product.unit,

            imageUrl:
                product.imageUrl,

            state:
                product.state,

            deliveryStates:
                product.deliveryStates || [],

            quantity:
                Number(quantity),

            maxStock:
                currentStock

        });

    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}



function formatState(value) {

    if (!value) return "";

    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}



function filterProducts() {

    const searchInput =
        document.getElementById(
            "search-input"
        );

    const stateFilter =
        document.getElementById(
            "state-filter"
        );

    if (!searchInput || !stateFilter) return;

    const search =
        searchInput.value.toLowerCase();

    const state =
        stateFilter.value;

    const filtered =
        allProducts.filter(product => {

            const matchesName =
                product.name
                    .toLowerCase()
                    .includes(search);

            const matchesState =
                state === "" ||
                product.state === state;

            return matchesName &&
                   matchesState;

        });

    displayProducts(filtered);

}



document.addEventListener(
    "DOMContentLoaded",
    () => {

        fetchProducts();

        const filterBtn =
            document.getElementById(
                "filter-btn"
            );

        if (filterBtn) {

            filterBtn.addEventListener(
                "click",
                filterProducts
            );

        }

        const searchInput =
            document.getElementById(
                "search-input"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "keyup",
                filterProducts
            );

        }

    }
);