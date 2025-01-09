let contacts = [];
let selectedContacts = [];
let taskPriority = "";
let tasks = [{ subtasks: [] }];
let currentTaskIndex = 0;
let taskSubtasks = [];
let editingSubtaskIndex = null;

async function init() {
    await includeHTML();
    await initApp();
    renderAddTaskCard();
}


async function loadSidebarAndHeader() {
    let sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    let headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}


async function renderAddTaskCard(task) {
    let addTaskContainer = document.querySelector(".addTask-content");
    let addTaskFooter = document.querySelector(".addTask-footer");
    contacts = await loadTaskContacts();

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


// Assigned to
function setupAssignedToField() {
    let elements = getAssignedToElements();
    if (!elements) return;

    initializeAssignedToField(elements);
}


function getAssignedToElements() {
    let assignedToField = document.getElementById("task-assignedTo");
    let contactList = document.getElementById("contactList");
    let assignedToContainer = document.querySelector(".addTask-assignedTo-container");
    let assignedToIconWrapper = document.querySelector(".addTask-assignedTo-icon-wrapper");
    let searchContacts = document.getElementById("searchContacts");
    let assignedToText = document.getElementById("assignedToText");

    if (!assignedToField || !contactList || !assignedToIconWrapper || !searchContacts || !assignedToText) {
        return null;
    }

    return {
        assignedToField,
        contactList,
        assignedToContainer,
        assignedToIconWrapper,
        searchContacts,
        assignedToText,
    };
}


function initializeAssignedToField(elements) {
    let searchTerm = "";

    setupToggleListeners(elements, searchTerm);
    setupSearchListener(elements, searchTerm);
    setupGlobalClickListener(elements);
    renderContactListWithSelection();
}


function setupToggleListeners(elements, searchTerm) {
    elements.assignedToIconWrapper.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleContactList(elements, searchTerm);
    });

    elements.assignedToField.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleContactList(elements, searchTerm);
    });
}


function setupSearchListener(elements, searchTerm) {
    elements.searchContacts.addEventListener("input", (event) => {
        searchTerm = event.target.value.toLowerCase();
        renderFilteredContactList(searchTerm);
    });
}


function setupGlobalClickListener(elements) {
    document.addEventListener("click", (event) => {
        if (
            !elements.assignedToField.contains(event.target) &&
            !elements.contactList.contains(event.target)
        ) {
            closeContactList(elements);
        }
    });
}


function toggleContactList(elements, searchTerm) {
    let isVisible = elements.contactList.style.display === "block";
    if (isVisible) {
        closeContactList(elements);
    } else {
        openContactList(elements, searchTerm);
    }
}


function openContactList(elements, searchTerm) {
    elements.contactList.style.display = "block";
    elements.assignedToField.classList.add("open");
    elements.assignedToIconWrapper.classList.add("rotated");
    elements.searchContacts.style.display = "block";
    elements.assignedToText.style.display = "none";
    elements.searchContacts.focus();
    renderFilteredContactList(searchTerm);
}


function closeContactList(elements) {
    elements.contactList.style.display = "none";
    elements.assignedToField.classList.remove("open");
    elements.assignedToIconWrapper.classList.remove("rotated");
    elements.searchContacts.style.display = "none";
    elements.assignedToText.style.display = "block";
    resetFilter();
}


function renderFilteredContactList(filter) {
    let contactItems = document.querySelectorAll(".contact-item");
    contactItems.forEach(contactItem => {
        let contactName = contactItem.querySelector(".contact-name").textContent.toLowerCase();
        let shouldShow = contactName.startsWith(filter);
        contactItem.style.display = shouldShow ? "flex" : "none";
    });
}


function resetFilter() {
    let searchContacts = document.getElementById("searchContacts");
    let contactItems = document.querySelectorAll(".contact-item");

    if (searchContacts) searchContacts.value = "";
    contactItems.forEach(contactItem => {
        contactItem.style.display = "flex";
    });
}


function renderContactListWithSelection() {
    let contactItems = document.querySelectorAll(".contact-item");

    contactItems.forEach(contactItem => {
        let contactId = contactItem.dataset.id;
        let checkbox = contactItem.querySelector(".contact-checkbox");
        if (checkbox) {
            checkbox.checked = selectedContacts.some(contact => contact.id === contactId);
        }
        contactItem.removeEventListener("click", handleContactItemClick);
        contactItem.addEventListener("click", handleContactItemClick);
        if (checkbox) {
            checkbox.removeEventListener("click", handleCheckboxClick);
            checkbox.addEventListener("click", handleCheckboxClick);
        }
    });
}


function handleContactItemClick(event) {
    let contactItem = event.currentTarget;
    let checkbox = contactItem.querySelector(".contact-checkbox");

    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        handleContactSelection(contactItem, checkbox.checked);
    }
}


function handleCheckboxClick(event) {
    event.stopPropagation();
    handleContactItemClick({ currentTarget: event.currentTarget.closest(".contact-item") });
}


function handleContactSelection(contactItem, isChecked) {
    let contactId = contactItem.dataset.id;
    let contact = contacts.find(c => c.id === contactId);

    if (contact) {
        if (isChecked) {
            if (!selectedContacts.some(c => c.id === contactId)) {
                selectedContacts.push(contact);
            }
            contactItem.classList.add("selected");
        } else {
            selectedContacts = selectedContacts.filter(c => c.id !== contactId);
            contactItem.classList.remove("selected");
        }

        updateSelectedContactInitials();
    }
}


function updateSelectedContactInitials() {
    let assignedToContainer = document.querySelector(".addTask-assignedTo-container");
    let selectedContactsDiv = document.querySelector(".selected-contacts");

    if (selectedContactsDiv) selectedContactsDiv.remove();

    if (selectedContacts.length > 0) {
        let initialsHTML = selectedContacts
            .map(contact => `
                <div class="contact-initials" style="background-color: ${contact.color};">
                    ${contact.name.split(" ").map(name => name[0]).join("").toUpperCase()}
                </div>
            `)
            .join("");

        let newSelectedContactsDiv = document.createElement("div");
        newSelectedContactsDiv.className = "selected-contacts";
        newSelectedContactsDiv.innerHTML = initialsHTML;

        assignedToContainer.appendChild(newSelectedContactsDiv);
    }
}


// Prio-Buttons
function setupPriorityButtons() {
    let urgentButton = document.getElementById('task-urgent');
    let mediumButton = document.getElementById('task-medium');
    let lowButton = document.getElementById('task-low');

    if (urgentButton && mediumButton && lowButton) {
        let priorityButtons = [urgentButton, mediumButton, lowButton];
        priorityButtons.forEach(button => {
            button.addEventListener('click', () => handlePriorityClick(button, priorityButtons));
        });
    }
}


function handlePriorityClick(selectedButton, allButtons) {
    let isActive = checkIfButtonActive(selectedButton);
    resetAllButtons(allButtons);

    if (!isActive) {
        activateButton(selectedButton);
    } else {
        taskPriority = "";
    }
}


function checkIfButtonActive(button) {
    return button.classList.contains('urgent-active') ||
        button.classList.contains('middle-active') ||
        button.classList.contains('low-active');
}


function resetAllButtons(buttons) {
    buttons.forEach(button => {
        button.classList.remove('urgent-active', 'middle-active', 'low-active');
        updateButtonSVG(button, false);
    });
}


function activateButton(button) {
    if (button.id === 'task-urgent') {
        button.classList.add('urgent-active');
        taskPriority = "high";
    } else if (button.id === 'task-medium') {
        button.classList.add('middle-active');
        taskPriority = "medium";
    } else if (button.id === 'task-low') {
        button.classList.add('low-active');
        taskPriority = "low";
    }

    updateButtonSVG(button, true);
}


function updateButtonSVG(button, isActive) {
    let svgPaths = button.querySelectorAll("svg path");
    let color = getButtonColor(button, isActive);

    svgPaths.forEach(path => {
        path.setAttribute("fill", color);
    });
}


function getButtonColor(button, isActive) {
    if (isActive) return "white";

    if (button.id === 'task-urgent') return "#FF3D00";
    if (button.id === 'task-medium') return "#FF9900";
    if (button.id === 'task-low') return "#7ae229";

    return "";
}




//********************************************************************************** */


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
    let contactListElement = document.getElementById("contactList");

    if (contactListElement) {
        contactListElement.addEventListener("click", (event) => {
            let target = event.target;
            let contactItem = target.closest(".contact-item");
            if (!contactItem) return;

            let checkbox = contactItem.querySelector(".contact-checkbox");
            if (!checkbox) return;

            // Toggle the selection state
            let isSelected = checkbox.checked;
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

document.addEventListener("click", (event) => {
    // Prüfe, ob das geklickte Element die Klasse 'addTask-date-icon' hat
    let dateIcon = event.target.closest(".addTask-date-icon");
    if (dateIcon) {
        let dateInput = document.getElementById("task-dueDate");
        if (dateInput) {
            dateInput.showPicker(); // Öffnet den nativen Datepicker
        } else {
            console.error("Element '#task-dueDate' nicht gefunden.");
        }
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
    let subtaskInput = document.querySelector(".addTask-subtasks-content");
    let addIcon = document.querySelector(".addTask-subtasks-icon-add");
    let iconsContainer = document.querySelector(".addTask-icons-input");

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
    let input = document.getElementById("addTaskNewSubTaskInput");
    let subtaskName = input.value.trim();

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


function deleteSubtask(index) {
    tasks[currentTaskIndex].subtasks.splice(index, 1);
    updateSubtasksList();
}


function saveSubtask(index) {
    let input = document.getElementById("editSubtaskInput");
    let newName = input.value.trim();

    if (newName === "") {
        alert("Bitte geben Sie einen gültigen Namen für den Subtask ein.");
        return;
    }

    tasks[currentTaskIndex].subtasks[index].name = newName;
    editingSubtaskIndex = null;
    updateSubtasksList();
}
