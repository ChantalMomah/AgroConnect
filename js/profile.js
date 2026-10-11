import { apiGet } from "./api.js";

import {
    logout,
    setupOrdersLink,
    setupProductsLink,
    setupDashboardLink,
    requireAuth
} from "./auth.js";


// DETERMINE WHICH PROFILE IS BEING VIEWED
const loggedInUser = JSON.parse(localStorage.getItem("user"));

const urlParams =
    new URLSearchParams(window.location.search);

const profileId =
    urlParams.get("id");

let profileUser = null;

let isOwnProfile = true;



async function loadProfileUser() {

    if (!loggedInUser) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    // Own profile
    if (!profileId) {

        profileUser = loggedInUser;
        isOwnProfile = true;

        return;
    }

    // Public profile
    try {

        profileUser =
            await apiGet("/users/" + profileId);

        isOwnProfile =
            Number(profileUser.id) ===
            Number(loggedInUser.id);

    }

    catch (error) {

        console.error(
            "Failed to load profile:",
            error
        );

        alert("Unable to load this profile.");

        window.location.href =
            "dashboard.html";
    }
}



function formatState(state) {

    if (!state) return "";

    const states = {

        AKWA_IBOM: "Akwa Ibom State",
        BAYELSA: "Bayelsa State",
        CROSS_RIVER: "Cross River State",
        DELTA: "Delta State",
        EDO: "Edo State",
        RIVERS: "Rivers State"

    };

    return states[state] || state;

}



function formatRole(role) {

    if (!role) return "";

    return role
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter => letter.toUpperCase()
        );

}




function loadUserInformation() {

    if (!profileUser) return;

    document.getElementById("display-name").textContent =
        profileUser.fullName || "";

    document.getElementById("display-fullName").textContent =
        profileUser.fullName || "--";

    document.getElementById("display-email").textContent =
        profileUser.email || "--";

    document.getElementById("display-phone").textContent =
        profileUser.phoneNumber || "--";


    // Business name
    const businessNameElement =
        document.getElementById("display-businessName");

    if (
        profileUser.businessName &&
        profileUser.businessName.trim() !== ""
    ) {

        businessNameElement.textContent =
            profileUser.businessName;

        businessNameElement.style.display =
            "block";

    } else {

        businessNameElement.style.display =
            "none";

    }


    document.getElementById("display-bio").textContent =
        profileUser.bio || "--";


    document.getElementById("display-role2").textContent =
        formatRole(profileUser.role) || "--";

    document.getElementById("display-role").textContent =
        formatRole(profileUser.role) || "";


    document.getElementById("display-state2").textContent =
        formatState(profileUser.state) || "--";

    document.getElementById("display-state").textContent =
        formatState(profileUser.state) || "";


    document.getElementById("display-userId").textContent =
        profileUser.id || "--";


    if (profileUser.createdAt) {

        const joined =
            new Date(profileUser.createdAt);

        document.getElementById("display-createdAt").textContent =
            joined.toLocaleDateString();

    }
}



function setupProfileVisibility() {

    const editButton =
        document.getElementById("edit-btn");


    const quickActions =
    document.getElementById("my-shortcuts-section");


    const publicUpdates =
        document.getElementById(
            "public-updates"
        );


  
    // OTHER USER'S PROFILE

    if (!isOwnProfile) {

    

        if (editButton) {

            editButton.style.display =
                "none";

        }


        // Hide My Shortcuts

        if (quickActions) {

            quickActions.style.display =
                "none";

        }


        // Show public content only

        if (
            profileUser.role === "FARMER" ||
            profileUser.role === "INPUT_SELLER"
        ) {

            if (publicUpdates) {

                publicUpdates.style.display =
                    "block";

            }

            showPublicProducts();
            showPublicUpdates();

        }

        else {

            

            if (publicUpdates) {

                publicUpdates.style.display =
                    "none";

            }

            hidePublicProducts();

        }

    }


  
    // OWN PROFILE

    else {

        if (editButton) {

            editButton.style.display =
                "block";

        }


        if (quickActions) {

            quickActions.style.display =
                "block";

        }

    }

}



function showPublicProducts() {

    const productsSection =
        document.getElementById(
            "public-products"
        );

    if (!productsSection) return;

    productsSection.style.display =
        "block";


    const button =
        document.getElementById(
            "public-products-btn"
        );


    if (button) {

        button.onclick = () => {

            window.location.href =
                "seller-products.html?userId=" +
                profileUser.id;

        };

    }

}



function hidePublicProducts() {

    const productsSection =
        document.getElementById(
            "public-products"
        );

    if (productsSection) {

        productsSection.style.display =
            "none";

    }

}



function showPublicUpdates() {

    const button =
        document.querySelector(
            "#public-updates .show-more-btn"
        );


    if (!button) return;


    button.onclick = () => {

        window.location.href =
            "updates.html?userId=" +
            profileUser.id;

    };

}




function setupProfilePicture() {

    const image =
        document.getElementById(
            "profile-image"
        );

    const upload =
        document.getElementById(
            "profile-upload"
        );

    const changePhotoButton =
        document.getElementById(
            "change-photo-btn"
        );


    if (!image) return;


    

    const savedImage =
        localStorage.getItem(
            `profileImage_${profileUser.id}`
        );


    if (savedImage) {

        image.src = savedImage;

    }


    if (!isOwnProfile) {

        if (upload) {

            upload.style.display =
                "none";

        }

        if (changePhotoButton) {

            changePhotoButton.style.display =
                "none";

        }

        return;

    }


    if (changePhotoButton) {

        changePhotoButton.addEventListener(
            "click",
            () => {

                upload.click();

            }
        );

    }


    image.addEventListener(
        "click",
        () => {

            upload.click();

        }
    );


    upload.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) return;


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    image.src =
                        event.target.result;


                    localStorage.setItem(
                        `profileImage_${profileUser.id}`,
                        event.target.result
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}




async function loadFarmerProfile() {

    if (!profileUser) return;

    if (profileUser.role !== "FARMER") return;


    try {

        const profile =
            await apiGet(
                "/farmers/profile/" +
                profileUser.id
            );


        const section =
            document.getElementById(
                "farmer-section"
            );


        if (section) {

            section.style.display =
                "block";

        }


        document.getElementById(
            "display-farmSize"
        ).textContent =
            profile.farmSize || "--";


        document.getElementById(
            "display-primaryCrops"
        ).textContent =
            profile.primaryCrops || "--";

    }

    catch (error) {

        console.log(
            "No farmer profile found."
        );

    }

}




async function loadSellerProfile() {

    if (!profileUser) return;

    if (profileUser.role !== "INPUT_SELLER") return;


    try {

        const profile =
            await apiGet(
                "/input-sellers/profile/" +
                profileUser.id
            );


        const section =
            document.getElementById(
                "seller-section"
            );


        if (section) {

            section.style.display =
                "block";

        }


        document.getElementById(
            "display-businessDescription"
        ).textContent =
            profile.businessDescription || "--";


        document.getElementById(
            "display-specialization"
        ).textContent =
            profile.specialization || "--";


        document.getElementById(
            "display-operatingStates"
        ).textContent =
            profile.operatingStates || "--";

    }

    catch (error) {

        console.log(
            "No seller profile found."
        );

    }

}




function setupEditProfile() {

    const editButton =
        document.getElementById(
            "edit-btn"
        );


    if (!editButton) return;


   

    if (!isOwnProfile) {

        editButton.style.display =
            "none";

        return;

    }


    editButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "edit-profile.html";

        }
    );

}




function setupQuickActions() {

    const productsButton =
        document.getElementById("view-products-btn");

    const ordersButton =
        document.getElementById("view-orders-btn");

    const updatesButton =
        document.getElementById("updates-btn");

    const logoutButton =
        document.getElementById("logout-btn");


   
    // OWN PROFILE

    if (isOwnProfile) {

        if (productsButton) {

            productsButton.addEventListener(
                "click",
                () => {

                    if (loggedInUser.role === "BUYER") {

                        window.location.href =
                            "buyer-products.html";

                    }

                    else if (
                        loggedInUser.role === "FARMER" ||
                        loggedInUser.role === "INPUT_SELLER"
                    ) {

                        window.location.href =
                            "seller-products.html";

                    }

                    else if (loggedInUser.role === "ADMIN") {

                        window.location.href =
                            "admin-dashboard.html#products";

                    }

                }
            );

        }


        
        if (ordersButton) {

            ordersButton.addEventListener(
                "click",
                () => {

                    if (loggedInUser.role === "BUYER") {

                        window.location.href =
                            "buyer-orders.html";

                    }

                    else if (
                        loggedInUser.role === "FARMER" ||
                        loggedInUser.role === "INPUT_SELLER"
                    ) {

                        window.location.href =
                            "seller-orders.html";

                    }

                    else if (loggedInUser.role === "ADMIN") {

                        window.location.href =
                            "admin-dashboard.html#orders";

                    }

                }
            );

        }



        if (updatesButton) {

            if (
                loggedInUser.role === "FARMER" ||
                loggedInUser.role === "INPUT_SELLER"
            ) {

                updatesButton.style.display =
                    "block";

                updatesButton.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            "updates.html";

                    }
                );

            }

            else {

                updatesButton.style.display =
                    "none";

            }

        }


       
        if (logoutButton) {

            logoutButton.style.display =
                "block";

            logoutButton.addEventListener(
                "click",
                logout
            );

        }

        return;
    }


    
    // SOMEONE ELSE'S PROFILE

    // Remove My Orders
    if (ordersButton) {

        ordersButton.style.display =
            "none";

    }


    // Remove Logout
    if (logoutButton) {

        logoutButton.style.display =
            "none";

    }


    // Farmer / Input Seller
    if (
        profileUser.role === "FARMER" ||
        profileUser.role === "INPUT_SELLER"
    ) {

        // Products
        if (productsButton) {

            productsButton.innerHTML = `
                <i class="fa-solid fa-box"></i>
                Products
            `;

            productsButton.style.display =
                "block";

            productsButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "seller-products.html?userId=" +
                        profileUser.id;

                }
            );

        }


        // Updates
        if (updatesButton) {

            updatesButton.innerHTML = `
                <i class="fa-solid fa-bullhorn"></i>
                Updates
            `;

            updatesButton.style.display =
                "block";

            updatesButton.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "updates.html?userId=" +
                        profileUser.id;

                }
            );

        }

    }

    // Buyer
    else {

        if (productsButton) {

            productsButton.style.display =
                "none";

        }

        if (updatesButton) {

            updatesButton.style.display =
                "none";

        }

    }

}



async function loadStatistics() {

    if (!profileUser) return;


    try {

       

        const products =
            await apiGet("/products");


        const userProducts =
            products.filter(product => {

                const productUserId =
                    product.userId ||
                    product.user?.id ||
                    product.seller?.id;


                return (
                    Number(productUserId) ===
                    Number(profileUser.id)
                );

            });


        document.getElementById(
            "products-count"
        ).textContent =
            userProducts.length;


        
        // ORDERS

        if (
            profileUser.role === "FARMER" ||
            profileUser.role === "INPUT_SELLER"
        ) {

            const completedOrders =
                await apiGet(
                    "/orders/seller/" +
                    profileUser.id +
                    "/completed-count"
                );


            document.getElementById(
                "orders-count"
            ).textContent =
                completedOrders;

        }

        else {

            const orders =
                await apiGet(
                    "/orders/user/" +
                    profileUser.id
                );


            const completedOrders =
                orders.filter(
                    order =>
                        order.status ===
                        "COMPLETED"
                );


            document.getElementById(
                "orders-count"
            ).textContent =
                completedOrders.length;

        }


        
        // UPDATES

        if (
            profileUser.role === "FARMER" ||
            profileUser.role === "INPUT_SELLER"
        ) {

            const updates =
                await apiGet(
                    "/updates/user/" +
                    profileUser.id
                );


            document.getElementById(
                "posts-count"
            ).textContent =
                updates.length;

        }

        else {

            document.getElementById(
                "posts-count"
            ).textContent =
                "0";

        }

    }

    catch (error) {

        console.error(
            "Failed to load profile statistics:",
            error
        );

    }

}




function setupCancelButtons() {

    document
        .querySelectorAll(".cancel-btn")
        .forEach(button => {

            button.onclick = () => {

                const farmerEdit =
                    document.getElementById(
                        "edit-farmer"
                    );

                const sellerEdit =
                    document.getElementById(
                        "edit-seller"
                    );


                if (farmerEdit) {

                    farmerEdit.style.display =
                        "none";

                }


                if (sellerEdit) {

                    sellerEdit.style.display =
                        "none";

                }

            };

        });

}



// INITIALIZE

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        requireAuth();


        await loadProfileUser();


        if (!profileUser) return;


       

        setupOrdersLink();
        setupProductsLink();
        setupDashboardLink();

        loadUserInformation();

        setupProfileVisibility();

        setupQuickActions();

        setupProfilePicture();

        setupEditProfile();

        setupCancelButtons();

        loadFarmerProfile();

        loadSellerProfile();

        loadStatistics();

    }
);

const backBtn = document.getElementById("back-btn");

if(backBtn){

    backBtn.addEventListener("click",()=>{

        if(new URLSearchParams(window.location.search).get("id")){

            window.location.href="buyer-products.html";

        }else{

            history.back();

        }

    });

}