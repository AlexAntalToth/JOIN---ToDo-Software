let tasks = [];
let contacts = {};
let currentDraggedElement;

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

function getCatContainerId(task){
    return document.getElementById(task.category);
}

function generateTaskHtml(task, index, contacts){
    return `
        <div onclick="openTaskPopup(${index})" class="task" draggable="true" ondragstart="startDragging(${index})">
             ${generateTaskBadge(task.badge)}
            <div class="task-title">${task.title}</div>
            <div class="task-desc">${task.description}</div>
            <div class="subtask-bar">
                ${task.subtasks ? `
                    <div class="pb-bg">
                        <div class="pb-blue" style="width: ${(task.subtasks.completed / task.subtasks.total) * 100}%;"></div>
                    </div>
                    <span>${task.subtasks.completed}/${task.subtasks.total} Subtasks</span>
                ` : ""}
            </div>
            <div class="task-footer">
                <div class="contacts">
                    ${task.assignedTo 
                        ? Object.keys(task.assignedTo).map(contactKey => {
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
                        }).join("") 
                        : ""}
                </div>
                <div class="priority">
                    <img src="./assets/icons/priority_${task.priority}.png" alt="Priority">
                </div>
            </div>
        </div>
    `;
}

function openTaskPopup(index){
    const task = tasks[index].task;
    document.getElementById("taskBadge").innerHTML = generateTaskBadge(task.badge);
    document.getElementById("taskTitle").innerText = task.title;
    document.getElementById("taskDescription").innerText = task.description;
    document.getElementById("taskDueDate").innerText = task.dueDate;
    document.getElementById("taskPriority").innerHTML = `
    <p>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
    <img src="./assets/icons/priority_${task.priority}.png" alt="Priority">
    `;
    document.getElementById("taskContacts").innerHTML = generateContactsHtml(task.assignedTo, contacts);
    document.getElementById("subtasksList").innerHTML = generateSubtasksHtml(task.subtasks);
    document.getElementById("taskPopup").classList.add("show");
}

function closeTaskPopup(event) {
    if (event.target === document.getElementById("taskPopup") || event.target.classList.contains("close-btn")) {
        document.getElementById("taskPopup").classList.remove("show");
    }
}

function generateContactsHtml(assignedTo, contacts) {
    if (!assignedTo) return "";
    let contactsHtml = "";
    Object.keys(assignedTo).forEach(contactKey => {
        const contact = contacts[contactKey];
        if (contact) {
            const [firstName, lastName] = contact.name.split(" ");
            contactsHtml += `
            <div class="task-contact">
                <div class="profile-circle">
                    ${firstName[0]}${lastName[0]}
                </div>
                <span>${contact.name}</span>
            </div>
            `;
        }
    });
    return contactsHtml;
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

function generateSubtasksHtml(subtasks) {
    if (!subtasks) return "";

    let subtasksHtml = "";
    Object.keys(subtasks).forEach(subtaskKey => {
        const subtask = subtasks[subtaskKey];
        subtasksHtml += `
            <label class="label-container">
                ${subtask.name}
                <input type="checkbox" ${subtask.completed ? "checked" : ""} />
                <span class="checkmark"></span>
            </label>
        `;
    });
    return subtasksHtml;
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