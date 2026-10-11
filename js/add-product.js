
import { apiPost, apiGet, apiPut } from "./api.js";

const user = JSON.parse(localStorage.getItem("user"));

const form = document.getElementById("add-product-form");
const imageInput = document.getElementById("product-image");
const previewImage = document.getElementById("preview-image");
const cancelButton = document.getElementById("cancel-btn");

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const isEditMode = !!productId;


// Change page title/button in Edit mode

if (isEditMode) {

    const heading = document.querySelector(".page-header h2");
    const description = document.querySelector(".page-header p");
    const submitButton = form.querySelector('button[type="submit"]');

    if (heading) {
        heading.textContent = "Edit Product";
    }

    if (description) {
        description.textContent =
            "Update your existing product listing.";
    }

    if (submitButton) {
        submitButton.textContent = "Update Product";
    }

}

// Image Preview

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;

    };

    reader.readAsDataURL(file);

});

async function loadProduct() {

    if (!isEditMode) return;

    try {

        const product = await apiGet(
            "/products/" + productId
        );

        // Basic fields
        document.getElementById("product-name").value =
            product.name || "";

        document.getElementById("description").value =
            product.description || "";

        document.getElementById("category").value =
            product.category || "";

        document.getElementById("unit").value =
            product.unit || "";

        document.getElementById("price").value =
            product.pricePerUnit || "";

        document.getElementById("stock").value =
            product.stockQuantity ?? "";

        document.getElementById("state").value =
            product.state || "";

        if (product.imageUrl) {
            previewImage.src = product.imageUrl;
        }

        if (
            product.deliveryStates &&
            product.deliveryStates.length > 0
        ) {

            document
                .querySelectorAll(
                    'input[name="deliveryStates"]'
                )
                .forEach(checkbox => {

                    checkbox.checked =
                        product.deliveryStates.includes(
                            checkbox.value
                        );

                });

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to load product.");

    }

}


function getSelectedDeliveryStates() {

    return Array.from(
        document.querySelectorAll(
            'input[name="deliveryStates"]:checked'
        )
    ).map(checkbox => checkbox.value);

}


form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const deliveryStates =
        getSelectedDeliveryStates();

    const product = {

        name:
            document
                .getElementById("product-name")
                .value
                .trim(),

        description:
            document
                .getElementById("description")
                .value
                .trim(),

        pricePerUnit:
            Number(
                document
                    .getElementById("price")
                    .value
            ),

        unit:
            document
                .getElementById("unit")
                .value,

        category:
            document
                .getElementById("category")
                .value,

        state:
            document
                .getElementById("state")
                .value,

        stockQuantity:
            Number(
                document
                    .getElementById("stock")
                    .value
            ),

        deliveryStates:
            deliveryStates

    };

    // ADD PRODUCT

    if (!isEditMode) {

        const formData = new FormData();

        formData.append(
            "product",
            new Blob(
                [JSON.stringify(product)],
                {
                    type: "application/json"
                }
            )
        );

        const imageFile = imageInput.files[0];

        if (imageFile) {

            formData.append(
                "image",
                imageFile
            );

        }

        try {

            await apiPost(
                "/products/create/" + user.id,
                formData
            );

            alert("Product added successfully!");

            window.location.href =
                "seller-products.html";

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

    }

   
    // EDIT PRODUCT

    else {

        try {

            await apiPut(
                "/products/" + productId,
                product
            );

            alert("Product updated successfully!");

            window.location.href =
                "seller-products.html";

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

    }

});


cancelButton.addEventListener("click", () => {

    window.location.href =
        "seller-products.html";

});

// Initialise

loadProduct();