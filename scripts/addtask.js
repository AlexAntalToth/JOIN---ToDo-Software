let contacts = [];
let selectedContacts = [];
let taskPriority = "";

async function init() {
    await loadTasks();
    renderAddTaskCard();
}

async function loadSidebarAndHeader() {
    const sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    const headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}

async function renderAddTaskCard(task) {
    let addTaskContainer = document.querySelector(".addTask-content");
    let addTaskFooter = document.querySelector(".addTask-footer");

    if (!addTaskContainer) {
        return;
    }

    // HTML-Inhalte einfügen
    addTaskContainer.innerHTML = await generateAddTaskCardHTML(task || { title: "", description: "", dueDate: "", priority: "" });
    addTaskFooter.innerHTML = generateAddTaskCardFooterHTML();

    // Events für Buttons und Felder
    setupCreateButton();
    setupAssignedToField();
    setupDueDateValidation();
    setupPriorityButtons(); // Die Logik für Prioritätsbuttons ist ausgelagert
}

// Setup-Funktion für "Create"-Button
function setupCreateButton() {
    let createButton = document.querySelector(".create-addTask-button");
    if (createButton) {
        createButton.addEventListener("click", saveNewTask);
    }
}

// Setup-Funktion für das "Assigned To"-Feld
function setupAssignedToField() {
    let assignedToField = document.getElementById("task-assignedTo");
    let contactList = document.getElementById("contactList");

    if (assignedToField && contactList) {
        assignedToField.addEventListener("click", () => {
            if (contactList.style.display === "none") {
                contactList.style.display = "block";
                renderSearchField();
            } else {
                contactList.style.display = "none";
                removeSearchField();
            }
        });

        let contactItems = document.querySelectorAll(".contact-item");
        contactItems.forEach(contactItem => {
            contactItem.addEventListener("click", (event) => {
                let selectedContactId = event.target.closest('.contact-item').dataset.id;
                let selectedContact = contacts.find(contact => contact.id === selectedContactId);

                if (selectedContact) {
                    const contactIndex = selectedContacts.findIndex(contact => contact.id === selectedContactId);
                    if (contactIndex === -1) {
                        selectedContacts.push(selectedContact);
                    } else {
                        selectedContacts.splice(contactIndex, 1);
                    }
                    updateAssignedToField();
                }
            });
        });
    }
}

// Setup-Funktion für Datumseingabevalidierung
function setupDueDateValidation() {
    let dueDateInput = document.getElementById("task-dueDate");
    if (dueDateInput) {
        dueDateInput.addEventListener("input", function () {
            let dueDateField = document.getElementById("task-dueDate");
            let errorMessage = document.getElementById("date-error-message");

            let datePattern = /^([0-2][0-9]|(3)[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/;

            if (!datePattern.test(dueDateField.value)) {
                if (!errorMessage) {
                    let errorSpan = document.createElement("span");
                    errorSpan.id = "date-error-message";
                    errorSpan.style.color = "red";
                    errorSpan.textContent = "Bitte ein gültiges Datum im Format dd/mm/yyyy eingeben.";
                    dueDateField.parentNode.appendChild(errorSpan);
                }
            } else if (errorMessage) {
                errorMessage.remove();
            }
        });
    }
}

// Setup-Funktion für Prioritätsbuttons
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

        // Prüfen, ob der Button bereits aktiv ist
        const isActive = selectedButton.classList.contains('urgent-active') ||
                         selectedButton.classList.contains('middle-active') ||
                         selectedButton.classList.contains('low-active');

        // Entfernen aller aktiven Klassen
        allButtons.forEach(button => {
            button.classList.remove('urgent-active', 'middle-active', 'low-active');
            updateButtonSVG(button, false); // Setzt die Farben zurück
        });

        // Nur aktivieren, wenn der Button zuvor nicht aktiv war
        if (!isActive) {
            if (selectedButton === urgentButton) {
                selectedButton.classList.add('urgent-active');
                taskPriority = "high"; // Priorität setzen
            } else if (selectedButton === mediumButton) {
                selectedButton.classList.add('middle-active');
                taskPriority = "medium"; // Priorität setzen
            } else if (selectedButton === lowButton) {
                selectedButton.classList.add('low-active');
                taskPriority = "low"; // Priorität setzen
            }

            updateButtonSVG(selectedButton, true); // Aktivierte Farbe setzen
        } else {
            taskPriority = ""; // Keine Priorität ausgewählt
        }

        console.log(`Task Priority set to: ${taskPriority}`); // Debug-Ausgabe
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

function updateAssignedToField() {
    let assignedToField = document.getElementById("task-assignedTo");

    if (selectedContacts.length > 0) {
        assignedToField.innerHTML = selectedContacts.map(contact => `<span>${contact.name}</span>`).join(", ");
    } else {
        assignedToField.innerHTML = `<span>Select contacts to assign</span>`;
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
                <input class="addTask-title-field" id="task-title" value="${task.title}" placeholder="Enter a title">
            </div>
            <div class="addTask-description">
                <h2>Description</h2>
                <textarea class="addTask-description-field" id="task-description" placeholder="Enter a description">${task.description}</textarea>
            </div>
            <div class="addTask-assignedTo">
                <h2 class="addTask-assignedTo-header">Assigned to</h2>
                <div class="addTask-assignedTo-container">
                    <div class="addTask-assignedTo-field" id="task-assignedTo">
                        <span>Select contacts to assign</span>
                        <img class="addTask-assignedTo-icon" src="../../assets/icons/addTask_arrowdown.png" alt="Arrow Down">
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
                    <input id="task-dueDate" type="text" value="${task.dueDate}" placeholder="dd/mm/yyyy">
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
                    <select class="addTask-category-field" id="task-category">
                    <option value="" disabled selected>Select task category</option>
                    ${task.badge}
                    </select>
                    <img class="addTask-category-icon" src="../../assets/icons/addTask_arrowdown.png" alt="Logo Arrow Down">
                </div>
            </div>
            <div class="addTask-subtasks">
                <h2>Subtasks</h2>
                <div class="addTask-subtasks-field">
                    <input class="addTask-subtasks-content" id="task-subtasks" value="${task.subtasks}" placeholder="Add new subtask">
                    <svg class="addTask-subtasks-icon" width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_75601_15213" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="25" height="24">
                        <rect x="0.248535" width="24" height="24" fill="#D9D9D9"/>
                        </mask>
                        <g mask="url(#mask0_75601_15213)">
                        <path d="M11.2485 13H6.24854C5.9652 13 5.7277 12.9042 5.53604 12.7125C5.34437 12.5208 5.24854 12.2833 5.24854 12C5.24854 11.7167 5.34437 11.4792 5.53604 11.2875C5.7277 11.0958 5.9652 11 6.24854 11H11.2485V6C11.2485 5.71667 11.3444 5.47917 11.536 5.2875C11.7277 5.09583 11.9652 5 12.2485 5C12.5319 5 12.7694 5.09583 12.961 5.2875C13.1527 5.47917 13.2485 5.71667 13.2485 6V11H18.2485C18.5319 11 18.7694 11.0958 18.961 11.2875C19.1527 11.4792 19.2485 11.7167 19.2485 12C19.2485 12.2833 19.1527 12.5208 18.961 12.7125C18.7694 12.9042 18.5319 13 18.2485 13H13.2485V18C13.2485 18.2833 13.1527 18.5208 12.961 18.7125C12.7694 18.9042 12.5319 19 12.2485 19C11.9652 19 11.7277 18.9042 11.536 18.7125C11.3444 18.5208 11.2485 18.2833 11.2485 18V13Z" fill="#2A3647"/>
                        </g>
                    </svg>
                </div>
            </div>
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

function clearTaskForm() {
    document.querySelector(".addTask-content").innerHTML = "";
}

async function saveNewTask() {
    let taskTitle = document.getElementById('task-title').value;
    let taskDescription = document.getElementById('task-description').value;
    let taskDueDate = document.getElementById('task-dueDate').value;
    // let taskPriority = taskdocument.getElementById('task-priority').value;
    let taskBadge = document.getElementById('task-category').value;

    // Subtasks are assumed to be a comma-separated list of values
    let taskSubtasks = document.getElementById('task-subtasks').value.split(',').map(subtask => subtask.trim());

    let newTask = {
        title: taskTitle,
        description: taskDescription,
        assignedTo: selectedContacts.map(contact => contact.id),
        dueDate: taskDueDate,
        priority: taskPriority,
        badge: taskBadge,
        subtasks: taskSubtasks // Store the subtasks list
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
            return responseData; // Returns the generated Task ID
        } else {
            console.error("Fehler beim Speichern der Aufgabe:", response.statusText);
            return null;
        }
    } catch (error) {
        console.error("Fehler beim Speichern der Aufgabe:", error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Abschnitt 1: Kontaktliste toggeln
    let assignedToElement = document.getElementById('task-assignedTo');
    let contactList = document.querySelector('.addTask-assignedTo-contactList');

    const toggleContactList = () => {
        if (contactList) {
            contactList.style.display = contactList.style.display === 'block' ? 'none' : 'block';
        }
    };

    if (assignedToElement) {
        assignedToElement.addEventListener('click', toggleContactList);
    } else {
        document.addEventListener('click', toggleContactList);
    }

});
