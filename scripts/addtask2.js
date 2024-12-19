async function init() {
    await loadTasks();
    renderAddTaskCard();
}

async function loadSidebarAndHeader() {
    const sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    const headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}

function renderAddTaskCard(task) {
    let addTaskContainer = document.querySelector(".addTask-content");

    if (!addTaskContainer) {
        return;
    }

    addTaskContainer.innerHTML = "";

    let addTaskCard = createAddTaskCard(task || { title: "", description: "", dueDate: "", priority: "" });
    addTaskContainer.appendChild(addTaskCard);
}

function generateAddTaskCardHTML(task) {
    return `
        <div class="addTask-left">
            <div class="addTask-title">
                <div class="addTask-title-header">
                    <h2>Title</h2>
                    <p>*</p>
                </div>
                <input class="addTask-title-field" id="task-title" value="${task.title}" placeholder="Enter a title">
            </div>
            <div class="addTask-description">
                <h2>Description</h2>
                <textarea class="addTask-input" id="task-description" placeholder="Enter a description">${task.description}</textarea>
            </div>
        </div>
        <div class="addTask-right">
            <div class="addTask-dueDate">
                <h2>Due Date</h2>
                <input class="addTask-input" id="task-dueDate" type="date" value="${task.dueDate}">
            </div>
            <div class="addTask-prio">
                <h2>Priority</h2>
                <select class="addTask-input" id="task-priority">
                    <option value="Low" ${task.priority === "Low" ? "selected" : ""}>Low</option>
                    <option value="Medium" ${task.priority === "Medium" ? "selected" : ""}>Medium</option>
                    <option value="High" ${task.priority === "High" ? "selected" : ""}>High</option>
                </select>
            </div>
        </div>
        <div class="addTask-buttons">
            <button class="cancel-task-button">Cancel</button>
            <button class="save-task-button">Save Task</button>
        </div>
    `;
}

function createAddTaskCard(task) {
    let addTaskCard = document.createElement("div");
    addTaskCard.classList.add("addTask-card");

    addTaskCard.innerHTML = generateAddTaskCardHTML(task);

    let saveButton = addTaskCard.querySelector(".save-task-button");
    saveButton.addEventListener("click", () => saveNewTask(task));

    let cancelButton = addTaskCard.querySelector(".cancel-task-button");
    cancelButton.addEventListener("click", clearTaskForm);

    return addTaskCard;
}

// Hilfsfunktion: Formulardaten löschen
function clearTaskForm() {
    document.querySelector(".addTask-content").innerHTML = "";
}

// Hilfsfunktion: Task speichern
async function saveNewTask() {
    let title = document.getElementById("task-title").value;
    let description = document.getElementById("task-description").value;
    let dueDate = document.getElementById("task-dueDate").value;
    let priority = document.getElementById("task-priority").value;

    let newTask = { title, description, dueDate, priority };

    try {
        await fetch(`${BASE_URL}tasks.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newTask),
        });

        alert("Task saved successfully!");
        clearTaskForm(); // Formular leeren
    } catch (error) {
        console.error("Error saving task:", error);
        alert("Failed to save task.");
    }
}