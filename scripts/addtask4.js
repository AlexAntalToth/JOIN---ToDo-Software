// Subtasks
/**
 * Sets up the subtask input functionality, including adding subtasks and handling the cancel button.
 * 
 * @function
 */
function setupSubtaskInput() {
    let subtaskInput = document.querySelector(".addTask-subtasks-content");
    let addIcon = document.querySelector(".addTask-subtasks-icon-add");
    let iconsContainer = document.querySelector(".addTask-icons-input");
    if (subtaskInput && addIcon && iconsContainer) {
        initializeSubtaskInput(subtaskInput, addIcon, iconsContainer);
    }
    let cancelButton = document.querySelector('.cancel-addTask-icon');
    if (cancelButton) {
        setupCancelButton(cancelButton);
    }
}


/**
 * Initializes the subtask input functionality, including focus and blur event listeners
 * and handling the Enter key press.
 * 
 * @param {HTMLElement} subtaskInput - The input field for entering subtasks.
 * @param {HTMLElement} addIcon - The icon for adding subtasks.
 * @param {HTMLElement} iconsContainer - The container that holds the icons.
 * @function
 */
function initializeSubtaskInput(subtaskInput, addIcon, iconsContainer) {
    showAddIconAndIconsContainer(addIcon, iconsContainer);
    subtaskInput.addEventListener("focus", () => handleFocus(addIcon, iconsContainer));
    subtaskInput.addEventListener("blur", () => handleBlur(subtaskInput, addIcon, iconsContainer));
    subtaskInput.addEventListener("keydown", (event) => handleEnterKey(event));
}


/**
 * Shows the add icon and the icons container by removing the "hidden" and "active" classes.
 * 
 * @param {HTMLElement} addIcon - The icon for adding a subtask.
 * @param {HTMLElement} iconsContainer - The container holding the icons.
 * @function
 */
function showAddIconAndIconsContainer(addIcon, iconsContainer) {
    addIcon.classList.remove("hidden");
    iconsContainer.classList.remove("active");
}


/**
 * Handles the focus event on the subtask input field by hiding the add icon and showing the icons container.
 * 
 * @param {HTMLElement} addIcon - The icon for adding a subtask.
 * @param {HTMLElement} iconsContainer - The container holding the icons.
 * @function
 */
function handleFocus(addIcon, iconsContainer) {
    addIcon.classList.add("hidden");
    iconsContainer.classList.add("active");
}


/**
 * Handles the blur event on the subtask input field by showing the add icon and hiding the icons container if the input is empty.
 * 
 * @param {HTMLElement} subtaskInput - The subtask input field.
 * @param {HTMLElement} addIcon - The icon for adding a subtask.
 * @param {HTMLElement} iconsContainer - The container holding the icons.
 * @function
 */
function handleBlur(subtaskInput, addIcon, iconsContainer) {
    if (!subtaskInput.value.trim()) {
        addIcon.classList.remove("hidden");
        iconsContainer.classList.remove("active");
    }
}


/**
 * Handles the 'Enter' key press event by preventing the default behavior and triggering the subtask addition.
 * 
 * @param {KeyboardEvent} event - The keyboard event triggered when a key is pressed.
 * @function
 */
function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addSubtask();
    }
}


/**
 * Sets up the cancel button to clear the subtask input when clicked.
 * 
 * @param {HTMLElement} cancelButton - The cancel button element.
 * @function
 */
function setupCancelButton(cancelButton) {
    cancelButton.addEventListener('click', clearSubtaskInput);
}


/**
 * Clears the value of the subtask input field.
 * 
 * @function
 */
function clearSubtaskInput() {
    let subtaskInput = document.getElementById('addTaskNewSubTaskInput');
    if (subtaskInput) {
        subtaskInput.value = '';
    }
}


/**
 * Adds a new subtask based on the value entered in the subtask input field.
 * Validates the input value and if valid, creates a new subtask.
 * 
 * @function
 */
function addSubtask() {
    let input = document.getElementById("addTaskNewSubTaskInput");
    let subtaskName = validateSubtask(input.value);
    if (subtaskName) {
        createSubtask(subtaskName);
        input.value = "";
    }
}


/**
 * Validates the input value for a subtask.
 * Trims the input value and checks if it is empty.
 * If the input is empty, it displays an error message.
 * 
 * @param {string} inputValue - The value entered for the subtask.
 * @returns {string|null} The validated subtask name, or null if the input is empty.
 */
function validateSubtask(inputValue) {
    let subtaskName = inputValue.trim();
    if (subtaskName === "") {
        showErrorMessage("Please enter a subtask.");
        return null;
    }
    return subtaskName;
}


/**
 * Creates a new subtask and adds it to the current task's subtasks list.
 * Updates the displayed list of subtasks.
 * 
 * @param {string} subtaskName - The name of the subtask to be added.
 */
function createSubtask(subtaskName) {
    tasks[currentTaskIndex].subtasks.push({ name: subtaskName, completed: false });
    updateSubtasksList();
}


/**
 * Deletes a subtask from the current task's subtasks list by its index.
 * Updates the displayed list of subtasks.
 * 
 * @param {number} index - The index of the subtask to be deleted.
 */
function deleteSubtask(index) {
    tasks[currentTaskIndex].subtasks.splice(index, 1);
    updateSubtasksList();
}


/**
 * Saves the edited subtask name and updates the subtasks list.
 * Displays an error message if the input is empty.
 * 
 * @param {number} index - The index of the subtask to be saved.
 */
function saveSubtask(index) {
    let input = document.getElementById("editSubtaskInput");
    let newName = input.value.trim();
    if (newName === "") {
        showErrorMessage("Please enter a valid subtask.");
        return;
    }
    tasks[currentTaskIndex].subtasks[index].name = newName;
    editingSubtaskIndex = null;
    updateSubtasksList();
}


//Clear and Create Buttons
/**
 * Sets up the click event listener for the create task button.
 * When clicked, it triggers the `validateAndSaveTask` function.
 */
function setupCreateButton() {
    let createButton = document.querySelector(".create-addTask-button");
    if (createButton) {
        createButton.addEventListener("click", validateAndSaveTask);
    }
}


/**
 * Sets up the click event listener for the clear task button.
 * When clicked, it clears the fields, resets the category and contacts,
 * clears subtasks, and re-renders the task card and updates the subtasks list.
 */
function setupClearButton() {
    let clearButton = document.querySelector(".clear-addTask-button");
    if (!clearButton) return;
    clearButton.addEventListener("click", () => {
        clearFields();
        resetCategory();
        resetContacts();
        clearSubtasks();
        renderAddTaskCard();
        updateSubtasksList();
        updateSelectedContactInitials();
    });
}


/**
 * Clears the values of the task fields, including title, description, and due date.
 * Also removes the "selected" class from all priority buttons.
 */
function clearFields() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-dueDate").value = "";
    document.querySelectorAll(".addTask-prio-button").forEach(button => button.classList.remove("selected"));
}


/**
 * Resets the category field and dropdown.
 * Clears the selected category and resets the dropdown items to their default state.
 */
function resetCategory() {
    let categoryField = document.getElementById("task-category");
    categoryField.innerHTML = `<span>Select task category</span>`;
    let categoryDropdown = document.getElementById("categoryDropdown");
    if (categoryDropdown) {
        categoryDropdown.querySelectorAll(".category-item").forEach(item => {
            item.classList.remove("selected");
        });
    }
}


/**
 * Resets the contacts selection and UI.
 * Unchecks all contact checkboxes, clears the selected contacts list, 
 * and resets the assigned to field and contact list display.
 */
function resetContacts() {
    document.querySelectorAll(".contact-checkbox").forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedContacts = [];
    let assignedToField = document.getElementById("task-assignedTo");
    assignedToField.innerHTML = "<span>Select contacts to assign</span>";
    let contactList = document.getElementById("contactList");
    if (contactList) {
        contactList.style.display = "none";
    }
}


/**
 * Clears all subtasks for the current task.
 * Resets the subtasks array for the task at the current index.
 */
function clearSubtasks() {
    tasks[currentTaskIndex].subtasks = [];
}
