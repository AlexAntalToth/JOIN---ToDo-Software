let tasks = [];
const BASE_URL="https://remotestorage-2a5f0-default-rtdb.europe-west1.firebasedatabase.app/";

async function onloadFunc(){
    let userResponse = await getAllTasks("/tasks");
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
};

async function getAllTasks(path) {
    const response = await fetch(BASE_URL + path + ".json");
    return data = await response.json();
}

function insertTaskIntoDOM(task, index){
    let catContainer = getCatContainerId(task);
    let taskHTML = generateTaskHtml(task, index);
    const taskList = catContainer.querySelector(".task-list");
    if (taskList) {
        taskList.innerHTML += taskHTML;
    }
}

function getCatContainerId(task){
    let catContainerId;

    if (task.category === "To-Do") {
        catContainerId = "toDo";
    } else if (task.category === "In Progress") {
        catContainerId = "inProgress";
    } else if (task.category === "Await Feedback") {
        catContainerId = "awaitFeedback";
    } else if (task.category === "Done") {
        catContainerId = "done";
    }
    const catContainer = document.getElementById(catContainerId);
    return catContainer;
}

function generateTaskHtml(task, index){
    return `
        <div onclick="openTaskPopup(${index})" class="task">
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
                        const contact = task.assignedTo[contactKey];
                        return `
                            <div class="profile-circle">
                                ${contact.firstName[0]}${contact.lastName[0]}
                            </div>
                        `;
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
    document.getElementById("taskContacts").innerHTML = generateContactsHtml(task.assignedTo);
    
    document.getElementById("taskPopup").classList.add("show");
}

function closePopup() {
    document.getElementById("taskPopup").classList.remove("show");
}

function generateContactsHtml(assignedTo) {
    if (!assignedTo) return "";
    let contactsHtml = "";
    Object.keys(assignedTo).forEach(contactKey => {
        const contact = assignedTo[contactKey];
        contactsHtml += `
        <div class="task-contact">
            <div class="profile-circle">
                ${contact.firstName[0]}${contact.lastName[0]}
            </div>
            <span>${contact.firstName} ${contact.lastName}</span>
            </div>
        `;
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