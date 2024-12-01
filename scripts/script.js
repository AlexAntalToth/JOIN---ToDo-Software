function init() {
    loadSidebarAndHeader();
    loadData("/contacts");
}

async function loadSidebarAndHeader() {
    const sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    const headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}

function renderContactsList(contacts) {
    let contactsAreaList = document.querySelector(".contacts-area-list");
    contactsAreaList.innerHTML = "";

    let displayedLetters = [];

    contacts.forEach(contact => {
        let { initials, firstLetter } = getInitialsAndFirstLetter(contact);

        if (!displayedLetters.includes(firstLetter)) {
            displayedLetters.push(firstLetter);

            let { letterElement, dividerElement } = getLetterDivider(firstLetter);
            contactsAreaList.appendChild(letterElement);
            contactsAreaList.appendChild(dividerElement);
        }

        let contactElement = createContactElement(contact, initials);
        contactsAreaList.appendChild(contactElement);
    });
}

function getInitialsAndFirstLetter(contact) {
    let nameParts = contact.name.split(" ");
    let firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    let lastNameInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
    let firstLetter = contact.name.charAt(0).toUpperCase();
    let initials = firstNameInitial + lastNameInitial;
    return { initials, firstLetter };
}

function getLetterDivider(letter) {
    let letterElement = document.createElement("div");
    letterElement.classList.add("contact-first-letter");
    letterElement.textContent = letter;
    let dividerElement = document.createElement("div");
    dividerElement.classList.add("contact-divider");
    return { letterElement, dividerElement };
}

function createContactElement(contact, initials) {
    let contactElement = document.createElement("div");
    contactElement.classList.add("contact-item");
    contactElement.innerHTML = getContactsTemplate(contact, initials);
    contactElement.addEventListener("click", () => renderContactCard(contact));
    return contactElement;
}

function renderContactCard(contact) {
    let contactCardContainer = document.querySelector(".contacts-card");
    contactCardContainer.innerHTML = "";
    let contactCard = createContactCard(contact);
    contactCardContainer.appendChild(contactCard);
}

function createContactCard(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);

    let contactCard = document.createElement("div");
    contactCard.classList.add("contacts-card-content");

    contactCard.innerHTML = `
        <div class="contacts-card-header">
            <div class="contacts-card-initials">
            <div class="contacts-card-initials-circle">
                <span>${initials}</span>
            </div>
            <div class="contacts-card-name-section">
                <h3>${contact.name}</h3>
                <div class="contacts-card-name-section2">
                    <button class="edit-delete-button"> 
                    <img class="contact-edit-icon" src="../../assets/icons/contact_edit.png" alt="Contact Edit">
                    <p>Edit</p>
                    </button>
                    <button class="edit-delete-button"> 
                     <img class="contact-basket-icon" src="../../assets/icons/contact_basket.png" alt="Contact Delete">
                    <p>Delete</p>
                    </button>
                </div>
            </div>
        </div>
        <div class="contacts-card-details">
        </div>
    `;

    return contactCard;
}


/* FOLLOWING SETTINGS AT THE MOMENT NOT IN USE:*/

document.addEventListener("DOMContentLoaded", () => {
    const addTaskButton = document.querySelector(".add-task-btn");
    const taskModal = document.getElementById("task-modal");
    const cancelTaskButton = document.querySelector(".cancel-task");
    const taskForm = document.getElementById("task-form");

    // Open the modal when Add Task is clicked
    addTaskButton.addEventListener("click", () => {
        taskModal.classList.remove("hidden");
    });

    // Close the modal when Cancel is clicked
    cancelTaskButton.addEventListener("click", () => {
        taskModal.classList.add("hidden");
    });

    // Add task to the board
    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const dueDate = document.getElementById("task-due-date").value;
        const priority = document.getElementById("task-priority").value;

        const newTask = createTaskElement(title, description, dueDate, priority);
        document.querySelector('[data-status="to-do"] .kanban-cards').appendChild(newTask);

        taskModal.classList.add("hidden");
        taskForm.reset();
    });
});

// Create a task element dynamically
function createTaskElement(title, description, dueDate, priority) {
    const task = document.createElement("div");
    task.classList.add("kanban-card");
    task.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <div>Due: ${dueDate} | Priority: ${priority}</div>
    `;
    return task;
}
