const BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

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