async function init() {
    await loadTasks();
}

async function loadSidebarAndHeader() {
    const sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    const headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}

function renderAddTask(task) {
    let addTaskContainer = document.querySelector(".addTask-content");

    if (!addTaskContainer) {
        return;
    }

    addTaskContainer.innerHTML = "";

    let addTaskCard = createAddTask(task || { name: "", email: "", phone: "" });
    addTaskContainer.appendChild(addTask);
}

function generateAddTaskHTML(taskid) {
    return `
        <div class="contacts-card-initials">
            <div class="contacts-card-initials-circle">
                <img class="add-contact-initials_blank" src="../../assets/icons/contact_initials_blank.png"
                    alt="Logo Contact Blank">
                <span>${initials}</span>
            </div>
        </div>
        <div class="add-contact-details">
            <button class="close-modal-contact">x</button>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-name" placeholder="Name">
                <img class="add-contact-icon" src="../../assets/icons/contact_name.png" alt="Logo Contact Name">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-email" placeholder="Email">
                <img class="add-contact-icon" src="../../assets/icons/contact_email.png" alt="Logo Contact Phone">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-phone" placeholder="Phone">
                <img class="add-contact-icon" src="../../assets/icons/contact_phone.png" alt="Logo Contact Phone">
            </div>
            <div class="add-contact-buttons">
                <button class="cancel-contact-button">
                    <h2>Cancel</h2>
                    <svg class="cancel-contact-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                        <path d="M12.001 12.5001L17.244 17.7431M6.758 17.7431L12.001 12.5001L6.758 17.7431ZM17.244 7.25708L12 12.5001L17.244 7.25708ZM12 12.5001L6.758 7.25708L12 12.5001Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="save-contact-button"><h2>Create contact</h2>
                    <img class="create-contact-icon" src="../../assets/icons/contact_create.png" alt="Icon Create Contact">
                </button>
            </div>
        </div>
    `;
}

function createAddTask(task) {
    let addTaskCard = document.createElement("div");
    addTaskCard.classList.add("addTask-content");

    addTaskCard.innerHTML = generateAddTaskHTML(task);

    let saveButton = addTaskCard.querySelector(".save-task-button");
    saveButton.addEventListener("click", saveNewTask);

    let clearButton = addTaskCard.querySelector(".clear-task-button");
    cancelButton.addEventListener("click", clearTask);

    return addTaskCard;
}