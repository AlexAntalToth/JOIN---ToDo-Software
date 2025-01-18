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
 * Initializes the application by fetching the current user and setting up the header.
 * 
 * - If no user is logged in (i.e., `currentUser.name` is an empty string), it displays an error message 
 *   and redirects the user to the home page after a 3-second delay.
 * - If a user is logged in, it updates the header with the user's initials.
 * 
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the initialization process is complete.
 */
async function initApp() {
    await fetchCurrentUser();

    if (currentUser.name === "") {
        showPopupMessage("No user logged in. Redirecting to the home page...", true);
        setTimeout(() => {
            window.location.href = "../../index.html";
        }, 3000);
        return;
    }

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
 * Logs out the current user and displays a confirmation popup.
 * If successful, redirects to the index page after the popup disappears.
 * If an error occurs, displays an error message in the popup.
 */
async function logout() {
    try {
        await putData("currentUser", { name: "" });
        currentUser = { name: "" };
        showPopupMessage("You have been successfully logged out.");
        setTimeout(() => {
            window.location.href = "../../index.html";
        }, 3000);
    } catch (error) {
        console.error("Logout failed:", error);
        showPopupMessage("An error occurred while logging out. Please try again.");
    }
}


/**
 * Displays a popup message with optional error styling.
 * 
 * @param {string} message - The message to display in the popup.
 * @param {boolean} isError - Whether the message indicates an error.
 */
function showPopupMessage(message, isError = false) {
    let popupBox = document.getElementById("popup-message-box");
    popupBox.textContent = message;
    if (isError) {
        popupBox.style.backgroundColor = "#f8d7da"; 
        popupBox.style.color = "#721c24";
    } else {
        popupBox.style.backgroundColor = "";
        popupBox.style.color = "";
    }
    popupBox.classList.remove("hidden");
    popupBox.classList.add("show");
    setTimeout(() => {
        popupBox.classList.remove("show");
        setTimeout(() => {
            popupBox.classList.add("hidden");
        }, 500);
    }, 2500);
}


/**
 * Initializes the page on load by including HTML and setting up the app.
 * @async
 */
async function onLoadInit() {
    await includeHTML();
    await initApp();
}


/**
 * Handles the error when the task ID is undefined or invalid.
 * Logs an error message to the console.
 */
function handleError() {
    console.error("Task ID is undefined. Cannot update task.");
}


/**
 * Formats a date string from "YYYY-MM-DD" to "DD/MM/YYYY".
 * 
 * @param {string} dateString - The date string in "YYYY-MM-DD" format.
 * @returns {string} - The formatted date string in "DD/MM/YYYY" format.
 */
function formatDateToDDMMYYYY(dateString) {
    let [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}