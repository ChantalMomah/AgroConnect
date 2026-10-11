import { apiGet } from "./api.js";


// Elements

const searchInput =
    document.getElementById("user-search-input");

const resultsContainer =
    document.getElementById("user-search-results");




async function searchUsers(query) {

    if (!query || query.trim().length < 2) {

        resultsContainer.style.display = "none";

        resultsContainer.innerHTML = "";

        return;
    }


    try {

        const results =
            await apiGet(
                "/users/search?query=" +
                encodeURIComponent(query.trim())
            );


        displaySearchResults(results);

    }

    catch (error) {

        console.error(
            "User search failed:",
            error
        );

        resultsContainer.innerHTML = `
            <div class="search-error">
                Unable to search users.
            </div>
        `;

        resultsContainer.style.display = "block";

    }

}




function displaySearchResults(users) {

    if (!users || users.length === 0) {

        resultsContainer.innerHTML = `
            <div class="no-search-results">
                No users found.
            </div>
        `;

        resultsContainer.style.display =
            "block";

        return;
    }


    resultsContainer.innerHTML =
        users.map(user => {

            const name =
                user.fullName ||
                "Unknown User";

            const initial =
                name.charAt(0).toUpperCase();


            const role =
                formatRole(user.role);


            const location =
                user.state
                    ? formatState(user.state)
                    : "";


            return `

                <div
                    class="user-search-result"
                    data-user-id="${user.id}">

                    <div class="user-search-avatar">

                        ${initial}

                    </div>


                    <div class="user-search-info">

                        <h4>
                            ${name}
                        </h4>

                        ${
                            user.businessName
                                ? `
                                    <p>
                                        ${user.businessName}
                                    </p>
                                  `
                                : ""
                        }

                        <span>
                            ${role}
                            ${
                                location
                                    ? " • " + location
                                    : ""
                            }
                        </span>

                    </div>

                </div>

            `;

        }).join("");


    resultsContainer.style.display =
        "block";


    attachResultListeners();

}



// Result Click

function attachResultListeners() {

    document
        .querySelectorAll(".user-search-result")
        .forEach(result => {

            result.addEventListener(
                "click",
                () => {

                    const userId =
                        result.dataset.userId;


                    if (!userId) return;



                    window.location.href =
                        "profile.html?id=" +
                        userId;

                }
            );

        });

}




function formatRole(role) {

    if (!role) return "";

    return role
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}




function formatState(state) {

    if (!state) return "";

    return state
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


// Search Input

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            searchUsers(
                searchInput.value
            );

        }
    );

}



// Close Results When Clicking Outside

document.addEventListener(
    "click",
    event => {

        if (
    !event.target.closest(
        ".dashboard-user-search"
    )
) {

            resultsContainer.style.display =
                "none";

        }

    }
);