let tasks = [];
let contacts = {};
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
    contacts = await getData("/contacts");
    const userResponse = await getData("/tasks");
    tasks = Object.entries(userResponse).map(([key, task]) => ({ id: key, task }));
    tasks.forEach((taskObj, index) => insertTaskIntoDOM(taskObj.task, index));
    checkEmptyCategories();
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
    let taskHTML = generateTaskHtml(task, index, contacts);
    const taskList = catContainer.querySelector(".task-list");
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
    const categories = ["To-Do", "In Progress", "Await Feedback", "Done"];
    categories.forEach(categoryId => {
        const categoryElement = document.getElementById(categoryId);
        const taskList = categoryElement.querySelector(".task-list");
        if (taskList.children.length === 0) {
            taskList.innerHTML = emptyCategoryHTML(categoryId);
        }
    });
}

function emptyCategoryHTML(categoryId) {
    return `
        <div class="no-tasks">
            No tasks ${categoryId === "To-Do" ? "to do" : 
                        categoryId === "In Progress" ? "in progress" : 
                        categoryId === "Await Feedback" ? "await feedback" : 
                        "done"}.
        </div>
    `
}



function getCatContainerId(task) {
    if (!task.category) {
        task.category = "To-Do";
    }
    return document.getElementById(task.category);
}

function generateTaskHtml(task, index, contacts){
    const subtasks = task.subtasks || {}; 
    const { completed, total } = calculateSubtaskProgress(subtasks);
    return `
        <div class="task" id="task-${index}" draggable="true" ondragstart="startDragging(${index})">
             ${generateTaskBadge(task.badge)}
            <div class="task-title" onclick="openTaskPopup(${index})">${task.title}</div>
            <div class="task-desc">${task.description}</div>
            <div class="subtask-bar" id="subtaskBar-${index}">
                ${task.subtasks && total > 0 ? `
                    <div class="pb-bg">
                        <div class="pb-blue" style="width: ${(completed / total) * 100}%;"></div>
                    </div>
                    <span>${completed}/${total} Subtasks</span>
                ` : ""}
            </div>
            <div class="task-footer">
                <div class="contacts">
                ${task.assignedTo ? Object.keys(task.assignedTo).map(contactKey => {
                    const contact = contacts[contactKey];
                    if (contact) {
                        const [firstName, lastName] = contact.name.split(" ");
                        const initials = `${firstName[0]}${lastName ? lastName[0] : ""}`;
                        const bgColor = contact.color || "#cccccc";
                        return `
                            <div class="profile-circle" style="background-color: ${bgColor};">
                              ${initials}
                            </div>
                        `;
                    }
                    return "";
                }).join("") : ""}
                </div>
                ${task.priority ? `
                    <div class="priority">
                        <img src="./assets/icons/priority_${task.priority}.png" alt="Priority">
                    </div>
                ` : ""}
            </div>
        </div>
    `;
}

function calculateSubtaskProgress(subtasks) {
    let subtaskArray = Object.values(subtasks);
    if (!subtaskArray || subtaskArray.length === 0) return { completed: 0, total: 0 };
    const total = subtaskArray.length;
    const completed = subtaskArray.filter(subtask => subtask.completed === true).length;
    return { completed, total };
}

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
    disableButtonWhileEdit();
}

function disableButtonWhileEdit() {
    const closeButton = document.querySelector(".close-btn");
    if (closeButton) {
        closeButton.disabled = isEditing;
    }
}

function generateTaskPriorityElement(priority){
    let taskPriorityElement = document.getElementById("taskPriority");
    if (priority) {
        taskPriorityElement.innerHTML = `
            <p>${priority.charAt(0).toUpperCase() + priority.slice(1)}</p>
            <img src="./assets/icons/priority_${priority}.png" alt="Priority">
        `;
    } else {
        taskPriorityElement.innerHTML = "none";
    }
}

function deleteTask() {
    if (currentTaskIndex !== null) {
        tasks.splice(currentTaskIndex, 1);
        document.querySelectorAll(".task-list").forEach(taskList => (taskList.innerHTML = ""));
        tasks.forEach((task, index) => insertTaskIntoDOM(task.task, index));
        checkEmptyCategories();
        closeTaskPopup();
    }
}

function closeTaskPopup() {
    if (!isEditing) {
        const taskPopup = document.getElementById("taskPopup");
        if (taskPopup) {
            taskPopup.classList.remove("show");
            currentTaskIndex = null;
            document.body.style.overflow = "auto";
        }
      }
    }
    const taskPopup = document.getElementById("taskPopup");
    if (taskPopup) {
        taskPopup.classList.remove("show");
        currentTaskIndex = null;
        document.body.style.overflow = "auto";
    }


function generateContactsHtml(assignedTo, contacts) {
    if (!assignedTo) return "";
    let contactsHtml = "";
    Object.keys(assignedTo).forEach(contactKey => {
        const contact = contacts[contactKey];
        if (contact) {
            const [firstName, lastName] = contact.name.split(" ");
            const initials = `${firstName[0]}${lastName ? lastName[0] : ""}`;
            const bgColor = contact.color || "#cccccc";
            contactsHtml += contactsHtmlTemplate(initials, contact, bgColor);
        }
    });
    return contactsHtml;
}

function contactsHtmlTemplate(initials, contact, bgColor){
    return `
            <div class="task-contact">
                <div class="profile-circle" style="background-color: ${bgColor};">
                ${initials}
                </div>
                <span>${contact.name}</span>
            </div>
            `
}

function generateTaskBadge(badgeType) {
    let badgeClass = "bg-orange";
    if (badgeType === "User Story") {
        badgeClass = "bg-blue";
    } else if (badgeType === "Technical Task") {
        badgeClass = "bg-green";
    }
    return `
        <div class="task-badge ${badgeClass}">
            ${badgeType}
        </div>
    `;
}

function generateSubtasksHtml(subtasks, taskIndex) {
    if (!subtasks) return "";
    
    return Object.entries(subtasks).map(([subtaskId, subtask]) => `
        <label class="label-container">
            ${subtask.name}
            <input type="checkbox" ${subtask.completed ? "checked" : ""} onchange="toggleSubtask(${taskIndex}, '${subtaskId}')" />
            <span class="checkmark"></span>
        </label>
    `).join("");
}

function toggleSubtask(taskIndex, subtaskId) {
    const task = tasks[taskIndex];
    const subtask = task.task.subtasks[subtaskId];
    subtask.completed = !subtask.completed;
    updateSubtaskBar(taskIndex);
    updatePopupSubtasks(taskIndex);
}

function updateSubtaskBar(taskIndex) {
    const task = tasks[taskIndex];
    const subtasks = task.task.subtasks;
    const total = Object.keys(subtasks).length;
    const completed = Object.values(subtasks).filter(subtask => subtask.completed).length;
    const subtaskBar = document.querySelector(`#subtaskBar-${taskIndex}`);
    if (subtaskBar) {
        subtaskBar.querySelector(".pb-blue").style.width = `${(completed / total) * 100}%`;
        subtaskBar.querySelector("span").innerText = `${completed}/${total} Subtasks`;
    }
}

function updatePopupSubtasks(taskIndex) {
    const task = tasks[taskIndex].task;
    const subtasksList = document.getElementById("subtasksList");
    if (subtasksList) {
        subtasksList.innerHTML = generateSubtasksHtml(task.subtasks, taskIndex);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function startDragging(id){
    currentDraggedElement = id;
}

function moveTo(category){
    tasks[currentDraggedElement].task['category'] = category;
    removeHighlight(category);
    document.querySelectorAll(".task-list").forEach(taskList => taskList.innerHTML = "");
    tasks.forEach((task, index) => insertTaskIntoDOM(task.task, index));
    checkEmptyCategories();
}

function highlight(categoryId) {
    let taskList = document.getElementById(categoryId).querySelector(".task-list");
    let existingHighlight = taskList.querySelector(".highlight");
    if (existingHighlight) {
        existingHighlight.remove();
    }
    const highlightElement = document.createElement("div");
    highlightElement.classList.add("highlight");
    taskList.appendChild(highlightElement);
}

function removeHighlight(categoryId) {
    const taskList = document.getElementById(categoryId).querySelector(".task-list");
    const highlightElement = taskList.querySelector(".highlight");
    if (highlightElement) {
        highlightElement.remove();
    }
}

function findTask() {
    const searchInput = document.getElementById("search-input");
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredTasks = filterTasksWithIndex(tasks, searchTerm);
    clearTaskLists();
    displayFilteredTasks(filteredTasks, searchTerm);
}

function filterTasksWithIndex(tasks, searchTerm){
    return tasks
    .map((task, index) => ({ ...task, originalIndex: index }))
    .filter(task =>
        task.task.title.toLowerCase().includes(searchTerm) ||
        task.task.description.toLowerCase().includes(searchTerm)
    );
}

function displayFilteredTasks(filteredTasks, searchTerm) {
    if (filteredTasks.length > 0) {
        filteredTasks.forEach((task) => insertTaskIntoDOM(task.task, task.originalIndex));
    } else {
        const taskLists = document.querySelectorAll(".task-list");
        taskLists.forEach(taskList => {
            taskList.innerHTML = `
                <div class="no-tasks">
                    No Tasks found for "<strong>${searchTerm}</strong>".
                </div>
            `;
        });
    }
}

function onSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        findTask();
    }, 500);
}

function clearTaskLists() {
    const taskLists = document.querySelectorAll(".task-list");
    taskLists.forEach(taskList => {
        taskList.innerHTML = "";
    });
}

function formatDateToDDMMYYYY(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

//Edit-Task 

function editTask() {
    if (currentTaskIndex === null) return;
    const task = tasks[currentTaskIndex].task;
    isEditing = true;
    task.subtasks = task.subtasks || {};
    const taskView = document.getElementById("taskView");
    const taskEdit = document.getElementById("taskEdit");
    taskView.classList.add("hidden");
    taskEdit.classList.remove("hidden");

    taskEdit.innerHTML = `
        <div class="popup-header">
            <div id="taskBadge">${generateTaskBadge(task.badge)}</div>
            <button onclick="closeTaskPopup()" class="close-btn">X</button>
        </div>
        <form id="editTaskForm" class="edit-task-form">
            <div class="form-group">
                <label for="editTaskTitle">Title</label>
                <input type="text" id="editTaskTitle" value="${task.title}" />
            </div>
            <div class="form-group">
                <label for="editTaskDescription">Description</label>
                <textarea id="editTaskDescription">${task.description}</textarea>
            </div>
            <div class="form-group">
                <label for="editTaskDueDate">Due Date</label>
                <input type="date" id="editTaskDueDate" value="${task.dueDate}" />
            </div>
            <div class="form-group">
                <label>Priority</label>
                <div class="priority-buttons">
                    ${["urgent", "medium", "low"].map(priority => `
                        <button type="button" class="priority-btn ${task.priority === priority ? "active" : ""}" 
                                onclick="setPriority('${priority}')"
                                data-priority="${priority}">
                                ${capitalizeFirstLetter(priority)}
                                <img src="./assets/icons/priority_${priority}.png" alt="${priority}">
                                </button>
                    `).join("")}
                </div>
            </div>
            <div class="form-group">
                <label>Assigned To</label>
                <div class="dropdown">
                    <button type="button" class="dropdown-toggle" onclick="toggleDropdown()">
                    Select contacts to assign
                    <img class="dropdown-icon" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
                    </button>
                    <div class="dropdown-menu" id="assignedToList">
                         ${Object.entries(contacts)
                            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                            .map(([contactKey, contact]) => {
                            const fullName = contact.name.split(" ");
                            const firstName = fullName[0] || "";
                            const lastName = fullName[1] || "";
                            const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
                            const bgColor = contact.color || "#cccccc";
                                return ` 
                                    <div class="dropdown-item" onclick="toggleDropdownItem(this)">
                                        <div class="dd-name">
                                            <div class="profile-circle" style="background-color: ${bgColor};">${initials}</div>
                                            <p> ${contacts[contactKey].name}</p>
                                        </div>
                                        <input type="checkbox" value="${contactKey}" 
                                            ${task.assignedTo && task.assignedTo[contactKey] ? "checked" : ""} />
                                        <span class="checkmark"></span>
                                    </div>
                                `;
                        }).join("")}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Subtasks</label>
                <div class="subtask-input-container">
                    <input type="text" id="newSubtaskInput" placeholder="Add new subtask" maxlength="30"/>
                    <button id="addSubtaskButton">
                        <img src="./assets/icons/add.svg" alt="add subtask">
                    </button>
                    <div class="subtask-icons hidden" id="subtaskIcons">
                        <img class="confirm-img" id="cancelSubtask" src="./assets/icons/contact_cancel.png" alt="cancel add subtask" onclick="cancelSubtaskInput()" />
                        <div class="subtask-vertical-line"></div>
                        <img class="confirm-img" id="createSubtask" src="./assets/icons/contact_create.png" alt="add subtask" onclick="addSubtask(event)" />
                    </div>
                </div>
                <ul class="subtasks-list" id="subtasksList">
                </ul>
            </div>
        </form>
        <div class="form-actions">
            <button class="add-task" type="button" onclick="saveTaskChanges()">
            Ok
            <img src="./assets/icons/contact_create.png"></img>
            </button>
        </div>
    `;
    updateSubtasksList(task);
    setupSubtaskInput();
}

function setupSubtaskInput() {
    const subtaskInput = document.getElementById("newSubtaskInput");
    const addIcon = document.getElementById("addSubtaskButton");
    const iconsContainer = document.getElementById("subtaskIcons");

    if (subtaskInput && addIcon && iconsContainer) {
        addIcon.classList.remove("hidden");
        iconsContainer.classList.add("hidden");
        subtaskInput.addEventListener("focus", () => {
            addIcon.classList.add("hidden");
            iconsContainer.classList.remove("hidden");
        });
        subtaskInput.addEventListener("blur", () => {
            if (!subtaskInput.value.trim()) {
                addIcon.classList.remove("hidden");
                iconsContainer.classList.add("hidden");
            }
        });
    }
}


function cancelSubtaskInput() {
    const newSubtaskInput = document.getElementById("newSubtaskInput");
    newSubtaskInput.value = "";
    document.getElementById("addSubtaskButton").classList.remove("hidden");
    document.getElementById("subtaskIcons").classList.add("hidden");
}

function addSubtask(event) {
    event.preventDefault();
    const task = tasks[currentTaskIndex]?.task;
    const subtaskName = getSubtaskName();
    if (subtaskName === "") return;
    if (canAddSubtask(task)) {
        addNewSubtask(task, subtaskName);
        updateSubtasksList(task);
        clearSubtaskInput();
        unfocusInput();
    } else {
        alert("Es können nur maximal 3 Subtasks hinzugefügt werden.");
    }
}

function getSubtaskName() {
    return document.getElementById('newSubtaskInput').value.trim();
}

function canAddSubtask(task) {
    return Object.keys(task.subtasks || {}).length < 3;
}

function addNewSubtask(task, subtaskName) {
    task.subtasks = task.subtasks || {};
    const subtaskId = `subtask-${subtaskCounter++}`;
    task.subtasks[subtaskId] = { name: subtaskName, completed: false };
}

function clearSubtaskInput() {
    document.getElementById('newSubtaskInput').value = "";
}

function unfocusInput() {
    document.getElementById('newSubtaskInput').blur();
}

function updateSubtasksList(task) {
    const subtasksList = document.querySelector('.subtasks-list');
    subtasksList.innerHTML = Object.entries(task.subtasks).map(([subtaskId, subtask]) => `
        <li id="${subtaskId}" class="subtask-item">
            <div class="subtask-item-name">
                <img class="ul-bullet" src="./assets/icons/addtask_arrowdown.png" alt="Arrow right">
                <span>${subtask.name}</span>
            </div>
            <div class="subtask-actions">
                <img src="./assets/icons/contact_edit.png" alt="Edit" title="Edit" onclick="editSubtask('${subtaskId}')" />
                <span class="separator"></span>
                <img src="./assets/icons/contact_basket.png" alt="Delete" title="Delete" onclick="deleteSubtask('${subtaskId}')" />
            </div>
        </li>
    `).join("");
}

function editSubtask(subtaskId) {
    const task = tasks[currentTaskIndex].task;
    const subtask = task.subtasks[subtaskId];
    const subtaskElement = document.getElementById(subtaskId);
    if (!subtask || !subtaskElement) return;
    const inputField = createInputField(subtask);
    const checkIcon = createCheckIcon();
    subtaskElement.innerHTML = '';
    subtaskElement.appendChild(inputField);
    subtaskElement.appendChild(checkIcon);
    checkIcon.addEventListener('click', function () {
        const newSubtaskName = inputField.value.trim();
        if (newSubtaskName) {
            subtask.name = newSubtaskName;
            updateSubtasksList(task);
        }
    });
}


function createCheckIcon() {
    let checkIcon = document.createElement('img');
    checkIcon.src = './assets/icons/contact_create.png';
    checkIcon.alt = 'Bestätigen';
    checkIcon.className = 'confirm-img';
    return checkIcon;
}

function createInputField(subtask){
    let inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = subtask.name;
    inputField.maxLength = '30';
    return inputField;
}

function deleteSubtask(subtaskId) {
    const task = tasks[currentTaskIndex].task;
    if (!task.subtasks[subtaskId]) return;
    delete task.subtasks[subtaskId];
    updateSubtasksList(task);
}
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setPriority(priority) {
    const priorityButtons = document.querySelectorAll(".priority-btn");
    let activeButton = null;
    priorityButtons.forEach(btn => {
        if (btn.classList.contains("active")) {
            activeButton = btn;
        }
        btn.classList.remove("active");
    });
    const clickedButton = document.querySelector(`.priority-btn[data-priority="${priority}"]`);
    if (clickedButton === activeButton) {
        return;
    }
    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}

function toggleDropdown() {
    const dropdown = document.querySelector(".dropdown");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const icon = document.querySelector(".dropdown-toggle .dropdown-icon");
    dropdown.classList.toggle("open");
    icon.classList.toggle("rotated");
    if (dropdown.classList.contains("open")) {
        switchToSearchInput(dropdownToggle);
        updateDropdownItems(dropdown);
    } else {
        dropdownToggle.blur()
        resetToDropdownButton(dropdownToggle);
    }
}

function switchToSearchInput(dropdownToggle) {
    dropdownToggle.innerHTML = `
        <input type="text" id="dropdownSearchInput" placeholder="" oninput="filterDropdownItems()" />
        <img class="dropdown-icon rotated" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
    `;
    const searchInput = document.getElementById("dropdownSearchInput");
    searchInput.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    searchInput.focus();
}

function resetToDropdownButton(dropdownToggle) {
    dropdownToggle.innerHTML = `
        Select contacts to assign
        <img class="dropdown-icon" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
    `;
}

function toggleDropdownItem(item) {
    const checkbox = item.querySelector("input[type='checkbox']");
    if (!checkbox) return;
    const contactKey = checkbox.value;
    checkbox.checked = !checkbox.checked;

    if (checkbox.checked) {
        tasks[currentTaskIndex].task.assignedTo = tasks[currentTaskIndex].task.assignedTo || {};
        tasks[currentTaskIndex].task.assignedTo[contactKey] = true;
    } else {
        if (tasks[currentTaskIndex].task.assignedTo) {
            delete tasks[currentTaskIndex].task.assignedTo[contactKey];
            if (Object.keys(tasks[currentTaskIndex].task.assignedTo).length === 0) {
                delete tasks[currentTaskIndex].task.assignedTo;
            }
        }
    }
    updateItemStyle(item, checkbox.checked);
}

function filterDropdownItems() {
    let searchInput = document.getElementById("dropdownSearchInput")
    const searchTerm = searchInput.value.toLowerCase();
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => {
        const contactName = item.querySelector("p").textContent.toLowerCase();
        if (contactName.includes(searchTerm)) {
            item.style.display = ""; 
        } else {
            item.style.display = "none";
        }
    });
}

function updateDropdownItems(dropdown) {
    const items = dropdown.querySelectorAll(".dropdown-item");
    items.forEach(item => {
        const checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox) {
            updateItemStyle(item, checkbox.checked);
        }
    });
}

function updateItemStyle(item, isChecked) {
    item.classList.toggle("checked", isChecked);
}

function saveTaskChanges() {
    const task = tasks[currentTaskIndex].task;
    task.title = document.getElementById("editTaskTitle").value;
    task.description = document.getElementById("editTaskDescription").value;
    task.dueDate = document.getElementById("editTaskDueDate").value;
    task.priority = document.querySelector(".priority-btn.active")?.getAttribute("data-priority");
    task.assignedTo = getAssignedContacts();
    task.subtasks = getCurrentSubtasks();
    tasks[currentTaskIndex].task = task;
    isEditing = false;
    refreshTaskPopup();
    updateTaskHtml(currentTaskIndex);
}

function updateTaskHtml(taskIndex) {
    const task = tasks[taskIndex].task;
    const taskDiv = document.getElementById(`task-${taskIndex}`);
    if (taskDiv) {
        taskDiv.outerHTML = generateTaskHtml(task, taskIndex, contacts);
    }
}

function getAssignedContacts() {
    const assignedContacts = {};
    const dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => {
        const checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox && checkbox.checked) {
            const contactKey = checkbox.value;
            if (contacts[contactKey]) {
                assignedContacts[contactKey] = contacts[contactKey];
            } else {
                console.warn(`Kontakt mit ID "${contactKey}" existiert nicht in contacts.`);
            }
        }
    });
    return assignedContacts;
}


function getCurrentSubtasks() {
    const subtasksList = document.querySelectorAll(".subtasks-list .subtask-item");
    const subtasks = {};

    subtasksList.forEach((subtaskElement, index) => {
        const subtaskName = subtaskElement.querySelector(".subtask-item-name span").textContent.trim();
        if (subtaskName) {
            subtasks[index] = { name: subtaskName, completed: false };
        }
    });

    return subtasks;
}

function refreshTaskPopup() {
    const taskView = document.getElementById("taskView");
    const taskEdit = document.getElementById("taskEdit");
    const taskPopup = document.getElementById("taskPopup");
    taskView.classList.remove("hidden");
    taskEdit.classList.add("hidden");
    if (!taskPopup.classList.contains("show")) {
        taskPopup.classList.add("show");
    }
    const task = tasks[currentTaskIndex].task;
    document.getElementById("taskBadge").innerHTML = generateTaskBadge(task.badge);
    document.getElementById("taskTitle").innerHTML = task.title;
    document.getElementById("taskDescription").innerHTML = task.description;
    document.getElementById("taskDueDate").innerHTML = formatDateToDDMMYYYY(task.dueDate);
    generateTaskPriorityElement(task.priority);
    document.getElementById("taskContacts").innerHTML = generateContactsHtml(task.assignedTo, contacts);
    document.getElementById("subtasksList").innerHTML = generateSubtasksHtml(task.subtasks, currentTaskIndex);
}