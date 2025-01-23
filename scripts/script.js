let BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";
let appInitialized = false;

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
 * Initializes the application by checking the current user and page state.
 * Redirects or adjusts UI as needed.
 */
async function initApp() {
    if (appInitialized) return;
    appInitialized = true;
    await fetchCurrentUser();
        if (currentUser.name === "") {
            handleUnauthenticatedUser();
        } else {
            setHeaderInitials();
            waitForSidebar();
        }
}



/**
 * Handles the UI behavior when no user is logged in.
 * Redirects to the home page or adjusts the UI based on the current page.
 */
function handleUnauthenticatedUser() {
    let currentPath = window.location.pathname;
    if (isLegalOrPrivacyPage(currentPath)) {
        adjustUIForLegalOrPrivacyPage();
    } else {
        redirectToHomePage();
    }
}


/**
 * Checks if the current page is the legal notice or privacy policy page.
 * @param {string} path - The current page path.
 * @returns {boolean} True if the page is legal notice or privacy policy.
 */
function isLegalOrPrivacyPage(path) {
    return path.includes("privacy_policy.html") || path.includes("legal_notice.html");
}


/**
 * Adjusts the UI for the legal notice or privacy policy page when no user is logged in.
 */
function adjustUIForLegalOrPrivacyPage() {
    customizeSidebar();
    hideHeaderRight();
    hideBackButton();
}


/**
 * Hides the header element and adjusts the legal container's padding.
 */
function hideHeaderRight() {
    let header = document.querySelector("header");
    if (header) {
        let headerRight = document.querySelector(".header-right")
        headerRight.style.display = "none";
    }
}


/**
 * Customizes the sidebar to show only the footer with the active link highlighted.
 */
function customizeSidebar() {
    let sidebar = document.querySelector("aside");
    if (sidebar) {
        let logo = sidebar.querySelector(".sidebar-logo");
        let categories = sidebar.querySelector("nav");
        let footer = document.getElementById("sidebar-footer");
        if(footer) footer.style.display = "block";
        if (logo) logo.style.display = "none";
        if (categories) categories.style.display = "none";
    }
}



/**
 * Hides the back button element.
 */
function hideBackButton() {
    let backButton = document.querySelector(".back");
    if (backButton) backButton.style.display = "none";
}


/**
 * Redirects the user to the home page with a popup message.
 */
function redirectToHomePage() {
    showPopupMessage("No user logged in. Redirecting to the home page...", true);
    setTimeout(() => {
        window.location.href = "../../index.html";
    }, 3000);
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


/**
 * Returns today's date in YYYY-MM-DD format.
 * @returns {string} The current date as a string in "YYYY-MM-DD" format.
 */
function getToday() {
    let year = new Date().getFullYear();
    let month = String(new Date().getMonth() + 1).padStart(2, '0');
    let day = String(new Date().getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Sets the minimum allowable date for an input of type "date" to today's date.
 * This ensures that users cannot select a date earlier than the current day.
 */
function setDateInputMin() {
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
        dateInput.setAttribute("min", getToday());
    }
}
