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
        insertTaskIntoDOM(tasks[i].task);
    }
};

async function getAllTasks(path) {
    const response = await fetch(BASE_URL + path + ".json");
    return data = await response.json();
}

function insertTaskIntoDOM(task){
    let catContainer = getCatContainerId(task);
    let taskHTML = generateTaskHtml(task);
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

function generateTaskHtml(task){
    return `
        <div class="task">
            <div class="task-badge ${task.badge === "User Story" ? "bg-blue" : task.badge === "Technical Task" ? "bg-green" : ""}">
                ${task.badge}
            </div>
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