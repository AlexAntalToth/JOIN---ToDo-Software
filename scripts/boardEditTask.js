/**
 * Edits the currently selected task by toggling between task view and edit view.
 * Sets up subtasks, populates selected contacts, and initializes the task editing interface.
 */
function editTask() {
    if (currentTaskIndex === null) return;
    let task = tasks[currentTaskIndex].task;
    isEditing = true;
    task.subtasks = task.subtasks || {};
    let taskView = document.getElementById("taskView");
    let taskEdit = document.getElementById("taskEdit");
    taskView.classList.add("hidden");
    taskEdit.classList.remove("hidden");
    taskEdit.innerHTML = generateTaskEditHTML(task);
    updateSubtasksList(task);
    setupSubtaskInput();
    populateSelectedContacts();
}


/**
 * Populates the selected contacts section with the assigned contacts of the current task.
 * Creates a profile circle for each contact.
 */
function populateSelectedContacts() {
    let selectedContacts = document.getElementById("selectedContacts");
    selectedContacts.innerHTML = "";
    const assignedTo = tasks[currentTaskIndex]?.task?.assignedTo || {};
    Object.values(assignedTo).forEach(({ name, color }) => {
        if (name && color) {
            let profileCircle = createProfileCircle({ name, color });
            selectedContacts.appendChild(profileCircle);
        }
    });
}


/**
 * Capitalizes the first letter of a given string.
 * @param {string} str The string to capitalize.
 * @returns {string} The string with the first letter capitalized.
 */
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * Sets the priority of a task by toggling the active state of the priority buttons.
 * @param {string} priority The priority level to set.
 */
function setPriority(priority) {
    let activeButton = getActivePriorityButton();
    let clickedButton = document.querySelector(`.priority-btn[data-priority="${priority}"]`);
    if (clickedButton !== activeButton) {
        updatePriorityButtonState(clickedButton);
    }
}


/**
 * Retrieves the currently active priority button.
 * @returns {HTMLElement} The active priority button.
 */
function getActivePriorityButton() {
    let activeButton = null;
    let priorityButtons = document.querySelectorAll(".priority-btn");
    priorityButtons.forEach(btn => btn.classList.remove("active"));
    priorityButtons.forEach(btn => {
        if (btn.classList.contains("active")) {
            activeButton = btn;
        }
    });
    return activeButton;
}


/**
 * Updates the state of the priority button by marking it as active.
 * @param {HTMLElement} clickedButton The priority button to mark as active.
 */
function updatePriorityButtonState(clickedButton) {
    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}


/**
 * Toggles the dropdown visibility and icon rotation. 
 * Handles opening and closing of the dropdown and adds/removes event listeners accordingly.
 */
function toggleDropdown() {
    let dropdown = document.querySelector(".dropdown");
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    let icon = document.querySelector(".dropdown-toggle .dropdown-icon");
    dropdown.classList.toggle("open");
    icon.classList.toggle("rotated");
    if (dropdown.classList.contains("open")) {
        handleDropdownOpen(dropdown, dropdownToggle);
    } else {
        handleDropdownClose(dropdownToggle);
    }
}


/**
 * Handles the actions when the dropdown is opened.
 * Switches to the search input, updates dropdown items, and adds an event listener for clicks outside the dropdown.
 * @param {HTMLElement} dropdown The dropdown element.
 * @param {HTMLElement} dropdownToggle The dropdown toggle button element.
 */
function handleDropdownOpen(dropdown, dropdownToggle) {
    switchToSearchInput(dropdownToggle);
    updateDropdownItems(dropdown);
    document.addEventListener("click", handleOutsideClick);
}


/**
 * Handles the actions when the dropdown is closed.
 * Removes focus from the toggle button and resets its state.
 * @param {HTMLElement} dropdownToggle The dropdown toggle button element.
 */
function handleDropdownClose(dropdownToggle) {
    dropdownToggle.blur();
    resetToDropdownButton(dropdownToggle);
    document.removeEventListener("click", handleOutsideClick);
}


/**
 * Handles clicks outside the dropdown to close it if clicked outside.
 * @param {Event} event The click event.
 */
function handleOutsideClick(event) {
    let dropdown = document.querySelector(".dropdown");
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    if (!dropdown.contains(event.target) && !dropdownToggle.contains(event.target)) {
        dropdown.classList.remove("open");
        let icon = document.querySelector(".dropdown-toggle .dropdown-icon");
        icon.classList.remove("rotated");
        resetToDropdownButton(dropdownToggle);
        document.removeEventListener("click", handleOutsideClick);
    }
}


/**
 * Toggles the checked state of a dropdown item and updates the task assignment and item style accordingly.
 * @param {HTMLElement} item The dropdown item element.
 */
function toggleDropdownItem(item) {
    let checkbox = item.querySelector("input[type='checkbox']");
    if (!checkbox) return;
    checkbox.checked = !checkbox.checked;
    let contactKey = checkbox.value;
    let contact = contacts[contactKey];
    updateTaskAssignment(contactKey, checkbox.checked);
    updateItemStyle(item, checkbox.checked);
    updateSelectedContactsDisplay(contact, checkbox.checked);
}


/**
 * Updates the task's assignment of a contact based on the checkbox state.
 * @param {string} contactKey The key of the contact.
 * @param {boolean} isChecked The checked state of the checkbox.
 */
function updateTaskAssignment(contactKey, isChecked) {
    let task = tasks[currentTaskIndex].task;
    task.assignedTo = task.assignedTo || {};

    if (isChecked) {
        task.assignedTo[contactKey] = true;
    } else {
        delete task.assignedTo[contactKey];
        if (Object.keys(task.assignedTo).length === 0) {
            delete task.assignedTo;
        }
    }
}


/**
 * Updates the display of selected contacts by either adding or removing their profile circle.
 * @param {Object} contact The contact object containing the contact's details.
 * @param {boolean} isSelected Whether the contact is selected or not.
 */
function updateSelectedContactsDisplay(contact, isSelected) {
    let selectedContacts = document.getElementById("selectedContacts");
    if (isSelected) {
        let profileCircle = createProfileCircle(contact);
        selectedContacts.appendChild(profileCircle);
    } else {
        removeProfileCircle(contact.id);
    }
}


/**
 * Removes a profile circle from the display based on the contact's key.
 * @param {string} contactKey The unique identifier of the contact.
 */
function removeProfileCircle(contactKey) {
    let selectedContacts = document.getElementById("selectedContacts");
    let profileCircle = selectedContacts.querySelector(`[data-contact-key="${contactKey}"]`);
    if (profileCircle) {
        selectedContacts.removeChild(profileCircle);
    }
}


/**
 * Filters the dropdown items based on the search input value.
 * Items whose contact name includes the search term will remain visible.
 */
function filterDropdownItems() {
    let searchInput = document.getElementById("dropdownSearchInput")
    let searchTerm = searchInput.value.toLowerCase();
    let dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => {
        let contactName = item.querySelector("p").textContent.toLowerCase();
        if (contactName.includes(searchTerm)) {
            item.style.display = ""; 
        } else {
            item.style.display = "none";
        }
    });
}


/**
 * Updates the style of dropdown items based on the checked state of their associated checkbox.
 * @param {HTMLElement} dropdown The dropdown element containing the items.
 */
function updateDropdownItems(dropdown) {
    let items = dropdown.querySelectorAll(".dropdown-item");
    items.forEach(item => {
        let checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox) {
            updateItemStyle(item, checkbox.checked);
        }
    });
}


/**
 * Toggles the style of an item based on its checked state.
 * @param {HTMLElement} item The dropdown item element.
 * @param {boolean} isChecked Whether the item is checked or not.
 */
function updateItemStyle(item, isChecked) {
    item.classList.toggle("checked", isChecked);
}


/**
 * Updates the HTML content of a task by replacing its task div with the newly generated task HTML.
 * @param {number} taskIndex The index of the task in the tasks array.
 */
function updateTaskHtml(taskIndex) {
    let task = tasks[taskIndex].task;
    let taskDiv = document.getElementById(`task-${taskIndex}`);
    if (taskDiv) {
        taskDiv.outerHTML = generateTaskHtml(task, taskIndex, contacts);
    }
}


/**
 * Saves the changes made to the current task by updating its fields and saving the data to the database.
 * Refreshes the task popup and updates the task HTML after saving the changes.
 */
async function saveTaskChanges() {
    let taskObj = tasks[currentTaskIndex];
    if (!taskObj || !taskObj.id) return handleError();
    let task = taskObj.task;
    task = updateTaskFields(task);
    await updateTaskData(taskObj.id, task);
    refreshTaskPopup();
    updateTaskHtml(currentTaskIndex);
}


/**
 * Updates the fields of the task object with the current values from the task edit form.
 * @param {Object} task The task object to be updated.
 * @returns {Object} The updated task object.
 */
function updateTaskFields(task) {
    task.title = document.getElementById("editTaskTitle").value;
    task.description = document.getElementById("editTaskDescription").value;
    task.dueDate = document.getElementById("editTaskDueDate").value;
    task.priority = document.querySelector(".priority-btn.active")?.getAttribute("data-priority");
    task.assignedTo = getAssignedContacts();
    task.subtasks = getCurrentSubtasks();
    return task;
}


/**
 * Updates the task data in the database by sending a PUT request with the updated task information.
 * @param {string} taskId The ID of the task to be updated.
 * @param {Object} task The updated task object.
 */
async function updateTaskData(taskId, task) {
    await putData(`tasks/${taskId}`, task);
    tasks[currentTaskIndex].task = task;
    isEditing = false;
}


/**
 * Gets the list of assigned contacts for the current task from the dropdown items.
 * @returns {Object} An object containing the assigned contacts with their names and colors.
 */
function getAssignedContacts() {
    let assignedContacts = {};
    let dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => processDropdownItem(item, assignedContacts));
    return assignedContacts;
}


/**
 * Processes each dropdown item to check if a contact is selected (checked).
 * If the contact is selected, it adds the contact to the assigned contacts list.
 * @param {Element} item The dropdown item element to process.
 * @param {Object} assignedContacts The object to store the assigned contacts.
 */
function processDropdownItem(item, assignedContacts) {
    let checkbox = item.querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
        let contactKey = checkbox.value;
        addContactToAssigned(contactKey, assignedContacts);
    }
}


/**
 * Adds a contact to the assigned contacts object by its key.
 * If the contact exists in the `contacts` object, it adds the contact's name and color to the assigned contacts.
 * @param {string} contactKey The key of the contact to add.
 * @param {Object} assignedContacts The object to store the assigned contacts.
 */
function addContactToAssigned(contactKey, assignedContacts) {
    if (contacts[contactKey]) {
        assignedContacts[contactKey] = {
            name: contacts[contactKey].name,
            color: contacts[contactKey].color
        };
    } else {
        console.warn(`Kontakt mit ID "${contactKey}" existiert nicht in contacts.`);
    }
}


/**
 * Refreshes the task popup by showing the task view and updating the task details.
 */
function refreshTaskPopup() {
    showTaskView();
    let task = tasks[currentTaskIndex].task;
    updateTaskDetails(task);
}


/**
 * Shows the task view and hides the task edit view in the task popup.
 */
function showTaskView() {
    let taskView = document.getElementById("taskView");
    let taskEdit = document.getElementById("taskEdit");
    let taskPopup = document.getElementById("taskPopup");
    taskView.classList.remove("hidden");
    taskEdit.classList.add("hidden");
    if (!taskPopup.classList.contains("show")) {
        taskPopup.classList.add("show");
    }
}


/**
 * Updates the task details in the task popup with the current task's data.
 * @param {Object} task The task object containing the task's details.
 */
function updateTaskDetails(task) {
    document.getElementById("taskBadge").innerHTML = generateTaskBadge(task.badge);
    document.getElementById("taskTitle").innerHTML = task.title;
    document.getElementById("taskDescription").innerHTML = task.description;
    document.getElementById("taskDueDate").innerHTML = formatDateToDDMMYYYY(task.dueDate);
    generateTaskPriorityElement(task.priority);
    document.getElementById("taskContacts").innerHTML = generateContactsHtml(task.assignedTo, contacts);
    document.getElementById("subtasksList").innerHTML = generateSubtasksHtml(task.subtasks, currentTaskIndex);
}
