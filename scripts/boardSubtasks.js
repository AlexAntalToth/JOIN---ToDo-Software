/**
 * Calculates the progress of subtasks for a given task.
 * Returns the count of completed and total subtasks.
 * 
 * @param {Object} subtasks - An object where the keys are subtask IDs and the values are subtask objects.
 * @returns {Object} An object containing the completed and total subtask counts.
 */
function calculateSubtaskProgress(subtasks) {
    let subtaskArray = Object.values(subtasks);
    if (!subtaskArray || subtaskArray.length === 0) return { completed: 0, total: 0 };
    let total = subtaskArray.length;
    let completed = subtaskArray.filter(subtask => subtask.completed === true).length;
    return { completed, total };
}


/**
 * Toggles the completion status of a subtask for a specific task.
 * Updates the task's subtasks and the corresponding UI elements.
 * 
 * @param {number} taskIndex - The index of the task in the tasks array.
 * @param {string} subtaskId - The ID of the subtask to toggle.
 */
function toggleSubtask(taskIndex, subtaskId) {
    let task = tasks[taskIndex];
    let subtask = task.task.subtasks[subtaskId];
    subtask.completed = !subtask.completed;
    updateSubtaskBar(taskIndex);
    updatePopupSubtasks(taskIndex);
}


/**
 * Updates the subtask progress bar in the task's UI.
 * It recalculates the progress and updates the width of the progress bar.
 * 
 * @param {number} taskIndex - The index of the task in the tasks array.
 */
function updateSubtaskBar(taskIndex) {
    let task = tasks[taskIndex];
    let subtasks = task.task.subtasks;
    let total = Object.keys(subtasks).length;
    let completed = Object.values(subtasks).filter(subtask => subtask.completed).length;
    let subtaskBar = document.querySelector(`#subtaskBar-${taskIndex}`);
    if (subtaskBar) {
        subtaskBar.querySelector(".pb-blue").style.width = `${(completed / total) * 100}%`;
        subtaskBar.querySelector("span").innerText = `${completed}/${total} Subtasks`;
    }
}


/**
 * Updates the list of subtasks displayed in the task popup.
 * It regenerates the HTML for the subtasks and updates the UI.
 * 
 * @param {number} taskIndex - The index of the task in the tasks array.
 */
function updatePopupSubtasks(taskIndex) {
    let task = tasks[taskIndex].task;
    let subtasksList = document.getElementById("subtasksList");
    if (subtasksList) {
        subtasksList.innerHTML = generateSubtasksHtml(task.subtasks, taskIndex);
    }
}


/**
 * Sets up the subtask input field by initializing UI elements and adding event listeners.
 */
function setupSubtaskInput() {
    let subtaskInput = document.getElementById("newSubtaskInput");
    let addIcon = document.getElementById("addSubtaskButton");
    let iconsContainer = document.getElementById("subtaskIcons");

    if (subtaskInput && addIcon && iconsContainer) {
        initializeSubtaskUI(addIcon, iconsContainer);
        addSubtaskInputListeners(subtaskInput, addIcon, iconsContainer);
    }
}


/**
 * Initializes the subtask input UI by showing the add icon and hiding the icons container.
 * @param {Element} addIcon The add subtask button element.
 * @param {Element} iconsContainer The container for subtask icons.
 */
function initializeSubtaskUI(addIcon, iconsContainer) {
    addIcon.classList.remove("hidden");
    iconsContainer.classList.add("hidden");
}


/**
 * Adds event listeners for the subtask input field to handle focus, blur, and keydown events.
 * @param {Element} subtaskInput The input field for entering new subtasks.
 * @param {Element} addIcon The add subtask button element.
 * @param {Element} iconsContainer The container for subtask icons.
 */
function addSubtaskInputListeners(subtaskInput, addIcon, iconsContainer) {
    subtaskInput.addEventListener("focus", () => toggleSubtaskIcons(addIcon, iconsContainer, true));
    subtaskInput.addEventListener("blur", () => {
        if (!subtaskInput.value.trim()) {
            toggleSubtaskIcons(addIcon, iconsContainer, false);
        }
    });
    subtaskInput.addEventListener("keydown", (event) => handleSubtaskInputKeydown(event));
}


/**
 * Toggles the visibility of the add icon and icons container based on the focus state of the input field.
 * @param {Element} addIcon The add subtask button element.
 * @param {Element} iconsContainer The container for subtask icons.
 * @param {boolean} isFocused Whether the input field is focused or not.
 */
function toggleSubtaskIcons(addIcon, iconsContainer, isFocused) {
    addIcon.classList.toggle("hidden", isFocused);
    iconsContainer.classList.toggle("hidden", !isFocused);
}


/**
 * Handles the keydown event for the subtask input field. If the Enter key is pressed, a new subtask is added.
 * @param {Event} event The keydown event.
 */
function handleSubtaskInputKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addSubtask(event);
    }
}


/**
 * Cancels the subtask input by clearing the input field and resetting the UI elements.
 */
function cancelSubtaskInput() {
    let newSubtaskInput = document.getElementById("newSubtaskInput");
    newSubtaskInput.value = "";
    document.getElementById("addSubtaskButton").classList.remove("hidden");
    document.getElementById("subtaskIcons").classList.add("hidden");
}


/**
 * Adds a new subtask to the task if it meets the requirements.
 * @param {Event} event The submit event.
 */
function addSubtask(event) {
    event.preventDefault();
    let task = tasks[currentTaskIndex]?.task;
    let subtaskName = getSubtaskName();
    if (subtaskName === "") return;
        addNewSubtask(task, subtaskName);
        updateSubtasksList(task);
        clearSubtaskInput();
        unfocusInput();
}


/**
 * Retrieves the name of the subtask from the input field.
 * @returns {string} The subtask name.
 */
function getSubtaskName() {
    return document.getElementById('newSubtaskInput').value.trim();
}


/**
 * Adds a new subtask to the task with the given name.
 * @param {Object} task The task object.
 * @param {string} subtaskName The name of the subtask.
 */
function addNewSubtask(task, subtaskName) {
    task.subtasks = task.subtasks || {};
    let subtaskId = `subtask-${subtaskCounter++}`;
    task.subtasks[subtaskId] = { name: subtaskName, completed: false };
}


/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
    document.getElementById('newSubtaskInput').value = "";
}


/**
 * Unfocuses the subtask input field.
 */
function unfocusInput() {
    document.getElementById('newSubtaskInput').blur();
}


/**
 * Edits an existing subtask by setting up the subtask input for editing.
 * @param {string} subtaskId The ID of the subtask to edit.
 */
function editSubtask(subtaskId) {
    let task = tasks[currentTaskIndex].task;
    let subtask = task.subtasks[subtaskId];
    let subtaskElement = document.getElementById(subtaskId);
    if (!subtask || !subtaskElement) return;
    setupSubtaskEditUI(subtask, subtaskElement, task);
}


/**
 * Sets up the UI for editing a subtask.
 * @param {Object} subtask The subtask object to edit.
 * @param {Element} subtaskElement The DOM element representing the subtask.
 * @param {Object} task The task object containing the subtask.
 */
function setupSubtaskEditUI(subtask, subtaskElement, task) {
    let inputField = createInputField(subtask);
    let checkIcon = createCheckIcon();
    subtaskElement.innerHTML = '';
    subtaskElement.appendChild(inputField);
    subtaskElement.appendChild(checkIcon);
    checkIcon.addEventListener('click', function () {
        handleSubtaskSave(inputField, subtask, task);
    });
}


/**
 * Saves the changes made to a subtask.
 * @param {Element} inputField The input field with the new subtask name.
 * @param {Object} subtask The subtask object to update.
 * @param {Object} task The task object containing the subtask.
 */
function handleSubtaskSave(inputField, subtask, task) {
    let newSubtaskName = inputField.value.trim();
    if (newSubtaskName) {
        subtask.name = newSubtaskName;
        updateSubtasksList(task);
    }
}


/**
 * Creates an input field for editing a subtask.
 * @param {Object} subtask The subtask object.
 * @returns {Element} The input field element.
 */
function createInputField(subtask){
    let inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = subtask.name;
    inputField.maxLength = '30';
    return inputField;
}


/**
 * Deletes a subtask from the task.
 * @param {string} subtaskId The ID of the subtask to delete.
 */
function deleteSubtask(subtaskId) {
    let task = tasks[currentTaskIndex].task;
    if (!task.subtasks[subtaskId]) return;
    delete task.subtasks[subtaskId];
    updateSubtasksList(task);
}


/**
 * Retrieves the current subtasks from the DOM and returns them as an object.
 * @returns {Object} An object containing the subtasks with their names and completion status.
 */
function getCurrentSubtasks() {
    let subtasksList = document.querySelectorAll(".subtasks-list .subtask-item");
    let subtasks = {};
    subtasksList.forEach((subtaskElement, index) => {
        let subtaskName = subtaskElement.querySelector(".subtask-item-name span").textContent.trim();
        if (subtaskName) {
            subtasks[index] = { name: subtaskName, completed: false };
        }
    });
    return subtasks;
}


/**
 * Creates a check icon element.
 * @returns {HTMLElement} The check icon element.
 */
function createCheckIcon() {
    let checkIcon = document.createElement('img');
    checkIcon.src = './assets/icons/contact_create.png';
    checkIcon.alt = 'Bestätigen';
    checkIcon.className = 'confirm-img';
    return checkIcon;
}


/**
 * Creates a profile circle element for the given contact. The profile circle will display the initials of the contact 
 * and be styled with the contact's color.
 * 
 * @param {Object} contact The contact object containing the contact's details.
 * @param {string} contact.name The name of the contact. The initials will be derived from this.
 * @param {string} contact.color The background color of the profile circle.
 * @returns {HTMLElement} A div element representing the profile circle with the contact's initials and color.
 * @throws {Error} If the contact object is invalid or missing required properties, an error is logged to the console.
 */
function createProfileCircle(contact) {
    if (!contact || !contact.name || !contact.color) {
        console.error("Invalid contact data:", contact);
        return document.createElement("div");
    }
    let initials = contact.name.split(" ").map(name => name[0]).join("");
    let profileCircle = document.createElement("div");
    profileCircle.classList.add("profile-circle");
    profileCircle.style.backgroundColor = contact.color;
    profileCircle.textContent = initials;
    return profileCircle;
}
