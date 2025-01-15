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

//script to fetch GET, PUT and DELETE
async function getData(path) {
    const response = await fetch(`${BASE_URL}/${path}.json`);
    return data = await response.json();
}

async function putData(path, data) {
    await fetch(`${BASE_URL}/${path}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function deleteData(path) {
    await fetch(`${BASE_URL}/${path}.json`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
}


// script for header
async function initApp() {
    await fetchCurrentUser();
    setHeaderInitials();
}

async function fetchCurrentUser() {
    const userData = await getData("/currentUser");
    currentUser = { name: userData?.name || "" };
}

function setHeaderInitials() {
    const initialsElement = document.getElementById("headerInitials");
    if (!initialsElement) {
        return;
    }
    initialsElement.innerHTML = `<a>${getInitials(currentUser.name)}</a>`;
}

function getInitials(name) {
    if (!name || name === "guest") return "G";
    return name
        .split(" ")
        .map(part => part[0].toUpperCase())
        .join("")
        .slice(0, 2);
}

function toggleHeaderPopUp() {
    const headerPopup = document.getElementById("headerPopup");
    headerPopup.classList.toggle("hidden");
}

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

//script for loading header
async function onLoadInit() {
    await includeHTML();
    await initApp();
}