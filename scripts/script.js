
function getCurrentPage(){ 
    let currentPage = window.location.pathname.replace(".html","").replace("/","");
    console.log(currentPage);
    
    let activeCategory = document.querySelector(`.sidebar-categories[data-category="${currentPage}"]`);
    console.log(activeCategory);
    
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