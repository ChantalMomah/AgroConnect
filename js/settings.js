import { apiGet, apiPut, apiPost, apiDelete } from "./api.js";
import { requireAuth, logout } from "./auth.js";


// PAGE LOAD

document.addEventListener("DOMContentLoaded", async () => {

    if (!requireAuth()) {
        return;
    }


    setupPasswordToggles();

    await loadSettings();

    setupEventListeners();

});



async function loadSettings() {

    const storedUser =
        JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
        window.location.href = "login.html";
        return;
    }

    try {

        const user =
            await apiGet(
                "/users/" + storedUser.id
            );


        // Refresh localStorage

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );



        const paymentSection =
            document.getElementById(
                "payment-information-section"
            );

        const isSeller =
            user.role === "FARMER" ||
            user.role === "INPUT_SELLER";


        if (isSeller) {


            if (paymentSection) {
                paymentSection.style.display = "block";
            }


            const bankName =
                document.getElementById("bank-name");

            const accountNumber =
                document.getElementById("account-number");

            const accountName =
                document.getElementById("account-name");


            if (bankName) {
                bankName.value =
                    user.bankName || "";
            }

            if (accountNumber) {
                accountNumber.value =
                    user.accountNumber || "";
            }

            if (accountName) {
                accountName.value =
                    user.accountName || "";
            }

        }

        else {


            if (paymentSection) {
                paymentSection.style.display = "none";
            }

        }


      
        // PASSWORD FIELDS

        const oldPassword =
            document.getElementById("current-password");

        const newPassword =
            document.getElementById("new-password");

        const confirmPassword =
            document.getElementById("confirm-password");


        if (oldPassword) {
            oldPassword.value = "";
        }

        if (newPassword) {
            newPassword.value = "";
        }

        if (confirmPassword) {
            confirmPassword.value = "";
        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to load your settings."
        );

    }

}



function setupEventListeners() {


    // Payment

    document
        .getElementById("save-payment-btn")
        ?.addEventListener(
            "click",
            savePaymentInformation
        );


    // Password

    document
        .getElementById("change-password-btn")
        ?.addEventListener(
            "click",
            changePassword
        );


    // Notifications

    document
        .getElementById("save-notifications-btn")
        ?.addEventListener(
            "click",
            saveNotifications
        );


    // Complaint / Suggestion

    document
        .getElementById("submit-feedback-btn")
        ?.addEventListener(
            "click",
            submitFeedback
        );


    // Logout all devices

    document
        .getElementById("logout-all-btn")
        ?.addEventListener(
            "click",
            logoutAllDevices
        );


    // Delete account

    document
        .getElementById("delete-account-btn")
        ?.addEventListener(
            "click",
            deleteAccount
        );

}




function setupPasswordToggles() {

    const buttons =
        document.querySelectorAll(
            ".password-toggle"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(
                        targetId
                    );

                if (!input) return;


                const icon =
                    button.querySelector("i");


                if (input.type === "password") {

                    input.type = "text";

                    icon.classList.remove(
                        "fa-eye"
                    );

                    icon.classList.add(
                        "fa-eye-slash"
                    );

                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                }

                else {

                    input.type = "password";

                    icon.classList.remove(
                        "fa-eye-slash"
                    );

                    icon.classList.add(
                        "fa-eye"
                    );

                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                }

            }
        );

    });

}




async function savePaymentInformation() {

    const storedUser =
        JSON.parse(localStorage.getItem("user"));

    if (!storedUser) return;


    // Sellers only

    if (
        storedUser.role !== "FARMER" &&
        storedUser.role !== "INPUT_SELLER"
    ) {
        alert(
            "Only sellers can save payment information."
        );

        return;
    }


    const bankName =
        document
            .getElementById("bank-name")
            .value
            .trim();

    const accountNumber =
        document
            .getElementById("account-number")
            .value
            .trim();

    const accountName =
        document
            .getElementById("account-name")
            .value
            .trim();

    if (!bankName ||
        !accountNumber ||
        !accountName) {

        alert(
            "Please fill in all payment information."
        );

        return;
    }


    if (!/^\d{10}$/.test(accountNumber)) {

        alert(
            "Account number must contain exactly 10 digits."
        );

        return;
    }


    try {

        await apiPut(
            "/users/" + storedUser.id,
            {
                bankName: bankName,
                accountNumber: accountNumber,
                accountName: accountName
            }
        );


        const refreshedUser =
            await apiGet(
                "/users/" + storedUser.id
            );


        localStorage.setItem(
            "user",
            JSON.stringify(refreshedUser)
        );


        alert(
            "Payment information updated successfully."
        );

    }

    catch (error) {

        alert(
            error.message
        );

    }

}




async function changePassword() {

    const storedUser =
        JSON.parse(localStorage.getItem("user"));

    if (!storedUser) return;


    const currentPassword =
        document
            .getElementById("current-password")
            .value;

    const newPassword =
        document
            .getElementById("new-password")
            .value;

    const confirmPassword =
        document
            .getElementById("confirm-password")
            .value;



    // VALIDATION

    if (!currentPassword ||
        !newPassword ||
        !confirmPassword) {

        alert(
            "Please fill in all password fields."
        );

        return;
    }


    if (newPassword !== confirmPassword) {

        alert(
            "New passwords do not match."
        );

        return;
    }


    if (newPassword.length < 6) {

        alert(
            "New password must be at least 6 characters long."
        );

        return;
    }


    if (currentPassword === newPassword) {

        alert(
            "Your new password must be different from your old password."
        );

        return;
    }


    try {

        await apiPut(
            "/users/" +
            storedUser.id +
            "/password",

            {
                currentPassword:
                    currentPassword,

                newPassword:
                    newPassword,

                confirmPassword:
                    confirmPassword
            }
        );


        
        // CLEAR PASSWORD FIELDS

        document
            .getElementById("current-password")
            .value = "";

        document
            .getElementById("new-password")
            .value = "";

        document
            .getElementById("confirm-password")
            .value = "";


        alert(
            "Password changed successfully."
        );

    }

    catch (error) {

        console.error(
            "Password change error:",
            error
        );

        alert(
            error.message ||
            "Unable to change password."
        );

    }

}



async function saveNotifications() {

   

    alert(
        "Notification preferences saved."
    );

}




async function submitFeedback() {

    const storedUser =
        JSON.parse(localStorage.getItem("user"));

    if (!storedUser) return;


    const type =
        document
            .getElementById("feedback-type")
            .value;


    const message =
        document
            .getElementById("feedback-message")
            .value
            .trim();


    if (!message) {

        alert(
            "Please enter your complaint or suggestion."
        );

        return;
    }


    try {

        await apiPost(
            "/complaints/user/" +
            storedUser.id,

            {
                type: type,
                message: message
            }
        );


        document
            .getElementById("feedback-message")
            .value = "";


        alert(
            "Thank you. Your feedback has been submitted."
        );

    }

    catch (error) {

        alert(
            error.message
        );

    }

}




async function logoutAllDevices() {


    alert(
        "Logout from all devices will be connected when the security system is implemented."
    );

}



async function deleteAccount() {

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete your AgroConnect account?"
        );


    if (!confirmed) return;


    const storedUser =
        JSON.parse(localStorage.getItem("user"));

    if (!storedUser) return;


    try {

        await apiDelete(
            "/users/" + storedUser.id
        );


        alert(
            "Account deleted successfully."
        );


        logout();

    }

    catch (error) {

        console.error(
            "Account deletion error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete your account."
        );

    }

}