let tasks = [];
let contacts = [];
let currentDraggedElement;
let searchTimeout;
let currentTaskIndex = null;
let isEditing = false; 
let subtaskCounter = 0;


/**
 * Asynchronous function to initialize the page by including HTML templates, 
 * fetching and processing user data, and rendering tasks in the DOM.
 */
async function onloadFunc() {
    await includeHTML();
    await initApp();
    contacts = await getData("contacts");
    await refreshTaskList();
}


/**
  * Inserts a task into the DOM within its corresponding category container.
 * 
 * This function determines the appropriate category container for the given task, 
 * generates the HTML for the task, and appends it to the task list within the container.
 * 
 * @param {Object} task - The task object containing task details.
 * @param {number} index - The index of the task in the tasks array.
 */
function insertTaskIntoDOM(task, index){
    let catContainer = getCatContainerId(task);
    let taskHTML = generateTaskHtml(task, index);
    let taskList = catContainer.querySelector(".task-list");
    if (taskList) {
        taskList.innerHTML += taskHTML;
    }
}


/**
 * Checks if task categories are empty and inserts placeholder HTML if no tasks are present.
 * 
 * The function iterates through predefined task categories, finds the corresponding 
 * DOM elements, and checks if their task list contains any tasks. If a category is empty, 
 * it updates the DOM with a placeholder message or content.
 * 
 */
function checkEmptyCategories() {
    let categories = ["To-Do", "In Progress", "Await Feedback", "Done"];
    categories.forEach(categoryId => {
        let categoryElement = document.getElementById(categoryId);
        let taskList = categoryElement.querySelector(".task-list");
        if (taskList.children.length === 0) {
            taskList.innerHTML = emptyCategoryHTML(categoryId);
        }
    });
}


/**
 * Retrieves the container element ID for a task based on its category.
 * If the task doesn't have a category, it assigns a default category ("To-Do").
 * 
 * @param {Object} task - The task object containing the category information.
 * @returns {HTMLElement} The container element corresponding to the task's category.
 */
function getCatContainerId(task) {
    if (!task.category) {
        task.category = "To-Do";
    }
    return document.getElementById(task.category);
}


/**
 * Opens the modal for adding a new task by making it visible and disabling page scroll.
 */
function openAddTaskModal(){
    let addTaskModal = document.getElementById("add-task-modal");
    addTaskModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}


/**
 * Closes the modal for adding a new task by hiding it and re-enabling page scroll.
 * Also refreshes the task list after closing the modal.
 */
function closeAddTaskModal() {
    let addTaskModal = document.getElementById("add-task-modal");
    addTaskModal.classList.add("hidden");
    document.body.style.overflow = "";
    refreshTaskList();
}


/**
 * Refreshes the task list by fetching the latest tasks from the server, clearing existing task lists in the DOM,
 * and inserting the updated tasks into the appropriate task lists. Also checks for empty categories.
 * 
 * @async
 * @returns {Promise<void>} A promise that resolves when the task list is refreshed.
 */
async function refreshTaskList() {
    let userResponse = await getData("tasks");
    tasks = Object.entries(userResponse).map(([key, task]) => ({ id: key, task }));
    document.querySelectorAll(".task-list").forEach(taskList => (taskList.innerHTML = ""));
    tasks.forEach((taskObj, index) => insertTaskIntoDOM(taskObj.task, index));
    checkEmptyCategories();
}


/**
 * Moves the task to the next category and updates the DOM.
 * - From "To-Do" → "In Progress" → "Await Feedback" → "Done".
 * - Removes the button if the task is in the "Done" category.
 * 
 * @param {number} taskIndex - The index of the task to move.
 */
function moveTaskToNextCategory(taskIndex) {
    const categories = ["To-Do", "In Progress", "Await Feedback", "Done"];
    let task = tasks[taskIndex];
    let currentCategory = task.task.category;
    let currentCategoryIndex = categories.indexOf(currentCategory);
    if (currentCategoryIndex === -1 || currentCategoryIndex === categories.length - 1) {
        return;
    }
    let nextCategory = categories[currentCategoryIndex + 1];
    task.task.category = nextCategory;
    document.querySelectorAll(".task-list").forEach(taskList => taskList.innerHTML = "");
    tasks.forEach((task, index) => insertTaskIntoDOM(task.task, index));
    checkEmptyCategories();
}


/**
 * Opens the task popup modal by displaying the task details such as badge, title, description, due date, priority,
 * assigned contacts, and subtasks. Also disables the body scroll and the close button while editing.
 * 
 * @param {number} index - The index of the task to display in the popup.
 */
function openTaskPopup(index){
    currentTaskIndex = index;
    let task = tasks[index].task;
    document.getElementById("taskBadge").innerHTML = generateTaskBadge(task.badge);
    document.getElementById("taskTitle").innerHTML = task.title;
    document.getElementById("taskDescription").innerHTML = task.description;
    document.getElementById("taskDueDate").innerHTML = formatDateToDDMMYYYY(task.dueDate);
    generateTaskPriorityElement(task.priority);
    document.getElementById("taskContacts").innerHTML = generateContactsHtml(task.assignedTo, contacts);
    document.getElementById("subtasksList").innerHTML = generateSubtasksHtml(task.subtasks, index);
    document.getElementById("taskPopup").classList.add("show");
    document.body.style.overflow = "hidden";
}


/**
 * Disables or enables the close button based on the editing state.
 */
function disableButtonWhileEdit() {
    updateCloseButtonState();
}


/**
 * Updates the state of the close button based on the editing mode.
 */
function updateCloseButtonState() {
    let closeButton = document.querySelector(".close-btn");
    if (closeButton) {
        closeButton.disabled = isEditing;
    }
}


/**
 * Deletes the currently selected task by removing it from the tasks array and from the server.
 * After deletion, it updates the task list in the DOM, checks for empty categories, and closes the task popup.
 * 
 * @async
 * @returns {Promise<void>} A promise that resolves when the task is deleted and the task list is updated.
 */
async function deleteTask() {
    if (currentTaskIndex !== null) {
        const taskToDelete = tasks[currentTaskIndex];
        const taskId = taskToDelete.id;
        await deleteData(`tasks/${taskId}`);
        tasks.splice(currentTaskIndex, 1);
        document.querySelectorAll(".task-list").forEach(taskList => (taskList.innerHTML = ""));
        tasks.forEach((task, index) => insertTaskIntoDOM(task.task, index));
        checkEmptyCategories();
        closeTaskPopup();
    }
}


/**
 * Closes the task popup if the task is not being edited.
 */
function closeTaskPopup() {
    if (!isEditing) {
        hideTaskPopup();
    }
}


/**
 * Hides the task popup modal by removing the "show" class and resetting the current task index.
 * Also restores the body's overflow style to allow scrolling.
 */
function hideTaskPopup() {
    let taskPopup = document.getElementById("taskPopup");
    if (taskPopup) {
        taskPopup.classList.remove("show");
        currentTaskIndex = null;
        document.body.style.overflow = "auto";
    }
}


/**
 * Generates HTML content for the contacts assigned to a task.
 * It constructs a list of contacts, displaying their initials, full name, and background color.
 * 
 * @param {Object} assignedTo - An object containing contacts assigned to the task, where the key is the contact ID.
 * @returns {string} A string containing the HTML for the assigned contacts.
 */
function generateContactsHtml(assignedTo) {
    if (!assignedTo) return "";
    let contactsHtml = "";
    Object.keys(assignedTo).forEach(contactKey => {
        let contactName = assignedTo[contactKey].name;
        if (contactName && contactName.trim() !== "") {
            let [firstName, lastName] = contactName.split(" ");
            let initials = `${firstName[0]}${lastName ? lastName[0] : ""}`;
            let bgColor = assignedTo[contactKey].color ||"#cccccc";
            contactsHtml += contactsHtmlTemplate(initials, contactName, bgColor);
        }
    });
    return contactsHtml;
}


/**
 * Prevents the default behavior of the dragover event to allow for dropping.
 * 
 * @param {Event} ev - The dragover event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}


/**
 * Sets the current dragged element's ID.
 * 
 * @param {string} id - The ID of the element being dragged.
 */
function startDragging(id){
    currentDraggedElement = id;
}


/**
 * Moves the dragged task to a new category.
 * Updates the task's category and refreshes the task list in the UI.
 * 
 * @param {string} category - The category to which the task should be moved.
 */
function moveTo(category){
    tasks[currentDraggedElement].task['category'] = category;
    removeHighlight(category);
    document.querySelectorAll(".task-list").forEach(taskList => taskList.innerHTML = "");
    tasks.forEach((task, index) => insertTaskIntoDOM(task.task, index));
    checkEmptyCategories();
}


/**
 * Highlights the task list of the specified category.
 * Adds a highlight element to visually indicate the drop target.
 * 
 * @param {string} categoryId - The ID of the category to highlight.
 */
function highlight(categoryId) {
    let taskList = document.getElementById(categoryId).querySelector(".task-list");
    let existingHighlight = taskList.querySelector(".highlight");
    if (existingHighlight) {
        existingHighlight.remove();
    }
    let highlightElement = document.createElement("div");
    highlightElement.classList.add("highlight");
    taskList.appendChild(highlightElement);
}


/**
 * Removes the highlight from the specified category's task list.
 * 
 * @param {string} categoryId - The ID of the category to remove the highlight from.
 */
function removeHighlight(categoryId) {
    let taskList = document.getElementById(categoryId).querySelector(".task-list");
    let highlightElement = taskList.querySelector(".highlight");
    if (highlightElement) {
        highlightElement.remove();
    }
}


/**
 * Finds tasks based on the user's search input and displays the filtered tasks.
 * Retrieves the search term from the input, filters tasks, and updates the UI.
 */
function findTask() {
    let searchInput = document.getElementById("search-input");
    let searchTerm = searchInput.value.trim().toLowerCase();
    let filteredTasks = filterTasksWithIndex(tasks, searchTerm);
    clearTaskLists();
    displayFilteredTasks(filteredTasks, searchTerm);
}


/**
 * Filters tasks based on the search term.
 * Adds the original index of the task to the task object for reference.
 * 
 * @param {Array} tasks - The list of tasks to be filtered.
 * @param {string} searchTerm - The search term used to filter tasks.
 * @returns {Array} - A list of filtered tasks with their original indices.
 */
function filterTasksWithIndex(tasks, searchTerm){
    return tasks
    .map((task, index) => ({ ...task, originalIndex: index }))
    .filter(task =>
        task.task.title.toLowerCase().includes(searchTerm) ||
        task.task.description.toLowerCase().includes(searchTerm)
    );
}


/**
 * Handles the search input event. Delays the search action by 500ms to optimize performance.
 * Clears the previous timeout and triggers the task search after the specified delay.
 */
function onSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        findTask();
    }, 500);
}


/**
 * Clears all the task lists from the UI.
 * Removes all task elements from each task list.
 */
function clearTaskLists() {
    let taskLists = document.querySelectorAll(".task-list");
    taskLists.forEach(taskList => {
        taskList.innerHTML = "";
    });
}


/**
 * Hides specific elements in an iframe by calling the `hideElementsInIframe` function.
 * Waits for the iframe document to load before attempting to hide elements.
 * 
 * @param {string} iframeId - The ID of the iframe element.
 */
function hideIframeElements(iframeId) {
    let iframe = document.getElementById(iframeId);
    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDocument) {
        waitForIncludeToLoad(iframeDocument, () => hideElementsInIframe(iframeDocument));
    } else {
        console.error("Unable to access iframe document.");
    }
}


/**
 * Hides specific elements (header, sidebar) in the iframe document.
 * Adjusts the layout by modifying styles of certain elements.
 * 
 * @param {Document} iframeDocument - The document object of the iframe.
 */
function hideElementsInIframe(iframeDocument) {
    let header = iframeDocument.querySelector("header");
    let sidebar = iframeDocument.querySelector("aside.sidebar");
    let container = iframeDocument.querySelector(".addTask-container");
    container.style.height = "100%";
    if (header) {
        header.style.display = "none";
        container.style.marginTop = "0";
    }
    if (sidebar) {
        sidebar.style.display = "none";
        container.style.marginLeft = "0";
    }
}


/**
 * Waits for specific elements (header, sidebar) to load in the iframe document.
 * Once both elements are available, it triggers the provided callback function.
 * 
 * @param {Document} iframeDocument - The document object of the iframe.
 * @param {Function} callback - The callback function to be executed once the elements are loaded.
 */
function waitForIncludeToLoad(iframeDocument, callback) {
    let interval = setInterval(function () {
        let header = iframeDocument.querySelector("header");
        let sidebar = iframeDocument.querySelector("aside.sidebar");
        if (header && sidebar) {
            clearInterval(interval);
            callback();
        }
    }, 100);
}