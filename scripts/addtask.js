let contacts = [];
let selectedContacts = [];
let taskPriority = "";
let tasks = [{ subtasks: [] }];
let currentTaskIndex = 0;
let taskSubtasks = [];
let editingSubtaskIndex = null;

async function init() {
    renderAddTaskCard();
}

async function loadSidebarAndHeader() {
    const sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    const headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}

async function renderAddTaskCard(task) {
    contacts = await loadTaskContacts();
    console.log("Kontakte für Render geladen:", contacts);
    let addTaskContainer = document.querySelector(".addTask-content");
    let addTaskFooter = document.querySelector(".addTask-footer");

    if (!addTaskContainer) {
        return;
    }

    addTaskContainer.innerHTML = await generateAddTaskCardHTML(task || { title: "", description: "", dueDate: "", priority: "" });
    addTaskFooter.innerHTML = generateAddTaskCardFooterHTML();

    setupCreateButton();
    setupClearButton();
    setupAssignedToField();
    setupPriorityButtons();
    setupCategoryDropdown();
    setupTitleField();
    validateFields();
    setupDueDateValidation();
    setupSubtaskInput();
}

function setupPriorityButtons() {
    let urgentButton = document.getElementById('task-urgent');
    let mediumButton = document.getElementById('task-medium');
    let lowButton = document.getElementById('task-low');

    if (urgentButton && mediumButton && lowButton) {
        [urgentButton, mediumButton, lowButton].forEach(button => {
            button.addEventListener('click', function () {
                togglePriority(button);
            });
        });
    }

    function togglePriority(selectedButton) {
        let allButtons = [urgentButton, mediumButton, lowButton];

        let isActive = selectedButton.classList.contains('urgent-active') ||
            selectedButton.classList.contains('middle-active') ||
            selectedButton.classList.contains('low-active');

        allButtons.forEach(button => {
            button.classList.remove('urgent-active', 'middle-active', 'low-active');
            updateButtonSVG(button, false);
        });

        if (!isActive) {
            if (selectedButton === urgentButton) {
                selectedButton.classList.add('urgent-active');
                taskPriority = "high";
            } else if (selectedButton === mediumButton) {
                selectedButton.classList.add('middle-active');
                taskPriority = "medium";
            } else if (selectedButton === lowButton) {
                selectedButton.classList.add('low-active');
                taskPriority = "low";
            }

            updateButtonSVG(selectedButton, true);
        } else {
            taskPriority = "";
        }

        console.log(`Task Priority set to: ${taskPriority}`);
    }

    function updateButtonSVG(button, isActive) {
        let svgPaths = button.querySelectorAll("svg path");
        let color;

        if (isActive) {
            color = "white";
        } else {
            if (button === urgentButton) {
                color = "#FF3D00";
            } else if (button === mediumButton) {
                color = "#FF9900";
            } else if (button === lowButton) {
                color = "#7ae229";
            }
        }

        svgPaths.forEach(path => {
            path.setAttribute("fill", color);
        });
    }
}

function setupAssignedToField() {
    const assignedToField = document.getElementById("task-assignedTo");
    const contactList = document.getElementById("contactList");
    const assignedToContainer = document.querySelector(".addTask-assignedTo-container");

    if (!assignedToField || !contactList) {
        return;
    }

    // Funktion für das Öffnen/Schließen der Kontaktliste
    function toggleContactList() {
        const isVisible = contactList.style.display === "block";
        if (isVisible) {
            // Kontaktliste ausblenden
            contactList.style.display = "none";
            updateSelectedContactInitials();
        } else {
            // Kontaktliste einblenden
            contactList.style.display = "block";
            renderContactListWithSelection();
        }
    }

    // Korrektes Event-Handling sicherstellen
    assignedToField.addEventListener("click", (event) => {
        event.stopPropagation(); // Verhindert, dass der Klick an das `document` weitergegeben wird
        toggleContactList();
    });

    // Klicken außerhalb der Kontaktliste führt zum Schließen der Liste
    document.addEventListener("click", (event) => {
        if (!assignedToField.contains(event.target) && !contactList.contains(event.target)) {
            contactList.style.display = "none";
            updateSelectedContactInitials();
        }
    });

    // Kontakte initial rendern
    function renderContactListWithSelection() {
        const contactItems = document.querySelectorAll(".contact-item");

        contactItems.forEach(contactItem => {
            const contactId = contactItem.dataset.id;
            const checkbox = contactItem.querySelector(".contact-checkbox");

            // Setze den Haken für ausgewählte Kontakte
            if (checkbox) {
                checkbox.checked = selectedContacts.some(contact => contact.id === contactId);
            }

            // Event-Listener für das Klicken auf das gesamte `contact-item`
            contactItem.removeEventListener("click", handleContactItemClick); // Entferne vorherige Listener
            contactItem.addEventListener("click", handleContactItemClick);

            // Event-Listener für die Checkbox
            checkbox.removeEventListener("click", handleCheckboxClick); // Entferne vorherige Listener
            checkbox.addEventListener("click", handleCheckboxClick);
        });
    }

    // Event-Handler für das Klicken auf das gesamte `contact-item` (einschließlich der Checkbox)
    function handleContactItemClick(event) {
        const contactItem = event.currentTarget;
        const checkbox = contactItem.querySelector(".contact-checkbox");

        // Umkehren des Checkbox-Zustands
        checkbox.checked = !checkbox.checked;

        // Den Kontakt entsprechend der Auswahl hinzufügen oder entfernen
        handleContactSelection(contactItem, checkbox.checked);
    }

    // Event-Handler für das Klicken auf die Checkbox
    function handleCheckboxClick(event) {
        // Verhindern, dass das Event weiter nach oben propagiert
        event.stopPropagation();

        const checkbox = event.currentTarget;
        const contactItem = checkbox.closest(".contact-item");

        // Umkehren des Checkbox-Zustands
        checkbox.checked = !checkbox.checked;

        // Den Kontakt entsprechend der Auswahl hinzufügen oder entfernen
        handleContactSelection(contactItem, checkbox.checked);
    }

    // Funktion, die bei Auswahl oder Abwahl eines Kontakts aufgerufen wird
    function handleContactSelection(contactItem, isChecked) {
        const contactId = contactItem.dataset.id;
        const contact = contacts.find(c => c.id === contactId);

        if (contact) {
            if (isChecked) {
                // Kontakt hinzufügen
                if (!selectedContacts.some(c => c.id === contactId)) {
                    selectedContacts.push(contact);
                }
                contactItem.classList.add("selected");
            } else {
                // Kontakt entfernen
                selectedContacts = selectedContacts.filter(c => c.id !== contactId);
                contactItem.classList.remove("selected");
            }

            updateSelectedContactInitials();
        }
    }

    // Aktualisiere die Initialen der ausgewählten Kontakte
    function updateSelectedContactInitials() {
        let selectedContactsDiv = document.querySelector(".selected-contacts");
        if (selectedContactsDiv) {
            selectedContactsDiv.remove(); // Bestehende Initialen entfernen
        }

        if (selectedContacts.length > 0) {
            const initialsHTML = selectedContacts
                .map(contact => `
                    <div class="contact-initials" style="background-color: ${contact.color};">
                        ${contact.name.split(" ").map(name => name[0]).join("").toUpperCase()}
                    </div>
                `)
                .join("");

            const newSelectedContactsDiv = document.createElement("div");
            newSelectedContactsDiv.className = "selected-contacts";
            newSelectedContactsDiv.innerHTML = initialsHTML;

            assignedToContainer.appendChild(newSelectedContactsDiv);
        }
    }
}

function renderSearchField() {
    let assignedToField = document.getElementById("task-assignedTo");

    if (!document.getElementById("contact-search-field")) {
        let searchField = document.createElement("input");
        searchField.id = "contact-search-field";
        searchField.type = "text";
        searchField.placeholder = "Search contacts...";
        searchField.className = "addTask-contact-search";

        assignedToField.innerHTML = "";
        assignedToField.appendChild(searchField);

        searchField.addEventListener("input", filterContacts);
    }
}

function removeSearchField() {
    let assignedToField = document.getElementById("task-assignedTo");
    assignedToField.innerHTML = `
        <span>Select contacts to assign</span>
        <img class="addTask-assignedTo-icon" src="../../assets/icons/addTask_arrowdown.png" alt="Arrow Down">
    `;
}

function filterContacts(event) {
    let searchValue = event.target.value.toLowerCase();
    let contacts = document.querySelectorAll(".contact-item");

    contacts.forEach(contact => {
        let contactName = contact.querySelector(".contact-name").textContent.toLowerCase();
        if (contactName.includes(searchValue)) {
            contact.style.display = "flex";
        } else {
            contact.style.display = "none";
        }
    });
}

async function generateAddTaskCardHTML(task) {
    let contacts = await loadTaskContacts();
    console.log('Loaded contacts:', contacts);
    let contactList = contacts
        .map(contact => `
            <div class="contact-item" data-id="${contact.id}">
                <div class="contact-initials" style="background-color: ${contact.color};">
                    ${contact.name.split(" ").map(name => name[0]).join("").toUpperCase()}
                </div>
                <span class="contact-name">${contact.name}</span>
                <input type="checkbox" class="contact-checkbox" data-id="${contact.id}" />
            </div>
        `)
        .join("");

    return `
        <div class="addTask-left">
            <div class="addTask-title">
                <div class="addTask-title-header">
                    <h2>Title</h2>
                    <p>*</p>
                </div>
                <input class="addTask-title-field" id="task-title" value="${task.title}" placeholder="Enter a title" required data-focused="false">
            </div>
            <div class="addTask-description">
                <h2>Description</h2>
                <textarea class="addTask-description-field" id="task-description" placeholder="Enter a description">${task.description}</textarea>
            </div>
            <div class="addTask-assignedTo">
                <h2 class="addTask-assignedTo-header">Assigned to</h2>
                <div class="addTask-assignedTo-container">
                    <div class="addTask-assignedTo-mainField">
                        <div class="addTask-assignedTo-field" id="task-assignedTo">
                            <span>Select contacts to assign</span>
                        </div>
                        <div class="addTask-assignedTo-icon-wrapper">
                            <img class="addTask-assignedTo-icon" src="../../assets/icons/addTask_arrowdown.png" alt="Arrow Down">
                        </div>
                    </div>
                    <div class="addTask-assignedTo-contactList" id="contactList" style="display: none;">
                        <div class="contact-list-scrollable">
                            ${contactList}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="addTask-vertical-line">
        </div>
        <div class="addTask-right">
            <div class="addTask-dueDate">
                <div class="addTask-dueDate-header">
                    <h2>Due Date</h2>
                    <p>*</p>
                </div>
                <div class="addTask-dueDate-field">
                    <input id="task-dueDate" type="date" value="${task.dueDate}" placeholder="dd/mm/yyyy">
                    <img class="addTask-date-icon" src="../../assets/icons/addTask_date.png" alt="Logo Due Date">
                </div>
            </div>
            <div class="addTask-prio">
                <div class="addTask-prio-header">
                    <h2>Prio</h2>
                </div>
                <div class="addTask-prio-field" id="task-priority" ${task.priority}>
                    <button class= "addTask-prio-button" id="task-urgent">
                        <h2>Urgent</h2>
                        <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.6528 15.2547C19.4182 15.2551 19.1896 15.1803 19.0007 15.0412L10.7487 8.958L2.49663 15.0412C2.38078 15.1267 2.24919 15.1887 2.10939 15.2234C1.96959 15.2582 1.82431 15.2651 1.68184 15.2437C1.53937 15.2223 1.40251 15.1732 1.27906 15.099C1.15562 15.0247 1.04801 14.927 0.96238 14.8112C0.876751 14.6954 0.814779 14.5639 0.780002 14.4243C0.745226 14.2846 0.738325 14.1394 0.759696 13.997C0.802855 13.7095 0.958545 13.4509 1.19252 13.2781L10.0966 6.70761C10.2853 6.56802 10.5139 6.49268 10.7487 6.49268C10.9835 6.49268 11.212 6.56802 11.4007 6.70761L20.3048 13.2781C20.4908 13.415 20.6286 13.6071 20.6988 13.827C20.7689 14.0469 20.7678 14.2833 20.6955 14.5025C20.6232 14.7216 20.4834 14.9124 20.2962 15.0475C20.1089 15.1826 19.8837 15.2551 19.6528 15.2547Z" fill="#FF3D00"/>
                            <path d="M19.6528 9.50568C19.4182 9.50609 19.1896 9.43124 19.0007 9.29214L10.7487 3.20898L2.49663 9.29214C2.26266 9.46495 1.96957 9.5378 1.68184 9.49468C1.39412 9.45155 1.13532 9.29597 0.962385 9.06218C0.789449 8.82838 0.716541 8.53551 0.7597 8.24799C0.802859 7.96048 0.95855 7.70187 1.19252 7.52906L10.0966 0.958588C10.2853 0.818997 10.5139 0.743652 10.7487 0.743652C10.9835 0.743652 11.212 0.818997 11.4007 0.958588L20.3048 7.52906C20.4908 7.66598 20.6286 7.85809 20.6988 8.07797C20.769 8.29785 20.7678 8.53426 20.6955 8.75344C20.6232 8.97262 20.4834 9.16338 20.2962 9.29847C20.1089 9.43356 19.8837 9.50608 19.6528 9.50568Z" fill="#FF3D00"/>
                        </svg>
                        </button>
                        <button class= "addTask-prio-button" id="task-medium">
                            <h2>Medium</h2>
                            <svg width="21" height="8" viewBox="0 0 21 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.1526 7.72528H1.34443C1.05378 7.72528 0.775033 7.60898 0.569514 7.40197C0.363995 7.19495 0.248535 6.91419 0.248535 6.62143C0.248535 6.32867 0.363995 6.0479 0.569514 5.84089C0.775033 5.63388 1.05378 5.51758 1.34443 5.51758H19.1526C19.4433 5.51758 19.722 5.63388 19.9276 5.84089C20.1331 6.0479 20.2485 6.32867 20.2485 6.62143C20.2485 6.91419 20.1331 7.19495 19.9276 7.40197C19.722 7.60898 19.4433 7.72528 19.1526 7.72528Z" fill="orange"/>
                                <path d="M19.1526 2.48211H1.34443C1.05378 2.48211 0.775033 2.36581 0.569514 2.1588C0.363995 1.95179 0.248535 1.67102 0.248535 1.37826C0.248535 1.0855 0.363995 0.804736 0.569514 0.597724C0.775033 0.390712 1.05378 0.274414 1.34443 0.274414L19.1526 0.274414C19.4433 0.274414 19.722 0.390712 19.9276 0.597724C20.1331 0.804736 20.2485 1.0855 20.2485 1.37826C20.2485 1.67102 20.1331 1.95179 19.9276 2.1588C19.722 2.36581 19.4433 2.48211 19.1526 2.48211Z" fill="orange"/>
                            </svg>
                        </button>
                        <button class= "addTask-prio-button" id="task-low">
                            <h2>Low</h2>
                            <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.2485 9.50589C10.0139 9.5063 9.7854 9.43145 9.59655 9.29238L0.693448 2.72264C0.57761 2.63708 0.47977 2.52957 0.405515 2.40623C0.33126 2.28289 0.282043 2.14614 0.260675 2.00379C0.217521 1.71631 0.290421 1.42347 0.463337 1.1897C0.636253 0.955928 0.895022 0.800371 1.18272 0.757248C1.47041 0.714126 1.76347 0.786972 1.99741 0.95976L10.2485 7.04224L18.4997 0.95976C18.6155 0.874204 18.7471 0.812285 18.8869 0.777538C19.0266 0.742791 19.1719 0.735896 19.3144 0.757248C19.4568 0.7786 19.5937 0.82778 19.7171 0.901981C19.8405 0.976181 19.9481 1.07395 20.0337 1.1897C20.1194 1.30545 20.1813 1.43692 20.2161 1.57661C20.2509 1.71629 20.2578 1.86145 20.2364 2.00379C20.215 2.14614 20.1658 2.28289 20.0916 2.40623C20.0173 2.52957 19.9195 2.63708 19.8036 2.72264L10.9005 9.29238C10.7117 9.43145 10.4831 9.5063 10.2485 9.50589Z" fill="#7AE229"/>
                                <path d="M10.2485 15.2544C10.0139 15.2548 9.7854 15.18 9.59655 15.0409L0.693448 8.47117C0.459502 8.29839 0.30383 8.03981 0.260675 7.75233C0.217521 7.46485 0.290421 7.17201 0.463337 6.93824C0.636253 6.70446 0.895021 6.54891 1.18272 6.50578C1.47041 6.46266 1.76347 6.53551 1.99741 6.7083L10.2485 12.7908L18.4997 6.7083C18.7336 6.53551 19.0267 6.46266 19.3144 6.50578C19.602 6.54891 19.8608 6.70446 20.0337 6.93824C20.2066 7.17201 20.2795 7.46485 20.2364 7.75233C20.1932 8.03981 20.0376 8.29839 19.8036 8.47117L10.9005 15.0409C10.7117 15.18 10.4831 15.2548 10.2485 15.2544Z" fill="#7AE229"/>
                            </svg>
                        </button>
                </div>
            </div>
            <div class="addTask-category">
                <div class="addTask-category-header">
                    <h2>Category</h2>
                    <p>*</p>
                </div>
                <div class="addTask-category-container">
                    <div class="addTask-category-field" id="task-category">
                    <span>Select task category</span>
                    </div>
                    <div class="addTask-category-icon-wrapper">
                        <img class="addTask-category-icon" src="../../assets/icons/addTask_arrowdown.png" alt="Logo Arrow Down">
                    </div>
                    <div class="addTask-category-dropdown" id="categoryDropdown" style="display: none;">
                        <div class="category-item" data-value="Technical Task">Technical Task</div>
                        <div class="category-item" data-value="User Story">User Story</div>
                    </div>
                </div>
            </div>
            <div class="addTask-subtasks">
                <h2>Subtasks</h2>
                <div class="addTask-subtasks-field">
                    <input class="addTask-subtasks-content" type="text" id="addTaskNewSubTaskInput" placeholder="Add new subtask">
                    <svg class="addTask-subtasks-icon-add" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_75601_15213" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                        <rect x="0.248535" width="24" height="25" fill="#D9D9D9"/>
                        </mask>
                        <g mask="url(#mask0_75601_15213)">
                        <path d="M11.2485 13H6.24854C5.9652 13 5.7277 12.9042 5.53604 12.7125C5.34437 12.5208 5.24854 12.2833 5.24854 12C5.24854 11.7167 5.34437 11.4792 5.53604 11.2875C5.7277 11.0958 5.9652 11 6.24854 11H11.2485V6C11.2485 5.71667 11.3444 5.47917 11.536 5.2875C11.7277 5.09583 11.9652 5 12.2485 5C12.5319 5 12.7694 5.09583 12.961 5.2875C13.1527 5.47917 13.2485 5.71667 13.2485 6V11H18.2485C18.5319 11 18.7694 11.0958 18.961 11.2875C19.1527 11.4792 19.2485 11.7167 19.2485 12C19.2485 12.2833 19.1527 12.5208 18.961 12.7125C18.7694 12.9042 18.5319 13 18.2485 13H13.2485V18C13.2485 18.2833 13.1527 18.5208 12.961 18.7125C12.7694 18.9042 12.5319 19 12.2485 19C11.9652 19 11.7277 18.9042 11.536 18.7125C11.3444 18.5208 11.2485 18.2833 11.2485 18V13Z" fill="#2A3647"/>
                        </g>
                    </svg>
                    <div class="addTask-icons-input">
                        <svg class="cancel-addTask-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                            <path d="M12.001 12.5001L17.244 17.7431M6.758 17.7431L12.001 12.5001L6.758 17.7431ZM17.244 7.25708L12 12.5001L17.244 7.25708ZM12 12.5001L6.758 7.25708L12 12.5001Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>  
                        <div class="addTask-subtasks-vertical-line">
                        </div>
                        <div id="addSubtaskButton2" onclick="addSubtask(event)">
                            <svg class="create-addTask-icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_267600_4053" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                                    <rect y="0.5" width="24" height="24" fill="#D9D9D9"/>
                                </mask>
                                <g mask="url(#mask0_267600_4053)">
                                    <path d="M9.55057 15.65L18.0256 7.175C18.2256 6.975 18.4631 6.875 18.7381 6.875C19.0131 6.875 19.2506 6.975 19.4506 7.175C19.6506 7.375 19.7506 7.6125 19.7506 7.8875C19.7506 8.1625 19.6506 8.4 19.4506 8.6L10.2506 17.8C10.0506 18 9.81724 18.1 9.55057 18.1C9.28391 18.1 9.05057 18 8.85057 17.8L4.55057 13.5C4.35057 13.3 4.25474 13.0625 4.26307 12.7875C4.27141 12.5125 4.37557 12.275 4.57557 12.075C4.77557 11.875 5.01307 11.775 5.28807 11.775C5.56307 11.775 5.80057 11.875 6.00057 12.075L9.55057 15.65Z" fill="black"/>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
                        <ul class="subtasks-list" id="addTaskSubtasksList">
                        </ul>
            </div>
        </div>
        <div id="task-created-popup" class="task-created-popup">
            <span>Task added to board</span>
            <img class="task-created-icon" src="../../assets/icons/board.png" alt="Board Icon">
        </div>
    `;
}

function generateAddTaskCardFooterHTML() {
    return `
        <div class="addTask-footer-generated">
            <div class="addTask-footer-left">
                <p>*</p>
                <h2>This field is required</h2>
            </div>
            <div class="addTask-footer-right">
                <div class="addTask-buttons">
                    <button class="clear-addTask-button">
                        <h2>Clear</h2>
                        <svg class="clear-addTask-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                            <path d="M12.001 12.5001L17.244 17.7431M6.758 17.7431L12.001 12.5001L6.758 17.7431ZM17.244 7.25708L12 12.5001L17.244 7.25708ZM12 12.5001L6.758 7.25708L12 12.5001Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="create-addTask-button">
                        <h2>Create Task</h2>
                        <img class="create-addTask-icon" src="../../assets/icons/contact_create.png" alt="Icon Create AddTask">
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function createAddTaskCard(task) {
    let addTaskContainer = document.querySelector(".addTask-content");
    let addTaskFooter = document.querySelector(".addTask-footer");

    if (!addTaskContainer) {
        return;
    }

    addTaskContainer.innerHTML = "";
    addTaskFooter.innerHTML = "";

    let addTaskCardHTML = await generateAddTaskCardHTML(task || { title: "", description: "", dueDate: "", priority: "" });
    addTaskContainer.innerHTML = addTaskCardHTML;

    let addTaskFooterHTML = generateAddTaskCardFooterHTML();
    addTaskFooter.innerHTML = addTaskFooterHTML;
}

async function saveNewTask() {
    let taskTitle = document.getElementById('task-title').value;
    let taskDescription = document.getElementById('task-description').value;
    let taskDueDate = document.getElementById('task-dueDate').value;
    let dueDateISO = document.getElementById('task-dueDate').value;
    let [year, month, day] = dueDateISO.split("-");
    let formattedDueDate = `${day}/${month}/${year}`; // in case of saving as DD/MM/YYYY
    let taskBadge = document.getElementById('categoryDropdown').getAttribute('data-selected');
    let taskSubtasks = [];
    let subtaskElements = document.querySelectorAll('.subtasks-list li span');
    subtaskElements.forEach((element) => {
        taskSubtasks.push({ name: element.textContent.trim(), completed: false });
    });
    let assignedTo = {};
    if (selectedContacts.length > 0) {
        selectedContacts.forEach((contact, index) => {
            assignedTo[`contact${index + 1}`] = contact.name;
        });
    } else {
        // Füge einen leeren String hinzu, wenn keine Kontakte ausgewählt sind
        assignedTo["contact1"] = "";
    }

    let newTask = {
        title: taskTitle,
        description: taskDescription,
        assignedTo,
        dueDate: taskDueDate,
        priority: taskPriority,
        badge: taskBadge,
        subtasks: taskSubtasks
    };

    try {
        let response = await fetch(BASE_URL + "tasks.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            let responseData = await response.json();
            console.log("Neue Aufgabe gespeichert:", responseData);
            showTaskCreatedPopup();
            return responseData;
        } else {
            console.error("Fehler beim Speichern der Aufgabe:", response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Fehler beim Speichern der Aufgabe:", error);
        return null;
    }
}

function showTaskCreatedPopup() {
    let popup = document.getElementById('task-created-popup');
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 1500);
}

function setupCreateButton() {
    let createButton = document.querySelector(".create-addTask-button");
    if (createButton) {
        createButton.addEventListener("click", validateAndSaveTask);
    }
}

function setupClearButton() {
    let clearButton = document.querySelector(".clear-addTask-button");
    if (!clearButton) return;

    clearButton.addEventListener("click", () => {
        // Zurücksetzen der Texteingabefelder
        document.getElementById("task-title").value = "";
        document.getElementById("task-description").value = "";
        document.getElementById("task-dueDate").value = "";
        document.querySelectorAll(".addTask-prio-button").forEach(button => button.classList.remove("selected"));

        // Zurücksetzen des Kategoriemenüs
        let categoryField = document.getElementById("task-category");
        categoryField.innerHTML = `<span>Select task category</span>`;
        let categoryDropdown = document.getElementById("categoryDropdown");
        if (categoryDropdown) {
            categoryDropdown.querySelectorAll(".category-item").forEach(item => {
                item.classList.remove("selected");
            });
        }

        // Zurücksetzen der "Assigned to" Kontakte
        document.querySelectorAll(".contact-checkbox").forEach(checkbox => {
            checkbox.checked = false;  // Alle Checkboxen zurücksetzen
        });

        // Leeren der ausgewählten Kontakte-Liste
        selectedContacts = []; // Hier wird die Liste der ausgewählten Kontakte zurückgesetzt

        // Das "Assigned to"-Feld zurücksetzen
        let assignedToField = document.getElementById("task-assignedTo");
        assignedToField.innerHTML = "<span>Select contacts to assign</span>"; // Setze den Text zurück

        // Leeren des Kontaktlistenelements
        let contactList = document.getElementById("contactList");
        if (contactList) {
            contactList.style.display = "none"; // Blende die Kontaktliste aus, falls sie offen ist
        }

        // Reset der Unteraufgaben
        tasks[currentTaskIndex].subtasks = [];

        // UI aktualisieren
        renderAddTaskCard();
        updateSubtasksList();

        // Aktualisiere die angezeigten Initialen (nun leer)
        updateSelectedContactInitials();
    });
}

function validateFields() {
    let titleField = document.getElementById("task-title");
    let categoryDropdown = document.getElementById("categoryDropdown");
    let dueDateField = document.getElementById("task-dueDate");
    let createButton = document.querySelector(".create-addTask-button");

    let isTitleEmpty = titleField.value.trim() === "";
    let isCategoryEmpty = !categoryDropdown.getAttribute("data-selected");

    let isDueDateEmpty = dueDateField.value.trim() === "";
    let isDueDateInvalid = false;

    if (!isDueDateEmpty) {
        let date = new Date(dueDateField.value);
        let today = new Date();
        isDueDateInvalid = isNaN(date.getTime()) || date < today; // Gültig nur wenn heute oder in der Zukunft
    }

    // Überprüfe, ob eines der Felder leer oder ungültig ist
    createButton.style.backgroundColor = isTitleEmpty || isCategoryEmpty || isDueDateEmpty || isDueDateInvalid ? "grey" : "";
    createButton.style.cursor = isTitleEmpty || isCategoryEmpty || isDueDateEmpty || isDueDateInvalid ? "not-allowed" : "pointer";
    createButton.disabled = isTitleEmpty || isCategoryEmpty || isDueDateEmpty || isDueDateInvalid;
}

function validateAndSaveTask(event) {
    event.preventDefault();

    let titleField = document.getElementById("task-title");
    let categoryDropdown = document.getElementById("categoryDropdown");
    let dueDateField = document.getElementById("task-dueDate");

    let isValid = true;

    removeErrorMessages();

    if (!titleField.value.trim()) {
        isValid = false;
        showError(titleField, "This field is required");
    }

    if (!categoryDropdown.getAttribute("data-selected")) {
        isValid = false;
        showError(categoryDropdown, "This field is required");
    }

    if (!dueDateField.value.trim()) {
        isValid = false;
        showError(dueDateField, "This field is required");
    }

    if (isValid) {
        saveNewTask();
    }
}

function showError(field, message) {
    let errorSpan = document.createElement("span");
    errorSpan.style.color = "red";
    errorSpan.textContent = message;
    field.parentNode.appendChild(errorSpan);
}

function removeErrorMessages() {
    let errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(msg => msg.remove());
}

function setupTitleField() {
    let titleField = document.getElementById('task-title');
    if (titleField) {
        titleField.addEventListener('input', validateFields);
    }
}

function setupCreateButton() {
    let createButton = document.querySelector(".create-addTask-button");
    if (createButton) {
        createButton.addEventListener("click", validateAndSaveTask);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    setupTitleField();
    setupCreateButton();
    setupAssignedToField();
    setupCategoryDropdown();
    setupDueDateValidation();
});

document.addEventListener("DOMContentLoaded", () => {
    const contactListElement = document.getElementById("contactList");

    if (contactListElement) {
        contactListElement.addEventListener("click", (event) => {
            const target = event.target;
            const contactItem = target.closest(".contact-item");
            if (!contactItem) return;

            const checkbox = contactItem.querySelector(".contact-checkbox");
            if (!checkbox) return;

            // Toggle the selection state
            const isSelected = checkbox.checked;
            checkbox.checked = !isSelected;

            if (checkbox.checked) {
                contactItem.classList.add("selected");
            } else {
                contactItem.classList.remove("selected");
            }
        });
    } else {
    }
});

function setupCategoryDropdown() {
    let categoryField = document.getElementById("task-category");
    let dropdown = document.getElementById("categoryDropdown");
    let iconWrapper = document.querySelector(".addTask-category-icon-wrapper"); 

    if (categoryField && dropdown && iconWrapper) {
        categoryField.addEventListener("click", () => {
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
            categoryField.classList.toggle("open");
        });

        iconWrapper.addEventListener("click", () => {
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
            categoryField.classList.toggle("open");
        });

        dropdown.addEventListener('click', function (event) {
            if (event.target.classList.contains('category-item')) {
                let selectedValue = event.target.dataset.value;
                categoryField.querySelector("span").textContent = selectedValue;

                dropdown.style.display = "none";
                categoryField.classList.remove("open");

                dropdown.setAttribute('data-selected', selectedValue);
                console.log('Selected category:', selectedValue);
            }
        });
    }
}

function setupDueDateValidation() {
    let dueDateField = document.getElementById("task-dueDate");

    if (dueDateField) {
        dueDateField.addEventListener("input", () => {
            validateFields();
        });
    }
}

function setupSubtaskInput() {
    const subtaskInput = document.querySelector(".addTask-subtasks-content");
    const addIcon = document.querySelector(".addTask-subtasks-icon-add");
    const iconsContainer = document.querySelector(".addTask-icons-input");

    if (subtaskInput && addIcon && iconsContainer) {
        addIcon.classList.remove("hidden");
        iconsContainer.classList.remove("active");

        subtaskInput.addEventListener("focus", () => {
            addIcon.classList.add("hidden");
            iconsContainer.classList.add("active");
        });

        subtaskInput.addEventListener("blur", () => {
            if (!subtaskInput.value.trim()) {
                addIcon.classList.remove("hidden");
                iconsContainer.classList.remove("active");
            }
        });
    }
}

function addSubtask() {
    const input = document.getElementById("addTaskNewSubTaskInput");
    const subtaskName = input.value.trim();

    if (subtaskName === "") {
        alert("Bitte geben Sie einen Namen für die Subtask ein.");
        return;
    }

    if (tasks[currentTaskIndex].subtasks.length >= 3) {
        alert("Es können maximal 3 Subtasks hinzugefügt werden.");
        return;
    }

    tasks[currentTaskIndex].subtasks.push({ name: subtaskName, completed: false });
    input.value = "";
    updateSubtasksList();
}

function updateSubtasksList() {
    const list = document.getElementById("addTaskSubtasksList");
    const subtasks = tasks[currentTaskIndex].subtasks;

    list.innerHTML = subtasks
        .map(
            (subtask, index) => `
        <li>
            <span>${subtask.name}</span>
            <div class="subtask-detail-buttons">
            <button class="subtask-buttons" onclick="editSubtask(${index})">
                <svg class="edit-subtask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_268101_3948" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_268101_3948)">
                        <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#2A3647"/>
                    </g>
                </svg>
            </button>
            <div class="addTask-subtasks-detail-vertical-line">
            </div>
            <button class="subtask-buttons" onclick="deleteSubtask(${index})">
                <svg class="delete-subtask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_268101_4160" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_268101_4160)">
                        <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                    </g>
                </svg>
            </button>
            </div>
        </li>
    `
        )
        .join("");
}

function deleteSubtask(index) {
    tasks[currentTaskIndex].subtasks.splice(index, 1);
    updateSubtasksList();
}

function editSubtask(index) {
    const list = document.getElementById("addTaskSubtasksList");
    const subtasks = tasks[currentTaskIndex].subtasks;

    if (editingSubtaskIndex !== null) {
        updateSubtasksList();
    }

    editingSubtaskIndex = index;

    const subtask = subtasks[index];
    const editTemplate = `
        <li class="editing">
            <div class="subtask-edit-mode">
                <input class="edit-input" type="text" value="${subtask.name}" id="editSubtaskInput"/>
                <div class="subtask-detail-buttons">
                    <button class="subtask-buttons" onclick="deleteSubtask(${index})">
                        <svg class="delete-subtask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_268101_4160" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_268101_4160)">
                                <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                            </g>
                        </svg>
                    </button>
                    <div class="addTask-subtasks-detail-vertical-line"></div>
                    <button class="subtask-buttons" onclick="saveSubtask(${index})">
                        <svg class="create-addTask-icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_267600_4053" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                                <rect y="0.5" width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_267600_4053)">
                                <path d="M9.55057 15.65L18.0256 7.175C18.2256 6.975 18.4631 6.875 18.7381 6.875C19.0131 6.875 19.2506 6.975 19.4506 7.175C19.6506 7.375 19.7506 7.6125 19.7506 7.8875C19.7506 8.1625 19.6506 8.4 19.4506 8.6L10.2506 17.8C10.0506 18 9.81724 18.1 9.55057 18.1C9.28391 18.1 9.05057 18 8.85057 17.8L4.55057 13.5C4.35057 13.3 4.25474 13.0625 4.26307 12.7875C4.27141 12.5125 4.37557 12.275 4.57557 12.075C4.77557 11.875 5.01307 11.775 5.28807 11.775C5.56307 11.775 5.80057 11.875 6.00057 12.075L9.55057 15.65Z" fill="black"/>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </li>
    `;

    list.children[index].outerHTML = editTemplate;
}

function saveSubtask(index) {
    const input = document.getElementById("editSubtaskInput");
    const newName = input.value.trim();

    if (newName === "") {
        alert("Bitte geben Sie einen gültigen Namen für den Subtask ein.");
        return;
    }

    tasks[currentTaskIndex].subtasks[index].name = newName;
    editingSubtaskIndex = null;
    updateSubtasksList();
}
