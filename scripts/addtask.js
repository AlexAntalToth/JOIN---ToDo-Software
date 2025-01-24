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
 * Initializes the page setup by invoking various setup functions for form elements and event listeners.
 * This includes title field, create button, assigned-to field, contact list, category dropdown,
 * due date validation, date icon click listener and (reset of) validation rules.
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
    resetFormFields();
    attachEventListeners();
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


/**
 * Asynchronously generates and adds an "Add Task" card with optional task data to the page.
 * Clears the existing content in the add task container and footer before updating with the new card and footer.
 *
 * @async
 * @function createAddTaskCard
 * @param {Object} [task] - The task object to pre-fill the "Add Task" card with. 
 * If no task is provided, an empty task with default values will be used.
 * @param {string} [task.title=""] - The title of the task.
 * @param {string} [task.description=""] - The description of the task.
 * @param {string} [task.dueDate=""] - The due date of the task.
 * @param {string} [task.priority=""] - The category of the task.
 * @returns {Promise<void>} - A promise that resolves when the task card and footer are successfully added to the DOM.
 */
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


//Save New Task
/**
 * Saves a new task by gathering task details and posting it to the server.
 * Resets the form fields after submission.
 * 
 * @returns {Promise<Object>} The response data from the server after posting the task.
 */
async function saveNewTask() {
    let { taskTitle, taskDescription, taskDueDate, taskBadge } = getTaskDetails();
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
    let responseData = await postTaskToServer(newTask);
    resetFormFields();
    return responseData;
}


/**
 * Retrieves the details of the task from the form fields.
 * 
 * @returns {Object} An object containing the task's title, description, due date (in DD/MM/YYYY), and badge.
 */
function getTaskDetails() {
    let taskTitle = document.getElementById('task-title').value;
    let taskDescription = document.getElementById('task-description').value;
    let taskDueDate = document.getElementById('task-dueDate').value;
    let taskBadge = document.getElementById('categoryDropdown').getAttribute('data-selected');

    return { taskTitle, taskDescription, taskDueDate, taskBadge };
}


/**
 * Retrieves the list of subtasks from the UI.
 * 
 * @returns {Array} An array of objects representing each subtask, with a name and completed status (defaulted to false).
 */
function getSubtasks() {
    let subtaskElements = document.querySelectorAll('.subtasks-list li span');
    return Array.from(subtaskElements).map(element => ({
        name: element.textContent.trim(),
        completed: false
    }));
}


/**
 * Generates an object representing the assigned contacts.
 * 
 * This function iterates over the `selectedContacts` array and builds an object
 * where each key is a unique contact identifier (e.g., `contact1`, `contact2`),
 * and the value is an object containing the contact's `name` and `color`.
 * 
 * @returns {Object} An object mapping contact identifiers to their respective
 *                   name and color properties. Returns an empty string if 
 *                   `selectedContacts` is empty.
 */
function getAssignedContacts() {
    if (selectedContacts.length > 0) {
        return selectedContacts.reduce((assignedTo, contact, index) => {
            assignedTo[`contact${index + 1}`] = {
                name: contact.name,
                color: contact.color
            };
            return assignedTo;
        }, {});
    }
    return "";
}



/**
 * Sends a POST request to the server to create a new task.
 * 
 * @param {Object} newTask The task data to be sent to the server.
 * @returns {Promise<Object|null>} The server's response data if the request is successful, or `null` if there is an error.
 */
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


/**
 * Builds the options for the POST request to create a new task.
 * 
 * @param {Object} newTask The task data to be sent in the request body.
 * @returns {Object} The options object to be used in the `fetch` request.
 */
function buildPostRequestOptions(newTask) {
    return {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newTask)
    };
}


/**
 * Sends a POST request to the specified URL with the given options.
 * 
 * @param {string} url The URL to which the POST request will be sent.
 * @param {Object} options The options to be used in the `fetch` request (including method, headers, and body).
 * @returns {Promise<Response|null>} The response object if the request is successful, or `null` if an error occurs.
 */
async function sendPostRequest(url, options) {
    try {
        let response = await fetch(url, options);
        return response;
    } catch (error) {
        console.error("Error sending POST request:", error);
        return null;
    }
}


/**
 * Handles the response after a successful task creation.
 * Displays a task creation popup and checks if the page is loaded inside an iframe.
 * If the page is inside an iframe, no redirection occurs. If the page is not inside an iframe, it redirects to the "board.html" page after a short delay.
 *
 * @param {Object} responseData - The data received in the response, typically containing task details.
 * @returns {Object} The original responseData that was passed to the function.
 */
function handleSuccessfulResponse(responseData) {
    showTaskCreatedPopup();
    if (window.self !== window.top) {
        return;
    } else {
        setTimeout(() => {
            window.location.href = "board.html";
        }, 1550);
    }
    return responseData;
}


/**
 * Displays a popup indicating that the task has been created successfully.
 * The popup is shown for 1.5 seconds before being hidden.
 */
function showTaskCreatedPopup() {
    let popup = document.getElementById('task-created-popup');
    popup.classList.add('show');

    setTimeout(() => {
        popup.classList.remove('show');
    }, 1500);
}
