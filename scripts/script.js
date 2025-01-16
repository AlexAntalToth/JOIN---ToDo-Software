let BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";
let currentUser = { name: "guest" };

/**
 * Highlights the current page in the sidebar based on the URL path.
 */
function getCurrentPage() {
    let currentPage = window.location.pathname.replace(".html", "").replace("/", "");
    let activeCategory = document.querySelector(`.sidebar-categories[data-category="${currentPage}"]`);
    if (activeCategory) {
        activeCategory.classList.add("active-category");
    }
}


/**
 * Waits for the sidebar to load and then highlights the current page.
 */
function waitForSidebar() {
    let sidebar = document.querySelector(".sidebar-categories");
    if (sidebar) {
        getCurrentPage();
    } else {
        setTimeout(waitForSidebar, 100);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    waitForSidebar();
});


/**
 * Fetches data from the Firebase Realtime Database.
 * @async
 * @param {string} path - The database path to fetch data from.
 * @returns {Promise<Object>} The fetched data.
 */
async function getData(path) {
    let response = await fetch(`${BASE_URL}/${path}.json`);
    return await response.json();
}


/**
 * Writes data to the Firebase Realtime Database.
 * @async
 * @param {string} path - The database path to write data to.
 * @param {Object} data - The data to write.
 */
async function putData(path, data) {
    await fetch(`${BASE_URL}/${path}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}


/**
 * Deletes data from the Firebase Realtime Database.
 * @async
 * @param {string} path - The database path to delete data from.
 */
async function deleteData(path) {
    await fetch(`${BASE_URL}/${path}.json`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
}


/**
 * Initializes the application by fetching the current user and setting the header initials.
 * @async
 */
async function initApp() {
    await fetchCurrentUser();
    setHeaderInitials();
}

/**
 * Fetches the current user from the database and updates the `currentUser` object.
 * @async
 */
async function fetchCurrentUser() {
    let userData = await getData("/currentUser");
    currentUser = { name: userData?.name || "" };
}


/**
 * Sets the header initials based on the current user's name.
 */
function setHeaderInitials() {
    let initialsElement = document.getElementById("headerInitials");
    if (!initialsElement) {
        return;
    }
    initialsElement.innerHTML = `<a>${getInitials(currentUser.name)}</a>`;
}


/**
 * Generates initials from a user's name.
 * @param {string} name - The full name of the user.
 * @returns {string} The initials (up to 2 characters).
 */
function getInitials(name) {
    if (!name || name === "guest") return "G";
    return name
        .split(" ")
        .map(part => part[0].toUpperCase())
        .join("")
        .slice(0, 2);
}


/**
 * Toggles the visibility of the header popup.
 */
function toggleHeaderPopUp() {
    let headerPopup = document.getElementById("headerPopup");
    headerPopup.classList.toggle("hidden");
}


/**
 * Logs out the current user by clearing their data and redirecting to the login page.
 * @async
 */
async function logout() {
    try {
        await putData("currentUser", { name: "" });
        currentUser = { name: "" };
        alert("You have been successfully logged out.");
        window.location.href = "../../index.html";
    } catch (error) {
        console.error("Logout failed:", error);
        alert("An error occurred while logging out. Please try again.");
    }
}


/**
 * Initializes the page on load by including HTML and setting up the app.
 * @async
 */
async function onLoadInit() {
    await includeHTML();
    await initApp();
}