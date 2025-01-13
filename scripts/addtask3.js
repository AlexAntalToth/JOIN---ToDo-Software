//Due Date
/**
 * Sets up the input event listener on the due date field to trigger validation 
 * whenever the user changes the value in the field.
 * 
 */
function setupDueDateValidation() {
    let dueDateField = document.getElementById("task-dueDate");
    if (dueDateField) {
        dueDateField.addEventListener("input", () => {
            validateFields();
        });
    }
}


/**
 * Sets up a click event listener on the document to detect when the date icon 
 * is clicked and trigger the corresponding handler.
 * 
 */
function setupDateIconClickListener() {
    document.addEventListener("click", (event) => {
        handleDateIconClick(event);
    });
}


/**
 * Handles a click on the date icon and attaches a validation listener to the date input field.
 *
 * @param {Event} event - The click event triggered by the user.
 */
function handleDateIconClick(event) {
    let dateIcon = event.target.closest(".addTask-date-icon");
    if (dateIcon) {
        let dateInput = document.getElementById("task-dueDate");
        if (dateInput) {
            dateInput.addEventListener("change", () => {
                validateFields();
            });
        }
    }
}


// Prio-Buttons
/**
 * Sets up event listeners on the priority buttons (urgent, medium, low) to 
 * handle clicks and update the task's priority accordingly. When a button is 
 * clicked, it calls `handlePriorityClick` to update the priority and highlight 
 * the selected button.
 * 
 * @function
 */
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


/**
 * Handles the click event on a priority button. It checks if the clicked button 
 * is already active, and if not, it activates the button. If the button is active, 
 * it resets the task's priority. It also ensures that only one button is active at a time.
 *
 * @param {HTMLElement} selectedButton - The button that was clicked.
 * @param {HTMLElement[]} allButtons - An array of all priority buttons.
 */
function handlePriorityClick(selectedButton, allButtons) {
    let isActive = checkIfButtonActive(selectedButton);
    resetAllButtons(allButtons);
    if (!isActive) {
        activateButton(selectedButton);
    } else {
        taskPriority = "";
    }
}


/**
 * Checks if a given priority button is currently active by looking for specific 
 * active classes that indicate its state.
 *
 * @param {HTMLElement} button - The priority button to check.
 * @returns {boolean} - Returns `true` if the button is active, otherwise `false`.
 */
function checkIfButtonActive(button) {
    return button.classList.contains('urgent-active') ||
        button.classList.contains('middle-active') ||
        button.classList.contains('low-active');
}


/**
 * Resets the state of all priority buttons by removing the active classes
 * and updating the associated SVG elements to their inactive state.
 *
 * @param {HTMLElement[]} buttons - An array of priority button elements to reset.
 */
function resetAllButtons(buttons) {
    buttons.forEach(button => {
        button.classList.remove('urgent-active', 'middle-active', 'low-active');
        updateButtonSVG(button, false);
    });
}


/**
 * Activates the corresponding button for the task priority and sets the `taskPriority` value.
 * Adds an active class to the button and updates the button's SVG icon.
 * 
 * @param {HTMLElement} button - The button to be activated (e.g., `task-urgent`, `task-medium`, `task-low`).
 * @returns {void}
 */
function activateButton(button) {
    if (button.id === 'task-urgent') {
        button.classList.add('urgent-active');
        taskPriority = "urgent";
    } else if (button.id === 'task-medium') {
        button.classList.add('middle-active');
        taskPriority = "medium";
    } else if (button.id === 'task-low') {
        button.classList.add('low-active');
        taskPriority = "low";
    }
    updateButtonSVG(button, true);
}


/**
 * Updates the SVG path color of the button based on its active state.
 * Sets the fill color of the SVG paths to match the button's priority color.
 * 
 * @param {HTMLElement} button - The button containing the SVG to update.
 * @param {boolean} isActive - Whether the button is active or not.
 * @returns {void}
 */
function updateButtonSVG(button, isActive) {
    let svgPaths = button.querySelectorAll("svg path");
    let color = getButtonColor(button, isActive);
    svgPaths.forEach(path => {
        path.setAttribute("fill", color);
    });
}


/**
 * Returns the color associated with the button based on its active state and ID.
 * The color is used to fill the SVG paths of the button.
 * 
 * @param {HTMLElement} button - The button element for which the color is determined.
 * @param {boolean} isActive - Whether the button is active or not.
 * @returns {string} The color to apply to the button's SVG paths.
 */
function getButtonColor(button, isActive) {
    if (isActive) return "white";
    if (button.id === 'task-urgent') return "#FF3D00";
    if (button.id === 'task-medium') return "#FF9900";
    if (button.id === 'task-low') return "#7ae229";
    return "";
}


//Category
/**
 * Sets up the functionality for the category dropdown field.
 * - Initializes the dropdown toggle behavior.
 * - Handles icon wrapper toggle and dropdown selection.
 * - Implements click outside to close the dropdown.
 * 
 */
function setupCategoryDropdown() {
    let categoryField = document.getElementById("task-category");
    let dropdown = document.getElementById("categoryDropdown");
    let iconWrapper = document.querySelector(".addTask-category-icon-wrapper");
    if (categoryField && dropdown && iconWrapper) {
        setupCategoryFieldToggle(categoryField, dropdown);
        setupIconWrapperToggle(iconWrapper, categoryField, dropdown);
        setupDropdownSelection(dropdown, categoryField);
        setupClickOutsideDropdown(dropdown, categoryField);
    }
}


/**
 * Sets up the click event listener for the category field to toggle the visibility of the dropdown.
 * 
 * @param {HTMLElement} categoryField - The category field element.
 * @param {HTMLElement} dropdown - The category dropdown element.
 */
function setupCategoryFieldToggle(categoryField, dropdown) {
    categoryField.addEventListener("click", () => {
        toggleDropdown(categoryField, dropdown);
    });
}


/**
 * Sets up the click event listener for the icon wrapper to toggle the visibility of the dropdown.
 * 
 * @param {HTMLElement} iconWrapper - The icon wrapper element.
 * @param {HTMLElement} categoryField - The category field element.
 * @param {HTMLElement} dropdown - The category dropdown element.
 */
function setupIconWrapperToggle(iconWrapper, categoryField, dropdown) {
    iconWrapper.addEventListener("click", () => {
        toggleDropdown(categoryField, dropdown);
    });
}


/**
 * Sets up the click event listener for the category dropdown to update the category field when an item is selected.
 * 
 * @param {HTMLElement} dropdown - The category dropdown element.
 * @param {HTMLElement} categoryField - The category field element.
 */
function setupDropdownSelection(dropdown, categoryField) {
    dropdown.addEventListener('click', function (event) {
        if (event.target.classList.contains('category-item')) {
            let selectedValue = event.target.dataset.value;
            updateCategoryField(selectedValue, categoryField, dropdown);
        }
    });
}


/**
 * Sets up a global click event listener to close the category dropdown when clicking outside of it.
 * 
 * @param {HTMLElement} dropdown - The category dropdown element.
 * @param {HTMLElement} categoryField - The category field element.
 */
function setupClickOutsideDropdown(dropdown, categoryField) {
    document.addEventListener("click", (event) => {
        if (!categoryField.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = "none";
            categoryField.classList.remove("open");
        }
    });
}


/**
 * Toggles the visibility of the dropdown and the open state of the category field.
 * 
 * @param {HTMLElement} categoryField - The category field element.
 * @param {HTMLElement} dropdown - The dropdown element.
 */
function toggleDropdown(categoryField, dropdown) {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    categoryField.classList.toggle("open");
}


/**
 * Updates the category field with the selected value and closes the dropdown.
 * 
 * @param {string} selectedValue - The selected value to update the category field with.
 * @param {HTMLElement} categoryField - The category field element.
 * @param {HTMLElement} dropdown - The dropdown element.
 */
function updateCategoryField(selectedValue, categoryField, dropdown) {
    categoryField.querySelector("span").textContent = selectedValue;
    dropdown.style.display = "none";
    categoryField.classList.remove("open");
    dropdown.setAttribute('data-selected', selectedValue);
}