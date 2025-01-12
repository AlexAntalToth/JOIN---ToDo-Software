let contacts = [];
let selectedContacts = [];
let taskPriority = "";
let tasks = [{ subtasks: [] }];
let currentTaskIndex = 0;
let taskSubtasks = [];
let editingSubtaskIndex = null;

/**
 * Initializes the application by including HTML content, initializing the app, 
 * and rendering the "Add Task" card.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when all initialization steps are complete.
 */
async function init() {
    await includeHTML();
    await initApp();
    renderAddTaskCard();
}


/**
 * Loads the sidebar and header templates asynchronously and inserts them into 
 * their respective containers in the DOM.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the sidebar and header content 
 *                          has been successfully fetched and inserted.
 */
async function loadSidebarAndHeader() {
    let sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;
    let headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}


/**
 * Initializes the page setup by invoking various setup functions for form elements and event listeners.
 * This includes title field, create button, assigned-to field, contact list, category dropdown,
 * due date validation, date icon click listener and validation rules.
 *
 * @function setupPage
 */
function setupPage() {
    setupTitleField();
    setupCreateButton();
    setupAssignedToField();
    setupContactList();
    setupCategoryDropdown();
    setupDueDateValidation();
    setupDateIconClickListener();
    attachValidationListeners();
}


/**
 * Sets up the page by calling the `setupPage` function after the DOM content is fully loaded.
 *
 * @event DOMContentLoaded
 * @listens DOMContentLoaded
 * @function
 */
document.addEventListener('DOMContentLoaded', setupPage);


/**
 * Renders the "Add Task" card content with the provided task data or default values.
 *
 * @async
 * @function renderAddTaskCardContent
 * @param {Object} [task={}] - The task data to pre-fill the form with. Defaults to an empty task object if no data is provided.
 * @param {string} [task.title=""] - The title of the task.
 * @param {string} [task.description=""] - The description of the task.
 * @param {string} [task.dueDate=""] - The due date of the task in YYYY-MM-DD format.
 * @param {string} [task.priority=""] - The priority level of the task.
 * @returns {Promise<void>} Resolves when the card content is rendered.
 */
async function renderAddTaskCardContent(task) {
    let addTaskContainer = document.querySelector(".addTask-content");
    let addTaskFooter = document.querySelector(".addTask-footer");
    contacts = await loadTaskContacts();
    if (!addTaskContainer) {
        return;
    }
    addTaskContainer.innerHTML = await generateAddTaskCardHTML(task || { title: "", description: "", dueDate: "", priority: "" });
    addTaskFooter.innerHTML = generateAddTaskCardFooterHTML();
}


/**
 * Initializes all the setup functions for the "Add Task" card.
 *
 * @function initializeAddTaskCardSetup
 * @returns {void}
 */
function initializeAddTaskCardSetup() {
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


/**
 * Orchestrates the rendering and initialization of the "Add Task" card.
 *
 * @async
 * @function renderAddTaskCard
 * @param {Object} [task={}] - The task data to pre-fill the form with.
 * @returns {Promise<void>} Resolves when the card is fully rendered and initialized.
 */
async function renderAddTaskCard(task) {
    await renderAddTaskCardContent(task);
    initializeAddTaskCardSetup();
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


// Title
function setupTitleField() {
    let titleField = document.getElementById('task-title');
    if (titleField) {
        titleField.addEventListener('input', validateFields);
    }
}


// Assigned to
function setupAssignedToField() {
    let elements = getAssignedToElements();
    if (!elements) return;

    initializeAssignedToField(elements);
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
            addContact(contactItem, contact);
        } else {
            removeContact(contactItem, contactId);
        }
        updateSelectedContactInitials();
    }
}


function addContact(contactItem, contact) {
    if (!selectedContacts.some(c => c.id === contact.id)) {
        selectedContacts.push(contact);
    }
    contactItem.classList.add("selected");
}


function removeContact(contactItem, contactId) {
    selectedContacts = selectedContacts.filter(c => c.id !== contactId);
    contactItem.classList.remove("selected");
}


function setupContactList() {
    let contactListElement = document.getElementById("contactList");
    if (contactListElement) {
        contactListElement.addEventListener("click", (event) => {
            handleContactClick(event);
        });
    }
}


function handleContactClick(event) {
    let target = event.target;
    let contactItem = target.closest(".contact-item");
    if (!contactItem) return;
    let checkbox = contactItem.querySelector(".contact-checkbox");
    if (!checkbox) return;
    let isSelected = checkbox.checked;
    checkbox.checked = !isSelected;
    if (checkbox.checked) {
        contactItem.classList.add("selected");
    } else {
        contactItem.classList.remove("selected");
    }
}


//Due Date
function setupDueDateValidation() {
    let dueDateField = document.getElementById("task-dueDate");
    if (dueDateField) {
        dueDateField.addEventListener("input", () => {
            validateFields();
        });
    }
}


function setupDateIconClickListener() {
    document.addEventListener("click", (event) => {
        handleDateIconClick(event);
    });
}


function handleDateIconClick(event) {
    let dateIcon = event.target.closest(".addTask-date-icon");
    if (dateIcon) {
        let dateInput = document.getElementById("task-dueDate");
        if (dateInput) {
            dateInput.showPicker();
        }
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


//Category
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


function setupCategoryFieldToggle(categoryField, dropdown) {
    categoryField.addEventListener("click", () => {
        toggleDropdown(categoryField, dropdown);
    });
}


function setupIconWrapperToggle(iconWrapper, categoryField, dropdown) {
    iconWrapper.addEventListener("click", () => {
        toggleDropdown(categoryField, dropdown);
    });
}


function setupDropdownSelection(dropdown, categoryField) {
    dropdown.addEventListener('click', function (event) {
        if (event.target.classList.contains('category-item')) {
            let selectedValue = event.target.dataset.value;
            updateCategoryField(selectedValue, categoryField, dropdown);
        }
    });
}


function setupClickOutsideDropdown(dropdown, categoryField) {
    document.addEventListener("click", (event) => {
        if (!categoryField.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = "none";
            categoryField.classList.remove("open");
        }
    });
}


function toggleDropdown(categoryField, dropdown) {
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    categoryField.classList.toggle("open");
}


function updateCategoryField(selectedValue, categoryField, dropdown) {
    categoryField.querySelector("span").textContent = selectedValue;
    dropdown.style.display = "none";
    categoryField.classList.remove("open");
    dropdown.setAttribute('data-selected', selectedValue);
    console.log('Selected category:', selectedValue);
}


// Subtasks
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


function initializeSubtaskInput(subtaskInput, addIcon, iconsContainer) {
    showAddIconAndIconsContainer(addIcon, iconsContainer);
    subtaskInput.addEventListener("focus", () => handleFocus(addIcon, iconsContainer));
    subtaskInput.addEventListener("blur", () => handleBlur(subtaskInput, addIcon, iconsContainer));
    subtaskInput.addEventListener("keydown", (event) => handleEnterKey(event));
}


function showAddIconAndIconsContainer(addIcon, iconsContainer) {
    addIcon.classList.remove("hidden");
    iconsContainer.classList.remove("active");
}


function handleFocus(addIcon, iconsContainer) {
    addIcon.classList.add("hidden");
    iconsContainer.classList.add("active");
}


function handleBlur(subtaskInput, addIcon, iconsContainer) {
    if (!subtaskInput.value.trim()) {
        addIcon.classList.remove("hidden");
        iconsContainer.classList.remove("active");
    }
}


function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addSubtask();
    }
}


function setupCancelButton(cancelButton) {
    cancelButton.addEventListener('click', clearSubtaskInput);
}


function clearSubtaskInput() {
    let subtaskInput = document.getElementById('addTaskNewSubTaskInput');

    if (subtaskInput) {
        subtaskInput.value = '';
    }
}


function addSubtask() {
    let input = document.getElementById("addTaskNewSubTaskInput");
    let subtaskName = validateSubtask(input.value);
    if (subtaskName) {
        createSubtask(subtaskName);
        input.value = "";
    }
}


function validateSubtask(inputValue) {
    let subtaskName = inputValue.trim();
    if (subtaskName === "") {
        showErrorMessage("Please enter a subtask.");
        return null;
    }
    if (tasks[currentTaskIndex].subtasks.length >= 3) {
        showErrorMessage("Maximum 3 subtasks are allowed.");
        return null;
    }
    return subtaskName;
}


function createSubtask(subtaskName) {
    tasks[currentTaskIndex].subtasks.push({ name: subtaskName, completed: false });
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
        showErrorMessage("Please enter a valid name.");
        return;
    }
    tasks[currentTaskIndex].subtasks[index].name = newName;
    editingSubtaskIndex = null;
    updateSubtasksList();
}


//Clear and Create Buttons
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
        clearFields();
        resetCategory();
        resetContacts();
        clearSubtasks();
        renderAddTaskCard();
        updateSubtasksList();
        updateSelectedContactInitials();
    });
}


function clearFields() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-dueDate").value = "";
    document.querySelectorAll(".addTask-prio-button").forEach(button => button.classList.remove("selected"));
}


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


function clearSubtasks() {
    tasks[currentTaskIndex].subtasks = [];
}


//Save New Task
async function saveNewTask() {
    let { taskTitle, taskDescription, taskDueDate, formattedDueDate, taskBadge } = getTaskDetails();
    let taskSubtasks = getSubtasks();
    let assignedTo = getAssignedContacts();
    let newTask = {
        title: taskTitle,
        description: taskDescription,
        assignedTo,
        dueDate: taskDueDate,
        priority: taskPriority,
        badge: taskBadge,
        subtasks: taskSubtasks
    };
    return await postTaskToServer(newTask);
}


function getTaskDetails() {
    let taskTitle = document.getElementById('task-title').value;
    let taskDescription = document.getElementById('task-description').value;
    let taskDueDate = document.getElementById('task-dueDate').value;
    let [year, month, day] = taskDueDate.split("-");
    let formattedDueDate = `${day}/${month}/${year}`;
    let taskBadge = document.getElementById('categoryDropdown').getAttribute('data-selected');
    return { taskTitle, taskDescription, taskDueDate, formattedDueDate, taskBadge };
}


function getSubtasks() {
    let subtaskElements = document.querySelectorAll('.subtasks-list li span');
    return Array.from(subtaskElements).map(element => ({
        name: element.textContent.trim(),
        completed: false
    }));
}


function getAssignedContacts() {
    if (selectedContacts.length > 0) {
        return selectedContacts.reduce((assignedTo, contact, index) => {
            assignedTo[`contact${index + 1}`] = contact.name;
            return assignedTo;
        }, {});
    }
    return { contact1: "" };
}


async function postTaskToServer(newTask) {
    let options = buildPostRequestOptions(newTask);
    let response = await sendPostRequest(BASE_URL + "tasks.json", options);

    if (response && response.ok) {
        let responseData = await response.json();
        return handleSuccessfulResponse(responseData);
    } else {
        return null;
    }
}


function buildPostRequestOptions(newTask) {
    return {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newTask)
    };
}


async function sendPostRequest(url, options) {
    try {
        let response = await fetch(url, options);
        return response;
    } catch (error) {
        console.error("Error sending POST request:", error);
        return null;
    }
}


function handleSuccessfulResponse(responseData) {
    showTaskCreatedPopup();
    setTimeout(() => {
        window.location.href = "board.html";
    }, 1500);
    return responseData;
}


function showTaskCreatedPopup() {
    let popup = document.getElementById('task-created-popup');
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 1500);
}


//Validation
function validateFields() {
    let titleField = document.getElementById("task-title");
    let categoryDropdown = document.getElementById("categoryDropdown");
    let dueDateField = document.getElementById("task-dueDate");
    let isTitleEmpty = titleField.value.trim() === "";
    let isCategoryEmpty = !categoryDropdown.getAttribute("data-selected");
    let isDueDateEmpty = dueDateField.value.trim() === "";
    let isDueDateInvalid = false;
    if (!isDueDateEmpty) {
        let date = new Date(dueDateField.value);
        let today = new Date();
        isDueDateInvalid = isNaN(date.getTime()) || date < today;
    }
    updateCreateButtonState(isTitleEmpty, isCategoryEmpty, isDueDateEmpty, isDueDateInvalid);
}


function validateAndSaveTask(event) {
    event.preventDefault();
    let titleField = document.getElementById("task-title");
    let categoryDropdown = document.getElementById("categoryDropdown");
    let dueDateField = document.getElementById("task-dueDate");
    updateCreateButtonState(
        isFieldEmpty(titleField, "value"),
        isFieldEmpty(categoryDropdown, "data-selected"),
        isFieldEmpty(dueDateField, "value"),
        !isValidDate(dueDateField.value)
    );
    if (
        !isFieldEmpty(titleField, "value") &&
        !isFieldEmpty(categoryDropdown, "data-selected") &&
        !isFieldEmpty(dueDateField, "value") &&
        isValidDate(dueDateField.value)
    ) {
        saveNewTask();
    }
}


function isValidDate(dueDateValue) {
    let today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let dueDate = new Date(dueDateValue);
    return dueDate > yesterday; 
}


function isFieldEmpty(field, fieldType) {
    let fieldValue = fieldType === "value" ? field.value.trim() : field.getAttribute(fieldType);
    return !fieldValue;
}


function updateCreateButtonState(isTitleEmpty, isCategoryEmpty, isDueDateEmpty, isDueDateInvalid) {
    let createButton = document.querySelector(".create-addTask-button");
    let isDisabled = isTitleEmpty || isCategoryEmpty || isDueDateEmpty || isDueDateInvalid;

    createButton.style.backgroundColor = isDisabled ? "grey" : "";
    createButton.style.cursor = isDisabled ? "not-allowed" : "pointer";
    createButton.disabled = isDisabled;
}


function attachValidationListeners() {
    let fields = [
        { id: "task-title", event: "input" },
        { id: "categoryDropdown", event: "change" },
        { id: "task-dueDate", event: "change" },
    ];
    fields.forEach(({ id, event }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, () => {
                validateAndSaveTask({ preventDefault: () => {} });
            });
        }
    });
}


//Error message
function showErrorMessage(message) {
    let errorBox = document.getElementById("error-message-box");
    errorBox.textContent = message;
    errorBox.classList.add("show");

    setTimeout(() => {
        errorBox.classList.remove("show");
    }, 2500);
}
