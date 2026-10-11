import { apiGet, apiDelete, apiPut } from "./api.js";
import { requireAuth } from "./auth.js";

//AUTHENTICATION

if (!requireAuth()) {
    throw new Error("User not authenticated.");
}

const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "ADMIN") {
    alert("Access denied.");
    window.location.href = "dashboard.html";
    throw new Error("Unauthorized");
}

 //PAGE INITIALIZATION

document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    initializeNavigation();
    initializeLogout();
    loadDashboard();
});


function initializeLogout() {

    const logoutBtn =
        document.getElementById("logout-btn");

    if (!logoutBtn) {
        return;
    }

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "login.html";

    });

}



async function loadDashboard() {

    try {

        const data = await apiGet("/admin/dashboard");


        setText("totalUsers", data.totalUsers ?? 0);
        setText("totalFarmers", data.totalFarmers ?? 0);
        setText("totalBuyers", data.totalBuyers ?? 0);
        setText("totalInputSellers", data.totalInputSellers ?? 0);
        setText("totalProducts", data.totalProducts ?? 0);
        setText("totalOrders", data.totalOrders ?? 0);

  

        loadRecentUsers(data.recentUsers);


       

        await Promise.all([
            loadUsers(),
            loadProducts(),
            loadOrders(),
            loadComplaints()
        ]);

    } catch (error) {

        console.error("Dashboard loading error:", error);

        alert("Unable to load dashboard.");

    }

}


function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function loadRecentUsers(users) {

    const tbody =
        document.getElementById("recentUsersBody");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    if (!users || users.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No users found.
                </td>
            </tr>
        `;

        return;
    }


    users.forEach(currentUser => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHtml(currentUser.fullName)}
            </td>

            <td>
                ${escapeHtml(currentUser.email)}
            </td>

            <td>
                <span class="role-badge">
                    ${formatRole(currentUser.role)}
                </span>
            </td>

            <td>
                ${escapeHtml(currentUser.state ?? "-")}
            </td>
        `;

        tbody.appendChild(row);

    });

}


async function loadUsers() {

    try {

        const users =
            await apiGet("/admin/users");

        const table =
            document.getElementById("usersTable");

        if (!table) {
            return;
        }

        table.innerHTML = "";


        if (!users || users.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        No users found.
                    </td>
                </tr>
            `;

            return;
        }


        users.forEach(currentUser => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${escapeHtml(currentUser.fullName)}
                </td>

                <td>
                    ${escapeHtml(currentUser.email)}
                </td>

                <td>
                    <span class="role-badge">
                        ${formatRole(currentUser.role)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(currentUser.state ?? "-")}
                </td>

                <td>
                    <button
                        class="delete-btn"
                        type="button"
                        onclick="deleteUser(${currentUser.id})">
                        🗑️ Delete
                    </button>
                </td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Unable to load users:",
            error
        );

        showTableError(
            "usersTable",
            5,
            "Unable to load users."
        );

    }

}



async function loadProducts() {

    try {

        const products =
            await apiGet("/admin/products");

        const table =
            document.getElementById("productsTable");

        if (!table) {
            return;
        }

        table.innerHTML = "";


        if (!products || products.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }


        products.forEach(product => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${escapeHtml(product.name)}
                </td>

                <td>
                    ${escapeHtml(
                        product.seller?.fullName ?? "Unknown"
                    )}
                </td>

                <td>
                    ₦${formatNumber(product.pricePerUnit)}
                </td>

                <td>
                    <button
                        class="delete-btn"
                        type="button"
                        onclick="deleteProduct(${product.id})">
                        🗑️ Delete
                    </button>
                </td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Unable to load products:",
            error
        );

        showTableError(
            "productsTable",
            4,
            "Unable to load products."
        );

    }

}


async function loadOrders() {

    try {

        const orders =
            await apiGet("/admin/orders");

        const table =
            document.getElementById("ordersTable");

        if (!table) {
            return;
        }

        table.innerHTML = "";


        if (!orders || orders.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }


        orders.forEach(order => {

            const status =
                order.status ?? "PENDING";

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${escapeHtml(
                        order.buyer?.fullName ?? "Unknown"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        order.product?.name ?? "Deleted Product"
                    )}
                </td>

                <td>
                    ${order.quantity ?? 0}
                </td>

                <td>
                    <span class="order-status ${status.toLowerCase()}">
                        ${formatStatus(status)}
                    </span>
                </td>

                <td>
                    <button
                        class="delete-btn"
                        type="button"
                        onclick="deleteOrder(${order.id})">
                        🗑️ Delete
                    </button>
                </td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Unable to load orders:",
            error
        );

        showTableError(
            "ordersTable",
            5,
            "Unable to load orders."
        );

    }

}


async function loadComplaints() {

    const complaintsTable =
        document.getElementById("complaintsTable");

    if (!complaintsTable) {
        return;
    }

    try {

        const feedback =
            await apiGet("/admin/complaints");



const complaints =
    feedback.filter(
        item => item.type === "COMPLAINT"
    );

const suggestions =
    feedback.filter(
        item => item.type === "SUGGESTION"
    );

setText(
    "totalComplaints",
    complaints.length
);

setText(
    "totalSuggestions",
    suggestions.length
);



        complaintsTable.innerHTML = "";


        if (!feedback || feedback.length === 0) {

            complaintsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No complaints or suggestions yet.
                    </td>
                </tr>
            `;

            return;
        }


        feedback.forEach(item => {

            const row =
                document.createElement("tr");

            const userName =
                item.userName ?? "Unknown";

            const status =
                item.status ?? "PENDING";

            row.innerHTML = `
                <td>
                    ${escapeHtml(userName)}
                </td>

                <td>
                    ${formatStatus(item.type)}
                </td>

                <td class="complaint-message">
                    ${escapeHtml(item.message)}
                </td>

                <td>
                    ${
                        item.createdAt
                            ? new Date(
                                item.createdAt
                              ).toLocaleDateString()
                            : "-"
                    }
                </td>

                <td>
                    <span class="complaint-status ${status.toLowerCase()}">
                        ${formatStatus(status)}
                    </span>
                </td>

                <td>

                    ${
                        status === "PENDING"
                            ? `
                                <button
                                    class="review-btn"
                                    type="button"
                                    onclick="updateComplaintStatus(${item.id}, 'REVIEWED')">
                                    Review
                                </button>

                                <button
                                    class="resolve-btn"
                                    type="button"
                                    onclick="updateComplaintStatus(${item.id}, 'RESOLVED')">
                                    Resolve
                                </button>
                              `

                            : status === "REVIEWED"

                                ? `
                                    <button
                                        class="resolve-btn"
                                        type="button"
                                        onclick="updateComplaintStatus(${item.id}, 'RESOLVED')">
                                        Resolve
                                    </button>
                                  `

                                : `
                                    <button
                                        class="delete-btn"
                                        type="button"
                                        onclick="deleteComplaint(${item.id})">
                                        🗑️ Delete
                                    </button>
                                  `
                    }

                </td>
            `;

            complaintsTable.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Error loading complaints and suggestions:",
            error
        );

        complaintsTable.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-state error-state">
                    Unable to load complaints and suggestions.
                </td>
            </tr>
        `;

    }

}


window.updateComplaintStatus =
    async function(id, status) {

        let message =
            "Update this feedback?";


        if (status === "REVIEWED") {

            message =
                "Mark this feedback as reviewed?";

        }


        if (status === "RESOLVED") {

            message =
                "Mark this feedback as resolved?";

        }


        if (!confirm(message)) {
            return;
        }


        try {

            await apiPut(
                `/admin/complaints/${id}/status?status=${status}`
            );

            alert(
                status === "REVIEWED"
                    ? "Feedback marked as reviewed."
                    : "Feedback marked as resolved."
            );


            await loadComplaints();

        } catch (error) {

            console.error(
                "Feedback status error:",
                error
            );

            alert(
                "Unable to update feedback: " +
                error.message
            );

        }

    };


window.deleteComplaint =
    async function(id) {

        if (
            !confirm(
                "Delete this complaint or suggestion?"
            )
        ) {
            return;
        }


        try {

            await apiDelete(
                "/admin/complaints/" + id
            );

            alert("Feedback deleted.");

            await Promise.all([
                loadComplaints(),
                refreshDashboardStatistics()
            ]);

        } catch (error) {

            console.error(
                "Delete feedback error:",
                error
            );

            alert(
                "Unable to delete feedback: " +
                error.message
            );

        }

    };


window.deleteUser =
    async function(id) {

        if (!confirm("Delete this user?")) {
            return;
        }


        try {

            await apiDelete(
                "/admin/users/" + id
            );

            alert("User deleted.");


            await Promise.all([
                loadUsers(),
                refreshDashboardStatistics()
            ]);

        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );

            alert(
                "Unable to delete user: " +
                error.message
            );

        }

    };


window.deleteProduct =
    async function(id) {

        if (!confirm("Delete this product?")) {
            return;
        }


        try {

            await apiDelete(
                "/admin/products/" + id
            );

            alert("Product deleted.");


            await Promise.all([
                loadProducts(),
                refreshDashboardStatistics()
            ]);

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );

            alert(
                "Unable to delete product: " +
                error.message
            );

        }

    };


window.deleteOrder =
    async function(id) {

        if (!confirm("Delete this order?")) {
            return;
        }


        try {

            await apiDelete(
                "/admin/orders/" + id
            );

            alert("Order deleted.");


            await Promise.all([
                loadOrders(),
                refreshDashboardStatistics()
            ]);

        } catch (error) {

            console.error(
                "Delete order error:",
                error
            );

            alert(
                "Unable to delete order: " +
                error.message
            );

        }

    };



async function refreshDashboardStatistics() {

    try {

        const data =
            await apiGet("/admin/dashboard");


        setText(
            "totalUsers",
            data.totalUsers ?? 0
        );

        setText(
            "totalFarmers",
            data.totalFarmers ?? 0
        );

        setText(
            "totalBuyers",
            data.totalBuyers ?? 0
        );

        setText(
            "totalInputSellers",
            data.totalInputSellers ?? 0
        );

        setText(
            "totalProducts",
            data.totalProducts ?? 0
        );

        setText(
            "totalOrders",
            data.totalOrders ?? 0
        );

        setText(
            "totalComplaints",
            data.totalComplaints ?? 0
        );



        const feedback =
            await apiGet("/admin/complaints");

        const suggestionCount =
            feedback.filter(
                item => item.type === "SUGGESTION"
            ).length;

        setText(
            "totalSuggestions",
            suggestionCount
        );

    } catch (error) {

        console.error(
            "Unable to refresh statistics:",
            error
        );

    }

}



function initializeSidebar() {

    const menuToggle =
        document.getElementById("menuToggle");

    const adminContainer =
        document.getElementById("adminContainer");


    if (!menuToggle || !adminContainer) {

        console.error(
            "Sidebar elements could not be found."
        );

        return;
    }


    menuToggle.addEventListener(
        "click",
        () => {

            adminContainer.classList.toggle(
                "collapsed"
            );

        }
    );

}



function initializeNavigation() {

    const sidebarLinks =
        document.querySelectorAll(
            ".sidebar-link"
        );


    if (!sidebarLinks.length) {
        return;
    }


    const sections = [
        {
            id: "users",
            link: '[href="#users"]'
        },
        {
            id: "products",
            link: '[href="#products"]'
        },
        {
            id: "orders",
            link: '[href="#orders"]'
        },
        {
            id: "complaints",
            link: '[href="#complaints"]'
        }
    ];




    sidebarLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                sidebarLinks.forEach(item => {
                    item.classList.remove("active");
                });

                link.classList.add("active");

            }
        );

    });




    const observedSections =
        sections
            .map(section =>
                document.getElementById(section.id)
            )
            .filter(Boolean);


    if (!observedSections.length) {
        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                const visibleSections =
                    entries
                        .filter(
                            entry =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );


                if (!visibleSections.length) {
                    return;
                }


                const activeSection =
                    visibleSections[0].target.id;


                sidebarLinks.forEach(link => {

                    link.classList.remove("active");

                });


                const activeLink =
                    document.querySelector(
                        `[href="#${activeSection}"]`
                    );


                if (activeLink) {

                    activeLink.classList.add(
                        "active"
                    );

                }

            },
            {
                threshold: 0.2,
                rootMargin:
                    "-90px 0px -55% 0px"
            }
        );


    observedSections.forEach(section => {

        observer.observe(section);

    });




    const dashboardLink =
        document.querySelector(
            'a[href="admin-dashboard.html"]'
        );


    if (dashboardLink) {

        window.addEventListener(
            "scroll",
            () => {

                if (window.scrollY < 150) {

                    sidebarLinks.forEach(link => {
                        link.classList.remove(
                            "active"
                        );
                    });

                    dashboardLink.classList.add(
                        "active"
                    );

                }

            }
        );

    }

}



function showTableError(
    tableId,
    colspan,
    message
) {

    const table =
        document.getElementById(tableId);


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td
                colspan="${colspan}"
                class="empty-state error-state">
                ${message}
            </td>
        </tr>
    `;

}



function formatRole(role) {

    if (!role) {
        return "-";
    }

    return role
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}



function formatStatus(status) {

    if (!status) {
        return "-";
    }

    return status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}



function formatNumber(value) {

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return value ?? "0";
    }

    return number.toLocaleString();

}



function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}