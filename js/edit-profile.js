import { apiGet, apiPut } from "./api.js";

let currentUser = null;
let hasUnsavedChanges = false;
let selectedProfileImage = null;
let removeProfileImage = false;


// PAGE LOAD

document.addEventListener("DOMContentLoaded", async () => {

    const storedUser =
        JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
        window.location.href = "login.html";
        return;
    }

    try {

        // Get latest user from database
        currentUser =
            await apiGet("/users/" + storedUser.id);

        // Refresh localStorage
        localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
        );

        populateUserDetails(currentUser);

        loadProfilePicture();

        registerChangeListeners();

        setupProfilePicture();

        setupRemoveProfilePicture();

        setupCancelButton();

        setupSaveButton();

    }

    catch (error) {

        alert(error.message);

    }

});



function loadProfilePicture() {

    if (!currentUser) return;

    const savedImage =
        localStorage.getItem(
            `profileImage_${currentUser.id}`
        );

    const preview =
        document.getElementById("profile-preview");

    if (!preview) return;

    if (savedImage) {

        preview.src = savedImage;

    } else {

        preview.src =
            "images/default-avatar.png";

    }

}



function populateUserDetails(user) {

    document.getElementById("edit-fullName").value =
        user.fullName || "";

    document.getElementById("edit-email").value =
        user.email || "";

    document.getElementById("edit-phone").value =
        user.phoneNumber || "";

    document.getElementById("edit-state").value =
        user.state || "";

    document.getElementById("edit-businessName").value =
        user.businessName || "";

    document.getElementById("edit-bio").value =
        user.bio || "";

}




function setupProfilePicture() {

    const pictureInput =
        document.getElementById("profile-picture");

    const preview =
        document.getElementById("profile-preview");

    if (!pictureInput || !preview) return;


    pictureInput.addEventListener(
        "change",
        function () {

            const file =
                pictureInput.files[0];

            if (!file) return;


            // Make sure it is actually an image
            if (!file.type.startsWith("image/")) {

                alert("Please select an image file.");

                pictureInput.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload = function (event) {

                selectedProfileImage =
                    event.target.result;

                removeProfileImage = false;

                preview.src =
                    selectedProfileImage;

                hasUnsavedChanges = true;

            };


            reader.readAsDataURL(file);

        }
    );

}




function setupRemoveProfilePicture() {

    const removeButton =
        document.getElementById(
            "remove-profile-picture"
        );

    const preview =
        document.getElementById("profile-preview");

    const pictureInput =
        document.getElementById("profile-picture");


    if (!removeButton || !preview) return;


    removeButton.addEventListener(
        "click",
        () => {

            // Remove selected image
            selectedProfileImage = null;

            // Mark image for removal
            removeProfileImage = true;

            // Reset preview
            preview.src =
                "images/default-avatar.png";

            // Clear file input
            if (pictureInput) {
                pictureInput.value = "";
            }

            hasUnsavedChanges = true;

        }
    );

}



// DETECT UNSAVED CHANGES

function registerChangeListeners() {

    document
        .querySelectorAll(
            "input, textarea, select"
        )
        .forEach(field => {

            field.addEventListener(
                "input",
                () => {

                    hasUnsavedChanges = true;

                }
            );

            field.addEventListener(
                "change",
                () => {

                    hasUnsavedChanges = true;

                }
            );

        });

}



function setupCancelButton() {

    const cancelButton =
        document.getElementById(
            "cancel-profile-btn"
        );

    if (!cancelButton) return;


    cancelButton.addEventListener(
        "click",
        () => {

            if (!hasUnsavedChanges) {

                window.location.href =
                    "profile.html";

                return;

            }


            const discard =
                confirm(
                    "You have unsaved changes.\n\nDiscard them?"
                );


            if (discard) {

                window.location.href =
                    "profile.html";

            }

        }
    );

}



function setupSaveButton() {

    const saveButton =
        document.getElementById(
            "save-profile-btn"
        );

    if (!saveButton) return;


    saveButton.addEventListener(
        "click",
        saveProfile
    );

}




async function saveProfile() {

    try {

        const updatedUser = {

            fullName:
                document
                    .getElementById("edit-fullName")
                    .value
                    .trim(),

            phoneNumber:
                document
                    .getElementById("edit-phone")
                    .value
                    .trim(),

            state:
                document
                    .getElementById("edit-state")
                    .value
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "_"),

            businessName:
                document
                    .getElementById("edit-businessName")
                    .value
                    .trim(),

            bio:
                document
                    .getElementById("edit-bio")
                    .value
                    .trim(),

            bankName:
                document
                    .getElementById("edit-bankName")
                    ?.value
                    .trim() || "",

            accountNumber:
                document
                    .getElementById("edit-accountNumber")
                    ?.value
                    .trim() || "",

            accountName:
                document
                    .getElementById("edit-accountName")
                    ?.value
                    .trim() || ""

        };



        await apiPut(
            "/users/" + currentUser.id,
            updatedUser
        );


        const refreshedUser =
            await apiGet(
                "/users/" + currentUser.id
            );


        currentUser =
            refreshedUser;


        // UPDATE LOCAL STORAGE

        localStorage.setItem(
            "user",
            JSON.stringify(refreshedUser)
        );



        if (removeProfileImage) {

            localStorage.removeItem(
                `profileImage_${currentUser.id}`
            );

        }

        else if (selectedProfileImage) {

            localStorage.setItem(
                `profileImage_${currentUser.id}`,
                selectedProfileImage
            );

        }


        // RESET STATE

        hasUnsavedChanges = false;

        selectedProfileImage = null;

        removeProfileImage = false;


        alert(
            "Profile updated successfully!"
        );


        window.location.href =
            "profile.html";

    }

    catch (error) {

        console.error(
            "Profile update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update profile."
        );

    }

}