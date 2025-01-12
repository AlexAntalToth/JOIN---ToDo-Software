//Validation
/**
 * Validates the input fields (title, category, and due date) and updates the state of the "Create" button.
 *
 * This function checks whether the title is empty, a category is selected, and if the due date is valid.
 * If any of these fields are invalid or empty, the "Create" button will be disabled.
 *
 * @function
 * @returns {void}
 */
function validateFields() {
    let titleField = document.getElementById("task-title");
    let categoryDropdown = document.getElementById("categoryDropdown");
    let dueDateField = document.getElementById("task-dueDate");
    let isTitleEmpty = titleField.value.trim() === "";
    let isCategoryEmpty = !categoryDropdown.getAttribute("data-selected");
    let isDueDateEmpty = dueDateField.value.trim() === "";
    let isDueDateInvalid = false;
    if (!isDueDateEmpty) {
        isDueDateInvalid = validateDateInput();
    }
    updateCreateButtonState(isTitleEmpty, isCategoryEmpty, isDueDateEmpty, isDueDateInvalid);
}


/**
 * Validates the date input field by checking both format and validity.
 * 
 * @function
 * @returns {boolean} True if the date input is invalid (either format or date), otherwise false.
 */
function validateDateInput() {
    if (validateDateFormat()) {
        return true;
    }
    return validateDateValidity();
}


/**
 * Validates the date format to be in DD/MM/YYYY format.
 * 
 * @function
 * @returns {boolean} True if the date format is invalid, otherwise false.
 */
function validateDateFormat() {
    let dueDateField = document.getElementById("task-dueDate");
    let dueDateValue = dueDateField.value.trim();
    let datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    return !datePattern.test(dueDateValue);
}


/**
 * Validates if the date is valid.
 * 
 * @function
 * @returns {boolean} True if the date is invalid, otherwise false.
 */
function validateDateValidity() {
    let dueDateField = document.getElementById("task-dueDate");
    let dueDateValue = dueDateField.value.trim();
    let dueDateParts = dueDateValue.split("/");
    let day = parseInt(dueDateParts[0], 10);
    let month = parseInt(dueDateParts[1], 10) - 1;
    let year = parseInt(dueDateParts[2], 10);
    let date = new Date(year, month, day);
    return isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year;
}


/**
 * Attaches event listeners to the necessary form fields to trigger validation.
 * 
 * @function attachEventListeners
 * @returns {void} This function does not return any value. It calls individual functions to attach event listeners.
 */
function attachEventListeners() {
    attachDueDateListener();
    attachTitleListener();
    attachCategoryListener();
}


/**
 * Attaches the input event listener to the due date field to trigger validation.
 * 
 * @function attachDueDateListener
 */
function attachDueDateListener() {
    let dueDateField = document.getElementById("task-dueDate");
    if (dueDateField) {
        dueDateField.addEventListener("input", () => {
            validateFields();
        });
    }
}

/**
 * Attaches the input event listener to the title field to trigger validation.
 * 
 * @function attachTitleListener
 */
function attachTitleListener() {
    let titleField = document.getElementById("task-title");
    if (titleField) {
        titleField.addEventListener("input", () => {
            validateFields();
        });
    }
}

/**
 * Attaches the change event listener to the category dropdown to trigger validation.
 * 
 * @function attachCategoryListener
 */
function attachCategoryListener() {
    let categoryDropdown = document.getElementById("categoryDropdown");
    if (categoryDropdown) {
        categoryDropdown.addEventListener("change", () => {
            validateFields();
        });
    }
}


/**
 * Validates the task form fields and saves the task if all fields are valid.
 * It checks if the title, category, and due date fields are not empty.
 * If the fields are valid, it triggers the save of the new task.
 * 
 * @param {Event} event - The event object triggered by the form submission.
 */
function validateAndSaveTask(event) {
    event.preventDefault();
    let titleField = document.getElementById("task-title");
    let categoryDropdown = document.getElementById("categoryDropdown");
    let dueDateField = document.getElementById("task-dueDate");
    let isTitleEmpty = isFieldEmpty(titleField, "value");
    let isCategoryEmpty = isFieldEmpty(categoryDropdown, "data-selected");
    let isDueDateEmpty = isFieldEmpty(dueDateField, "value");
    updateCreateButtonState(isTitleEmpty, isCategoryEmpty, isDueDateEmpty);
    if (!isTitleEmpty && !isCategoryEmpty && !isDueDateEmpty) saveNewTask();
}


/**
 * Checks if a form field is empty based on the specified field type (e.g., "value" or "data-selected").
 * 
 * @param {HTMLElement} field - The form field element to check.
 * @param {string} fieldType - The type of the field to check, either "value" or "data-selected".
 * @returns {boolean} - Returns true if the field is empty, false otherwise.
 */
function isFieldEmpty(field, fieldType) {
    let fieldValue = fieldType === "value" ? field.value.trim() : field.getAttribute(fieldType);
    return !fieldValue;
}


/**
 * Resets the form fields to their default values. This includes clearing the input fields for 
 * the task title, description, due date, and resetting the category dropdown. It also clears 
 * the selected contacts and updates the state of the create button.
 *
 * @function resetFormFields
 * @returns {void} This function does not return any value. It modifies the DOM elements directly.
 */
function resetFormFields() {
    let taskTitle = document.getElementById("task-title");
    if (taskTitle) taskTitle.value = "";
    let taskDescription = document.getElementById("task-description");
    if (taskDescription) taskDescription.value = "";
    let taskDueDate = document.getElementById("task-dueDate");
    if (taskDueDate) taskDueDate.value = "";
    let categoryDropdown = document.getElementById("categoryDropdown");
    if (categoryDropdown) categoryDropdown.setAttribute('data-selected', '');
    selectedContacts = [];
    updateCreateButtonState(true, true, true);
}

/**
 * Updates the state and styling of the "Create" button based on input validation.
 *
 * @param {boolean} isTitleEmpty - Indicates whether the title field is empty.
 * @param {boolean} isCategoryEmpty - Indicates whether a category is selected.
 * @param {boolean} isDueDateEmpty - Indicates whether the due date field is empty.
 * @param {boolean} isDueDateInvalid - Indicates whether the due date is invalid.
 *
 * The button is disabled and styled as inactive if any of the parameters are `true`.
 * Otherwise, the button is enabled and styled as active.
 */
function updateCreateButtonState(isTitleEmpty, isCategoryEmpty, isDueDateEmpty, isDueDateInvalid) {
    let createButton = document.querySelector(".create-addTask-button");
    if (!createButton) {
        return;
    }
    let isDisabled = isTitleEmpty || isCategoryEmpty || isDueDateEmpty || isDueDateInvalid;
    createButton.style.backgroundColor = isDisabled ? "grey" : "";
    createButton.style.cursor = isDisabled ? "not-allowed" : "pointer";
    createButton.disabled = isDisabled;
}


/**
 * Attaches validation event listeners to form fields to ensure they are properly validated.
 * This function adds event listeners to the following fields:
 * - Task title (`input` event)
 * - Task category (`change` event)
 * - Task due date (`change` event)
 * When the value of any of these fields changes, the `validateAndSaveTask` function is called to validate the form.
 * 
 */
function attachValidationListeners() {
    let fields = [
        { id: "task-title", event: "input" },
        { id: "categoryDropdown", event: "change" },
        { id: "task-dueDate", event: "change" },
    ];
    fields.forEach(({ id, event }) => {
        let element = document.getElementById(id);
        if (!element) {
        } else {
            element.addEventListener(event, () => {
                validateAndSaveTask({ preventDefault: () => { } });
            });
        }
    });
}


//Error message
/**
 * Displays an error message in a designated error box.
 * This function will show the provided error message in the error message box (`#error-message-box`) 
 * and ensure it stays visible for 2.5 seconds before being automatically hidden.
 * 
 * @param {string} message - The error message to be displayed.
 */
function showErrorMessage(message) {
    let errorBox = document.getElementById("error-message-box");
    errorBox.textContent = message;
    errorBox.classList.add("show");
    setTimeout(() => {
        errorBox.classList.remove("show");
    }, 2500);
}