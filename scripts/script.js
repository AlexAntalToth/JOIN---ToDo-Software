const BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";
let currentUser = { name: "guest" };

//script to highlight current page

function getCurrentPage(){ 
    let currentPage = window.location.pathname.replace(".html","").replace("/","");
    let activeCategory = document.querySelector(`.sidebar-categories[data-category="${currentPage}"]`);
    if (activeCategory) {
        activeCategory.classList.add("active-category");
    }
}

function waitForSidebar() {
    const sidebar = document.querySelector(".sidebar-categories");
    if (sidebar) {
        getCurrentPage();
    } else {
        setTimeout(waitForSidebar, 100);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    waitForSidebar();
});

async function getData(path) {
    const response = await fetch(BASE_URL + path + ".json");
    return data = await response.json();
}

// script for header
async function fetchCurrentUser() {
    const userData = await getData("/currentUser");
    currentUser = { name: userData?.name || "guest" };
    console.log("Fetched currentUser:", currentUser);
}

function getInitials(name) {
    if (!name || name === "guest") return "G";
    return name
        .split(" ")
        .map(part => part[0].toUpperCase())
        .join("")
        .slice(0, 2);
}

async function initApp() {
    await fetchCurrentUser();
    setHeaderInitials();
}

function setHeaderInitials() {
    console.log("currentUser:", currentUser);
    const initialsElement = document.getElementById("headerInitials");
    if (!initialsElement) {
        console.error("Element mit ID 'headerInitials' nicht gefunden.");
        return;
    }
    initialsElement.innerHTML = `<a>${getInitials(currentUser.name)}</a>`;
}

function toggleHeaderPopUp() {
    const headerPopup = document.getElementById("headerPopup");
    if (headerPopup.classList.contains("hidden")) {
        showHeaderPopup();
    } else {
        hideHeaderPopup();
    }
}

function showHeaderPopup() {
    const headerPopup = document.getElementById("headerPopup");
    headerPopup.classList.remove("hidden");
}

function hideHeaderPopup() {
    const headerPopup = document.getElementById("headerPopup");
    headerPopup.classList.add("hidden");
}

function logout() {
    // delete currentUser
}