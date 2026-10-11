// auth.js 

import { apiPost } from "./api.js";

const AUTH_ENDPOINT = "/auth";

//Register
export async function register(userData) {
  try {
    const result = await apiPost(AUTH_ENDPOINT + "/register", userData);
    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
    return result;
  } catch (error) {
    alert("Registration failed: " + error.message);
  }
}

//Login 
export async function login(email, password) {
  try {
    const result = await apiPost(AUTH_ENDPOINT + "/login", {
      email: email,
      password: password,
    });

    localStorage.setItem("token", result.token);

    if (result.user) {
    localStorage.setItem("user", JSON.stringify(result.user));
    }

alert("Login successful!");

if (result.user.role === "ADMIN") {

    window.location.href = "admin-dashboard.html";

} else if (result.user.role === "BUYER") {

    window.location.href = "buyer-dashboard.html";

} else if (
    result.user.role === "FARMER" ||
    result.user.role === "INPUT_SELLER"
) {

    window.location.href = "dashboard.html";

} else {

    window.location.href = "login.html";

}
    return result;
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

//Logout
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Logged out successfully.");
  window.location.href = "login.html";
}

// ---------- Check if user is logged in ----------
export function isLoggedIn() {
  const token = localStorage.getItem("token");
  return token !== null && token !== "";
}

// ---------- Get current user data ----------
export function getCurrentUser() {
  const userData = localStorage.getItem("user");
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
}

// ---------- Protect pages: redirect if not logged in ----------
export function requireAuth() {
  if (!isLoggedIn()) {
    alert("Please log in to access this page.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// ---------- Protect pages by user role ----------
export function requireRole(allowedRoles) {

    if (!requireAuth()) {
        return false;
    }

    const user = getCurrentUser();

    if (!user || !allowedRoles.includes(user.role)) {

        alert("You do not have permission to access this page.");

        // Send the user to their correct dashboard
        if (user?.role === "BUYER") {

            window.location.href = "buyer-dashboard.html";

        } else if (
            user?.role === "FARMER" ||
            user?.role === "INPUT_SELLER"
        ) {

            window.location.href = "dashboard.html";

        } else if (user?.role === "ADMIN") {

            window.location.href = "admin-dashboard.html";

        } else {

            window.location.href = "login.html";

        }

        return false;
    }

    return true;
}

// ---------- Handle login form submission ----------
export async function handleLoginFormSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  await login(email, password);
}

// ---------- Handle registration form submission ----------
export async function handleRegisterFormSubmit(event) {

    event.preventDefault();


    const fullName =
        document.getElementById("register-name").value.trim();

    const email =
        document.getElementById("register-email").value.trim();

    const password =
        document.getElementById("register-password").value;

    const confirmPassword =
        document.getElementById("register-confirm-password").value;

    const role =
        document.getElementById("register-role").value;

    const state =
        document.getElementById("register-state").value;

    const businessName =
        document.getElementById("register-business-name").value.trim();

    const phoneNumber =
        document.getElementById("register-phone").value.trim();


    // ==========================================
    // CONFIRM PASSWORD
    // ==========================================

    if (password !== confirmPassword) {

        alert("Passwords do not match.");

        return;
    }


    // ==========================================
    // BUSINESS NAME
    // FARMER AND INPUT SELLER ONLY
    // ==========================================

    if (
        (role === "FARMER" ||
         role === "INPUT_SELLER") &&
        !businessName
    ) {

        alert(
            "Business name is required for farmers and input sellers."
        );

        return;
    }


    // ==========================================
    // CREATE USER DATA
    // ==========================================

    const userData = {

        fullName: fullName,

        email: email,

        password: password,

        role: role,

        state: state,

        businessName: businessName,

        phoneNumber: phoneNumber

    };


    console.log(userData);


    await register(userData);

}

// ---------- Initialize page ----------
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // LOGIN FORM
    // ==========================================

    const loginForm =
        document.getElementById("login-form");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLoginFormSubmit
        );

    }


    // ==========================================
    // REGISTRATION FORM
    // ==========================================

    const registerForm =
        document.getElementById("register-form");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            handleRegisterFormSubmit
        );

    }


    // ==========================================
    // BUSINESS NAME - ROLE CHANGE
    // ==========================================

    const registerRole =
        document.getElementById("register-role");

    const businessName =
        document.getElementById("register-business-name");

    const businessNameLabel =
        document.getElementById("business-name-label");


    if (
        registerRole &&
        businessName &&
        businessNameLabel
    ) {

        registerRole.addEventListener(
            "change",
            function () {

                const role =
                    registerRole.value;


                // ==================================
                // FARMER / INPUT SELLER
                // ==================================

                if (
                    role === "FARMER" ||
                    role === "INPUT_SELLER"
                ) {

                    businessName.required = true;

                    businessNameLabel.textContent =
                        "Business Name *";

                    businessName.placeholder =
                        role === "FARMER"
                            ? "Enter your farm or business name"
                            : "Enter your business name";

                }


                // ==================================
                // BUYER
                // ==================================

                else if (role === "BUYER") {

                    businessName.required = false;

                    businessNameLabel.textContent =
                        "Business Name (Optional)";

                    businessName.placeholder =
                        "Business or Company Name (Optional)";

                }


                // ==================================
                // NO ROLE SELECTED
                // ==================================

                else {

                    businessName.required = false;

                    businessNameLabel.textContent =
                        "Business Name (Optional)";

                    businessName.placeholder =
                        "Business or Farm Name";

                }

            }
        );

    }

});

// ==========================================
// REGISTRATION IMAGE SLIDER
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const slides =
        document.querySelectorAll(".register-slide");

    const dots =
        document.querySelectorAll(".slider-dot");

    if (slides.length === 0) return;


    let currentSlide = 0;


    function showSlide(index) {

        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        dots.forEach(dot => {
            dot.classList.remove("active");
        });


        slides[index].classList.add("active");

        if (dots[index]) {
            dots[index].classList.add("active");
        }

        currentSlide = index;
    }


    function nextSlide() {

        currentSlide =
            (currentSlide + 1) % slides.length;

        showSlide(currentSlide);
    }


    // Automatic sliding
    setInterval(nextSlide, 4000);


    // Allow users to click dots
    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {
            showSlide(index);
        });

    });

});

export function setupOrdersLink() {

    const ordersLinks = document.querySelectorAll(".ordersLink");

    if (ordersLinks.length === 0) return;

    const user = JSON.parse(localStorage.getItem("user"));

    let destination = "login.html";

    if (user) {
        if (user.role === "BUYER") {
            destination = "buyer-orders.html";
        } else if (
            user.role === "FARMER" ||
            user.role === "INPUT_SELLER"
        ) {
            destination = "seller-orders.html";
        } else if (user.role === "ADMIN") {
            destination = "admin-dashboard.html#orders";
        } else {
            destination = "dashboard.html";
        }
    }

    ordersLinks.forEach(link => {
        link.href = destination;
    });
}

export function setupProductsLink() {

    const productsLinks = document.querySelectorAll(".productsLink");

    if (productsLinks.length === 0) return;

    const user = JSON.parse(localStorage.getItem("user"));

    let destination = "login.html";

    if (user) {

        if (user.role === "BUYER") {
            destination = "buyer-products.html";
        } else if (
            user.role === "FARMER" ||
            user.role === "INPUT_SELLER"
        ) {
            destination = "seller-products.html";
        } else if (user.role === "ADMIN") {
            destination = "admin-dashboard.html#products";
        } else {
            destination = "dashboard.html";
        }

    }

    productsLinks.forEach(link => {
        link.href = destination;
    });

}
export function setupDashboardLink() {

    const dashboardLinks = document.querySelectorAll(".dashboardLink");

    if (dashboardLinks.length === 0) return;

    const user = JSON.parse(localStorage.getItem("user"));

    let destination = "login.html";

    if (user) {

        if (user.role === "BUYER") {
            destination = "buyer-dashboard.html";
        } else if (
            user.role === "FARMER" ||
            user.role === "INPUT_SELLER"
        ) {
            destination = "dashboard.html";
        } else if (user.role === "ADMIN") {
            destination = "admin-dashboard.html";
        }

    }

    dashboardLinks.forEach(link => {
        link.href = destination;
    });

}