let tasks = [];
let contacts = {};
let currentDraggedElement;
let searchTimeout;
let currentTaskIndex = null;

async function onloadFunc(){
    contacts = await getData("/contacts");
    let userResponse = await getData("/tasks");
    let UserKeysArray = Object.keys(userResponse);

    for (let i = 0; i < UserKeysArray.length; i++) {
        const key = UserKeysArray[i];
        tasks.push({
            id: key,
            task: userResponse[key],
        });
    }
    for (let i = 0; i < tasks.length; i++) {
        insertTaskIntoDOM(tasks[i].task, i);
    }
    checkEmptyCategories();
};

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

function insertTaskIntoDOM(task, index){
    let catContainer = getCatContainerId(task);
    let taskHTML = generateTaskHtml(task, index, contacts);
    const taskList = catContainer.querySelector(".task-list");
    if (taskList) {
        taskList.innerHTML += taskHTML;
    }
}

function getCatContainerId(task) {
    if (!task.category) {
        task.category = "To-Do";
    }
    return document.getElementById(task.category);
}

function generateTaskHtml(task, index, contacts){
    let { completed, total } = calculateSubtaskProgress(task.subtasks);
    return `
        <div class="task" draggable="true" ondragstart="startDragging(${index})">
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
                        const initials = `${firstName[0]}${lastName[0]}`;
                        return `
                            <div class="profile-circle">
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
    const taskPopup = document.getElementById("taskPopup");
    if (taskPopup) {
        taskPopup.classList.remove("show");
        currentTaskIndex = null;
        document.body.style.overflow = "auto";
    }
}

function generateContactsHtml(assignedTo, contacts) {
    if (!assignedTo) return "";
    let contactsHtml = "";
    Object.keys(assignedTo).forEach(contactKey => {
        const contact = contacts[contactKey];
        if (contact) {
            const [firstName, lastName] = contact.name.split(" ");
            contactsHtml += contactsHtmlTemplate(firstName, lastName, contact);
        }
    });
    return contactsHtml;
}

function contactsHtmlTemplate(firstName, lastName, contact){
    return `
            <div class="task-contact">
                <div class="profile-circle">
                    ${firstName[0]}${lastName[0]}
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

    const taskPopupContent = document.querySelector(".popup-content");
    taskPopupContent.innerHTML = `
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
                    <img src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
                    </button>
                    <div class="dropdown-menu" id="assignedToList">
                        ${Object.keys(contacts).map(contactKey => {
                            const fullName = contacts[contactKey].name.split(" ");
                            const firstName = fullName[0] || "";
                            const lastName = fullName[1] || "";
                            const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
                                return `
                                    <div class="dropdown-item" onclick="toggleDropdownItem(this)">
                                        <div class="dd-name">
                                            <div class="profile-circle">${initials}</div>
                                            <p> ${contacts[contactKey].name}</p>
                                        </div>
                                        <input type="checkbox" value="${contactKey}" 
                                            ${task.assignedTo && task.assignedTo[contactKey] ? "checked" : ""} />
                                    </div>
                                `;
                        }).join("")}
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Subtasks (max 3)</label>
                <div id="subtasksContainer">
                    ${Object.values(task.subtasks || {}).map((subtask, index) => `
                        <input type="text" value="${subtask.name}" 
                               class="subtask-input" maxlength="50" data-index="${index}" />
                    `).join("")}
                    ${Object.keys(task.subtasks || {}).length < 3 ? `
                        <button type="button" onclick="addSubtask()">+ Add Subtask</button>
                    ` : ""}
                </div>
            </div>
        </form>
        <div class="form-actions">
            <button type="button" onclick="saveTaskChanges()">Save</button>
            <button type="button" onclick="closeTaskPopup()">Cancel</button>
        </div>
    `;
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
    dropdown.classList.toggle("open");
    document.querySelector(".dropdown-toggle").classList.toggle("dd-highlight");
}

function toggleDropdownItem(item){
let checkbox = item.querySelector("input[type='checkbox']");
if (!checkbox) return;
checkbox.checked = !checkbox.checked;
item.style.backgroundColor = checkbox.checked ? "#091830" : "";
item.style.color = checkbox.checked ? "white" : "black";
}

// function addSubtask() {
//     const subtasksContainer = document.getElementById("subtasksContainer");
//     const subtaskInputs = subtasksContainer.querySelectorAll(".subtask-input");
//     if (subtaskInputs.length < 3) {
//         const newSubtaskInput = document.createElement("input");
//         newSubtaskInput.type = "text";
//         newSubtaskInput.classList.add("subtask-input");
//         newSubtaskInput.maxLength = 50;
//         subtasksContainer.insertBefore(newSubtaskInput, subtasksContainer.querySelector("button"));
//     }
//     if (subtaskInputs.length === 2) {
//         subtasksContainer.querySelector("button").remove();
//     }
// }

function saveTaskChanges() {
    const title = document.getElementById("editTaskTitle").value;
    const description = document.getElementById("editTaskDescription").value;
    const dueDate = document.getElementById("editTaskDueDate").value;
    const priority = document.querySelector(".priority-btn.active")?.textContent || null;
    const assignedToCheckboxes = document.querySelectorAll("#assignedToList input[type='checkbox']");
    const assignedTo = {};
    assignedToCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            assignedTo[checkbox.value] = true;
        }
    });
    const subtaskInputs = document.querySelectorAll(".subtask-input");
    const subtasks = {};
    subtaskInputs.forEach((input, index) => {
        if (input.value.trim()) {
            subtasks[`subtask${index + 1}`] = { name: input.value.trim(), completed: false };
        }
    });
    const updatedTask = tasks[currentTaskIndex].task;
    updatedTask.title = title;
    updatedTask.description = description;
    updatedTask.dueDate = dueDate;
    updatedTask.priority = priority;
    updatedTask.assignedTo = assignedTo;
    updatedTask.subtasks = subtasks;

    document.querySelectorAll(".task-list").forEach(taskList => (taskList.innerHTML = ""));
    tasks.forEach((task, index) => insertTaskIntoDOM(task.task, index));
    checkEmptyCategories();

    closeTaskPopup();
}