/**
 * Generates the HTML for an empty category message.
 * @param {string} categoryId - The ID of the category (e.g., "To-Do", "In Progress").
 * @returns {string} The HTML string for the empty category message.
 */
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


/**
 * Generates the HTML for a task element.
 * @param {Object} task - The task object containing task details.
 * @param {number} index - The index of the task.
 * @returns {string} The HTML string for the task element.
 */
function generateTaskHtml(task, index) {
    let subtasks = task.subtasks || {}; 
    let { completed, total } = calculateSubtaskProgress(subtasks);
    return `
        <div class="task" id="task-${index}" draggable="true" onclick="openTaskPopup(${index})" ondragstart="startDragging(${index})">
            <div class="task-header">
                ${generateTaskBadge(task.badge)}
                ${task.category !== "Done" ? `
                    <button class="move-task-btn" onclick="showCategoryPopup(${index}, this, event)">
                        <img src="./assets/icons/moveTask.png" alt="Move Task">
                        <div id="category-popup" class="category-popup hidden">
                            <ul class="category-options"></ul>
                        </div>    
                    </button>
                ` : ""}
            </div>
            <div class="task-title">${task.title}</div>
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
                    ${task.assignedTo ? (() => {
                        const contactKeys = Object.keys(task.assignedTo)
                            .filter(contactKey => task.assignedTo[contactKey].name && task.assignedTo[contactKey].name.trim() !== "");
                        const displayedContacts = contactKeys.slice(0, 3);
                        const remainingCount = contactKeys.length - displayedContacts.length;
                        return displayedContacts.map(contactKey => {
                            let contactName = task.assignedTo[contactKey].name;
                            let bgColor = task.assignedTo[contactKey].color;
                            let initials = contactName.split(" ").map(name => name[0]).join("");
                            return `
                                <div class="profile-circle" style="background-color: ${bgColor};">
                                    ${initials}
                                </div>
                            `;
                        }).join("") + 
                        (remainingCount > 0 ? `
                            <div class="profile-circle extra-count">
                                +${remainingCount}
                            </div>
                        ` : "");
                    })() : ""}
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


/**
 * Updates the priority section of a task with the specified priority.
 * @param {string} priority - The priority level ("urgent", "medium", "low").
 */
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


/**
 * Generates an HTML template for displaying a contact in a task.
 * @param {string} initials - The initials of the contact.
 * @param {string} contactName - The full name of the contact.
 * @param {string} bgColor - The background color for the contact's profile circle.
 * @returns {string} The HTML string for the contact template.
 */
function contactsHtmlTemplate(initials, contactName, bgColor) {
    return `
        <div class="task-contact">
            <div class="profile-circle" style="background-color: ${bgColor};">
                ${initials}
            </div>
            <span>${contactName}</span>
        </div>
    `;
}


/**
 * Generates the HTML for a task badge based on the badge type.
 * @param {string} badgeType - The type of the badge ("User Story", "Technical Task").
 * @returns {string} The HTML string for the task badge.
 */
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


/**
 * Generates the HTML for a list of subtasks.
 * @param {Object} subtasks - The subtasks object where keys are IDs and values are subtask details.
 * @param {number} taskIndex - The index of the parent task.
 * @returns {string} The HTML string for the subtasks.
 */
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


/**
 * Displays filtered tasks or a "no tasks found" message based on the search results.
 * @param {Array} filteredTasks - The list of filtered tasks to display.
 * @param {string} searchTerm - The search term used for filtering.
 */
function displayFilteredTasks(filteredTasks, searchTerm) {
    if (filteredTasks.length > 0) {
        filteredTasks.forEach((task) => insertTaskIntoDOM(task.task, task.originalIndex));
    } else {
        let taskLists = document.querySelectorAll(".task-list");
        taskLists.forEach(taskList => {
            taskList.innerHTML = `
                <div class="no-tasks">
                    No Tasks found for "<strong>${searchTerm}</strong>".
                </div>
            `;
        });
    }
}


/**
 * Generates the HTML for editing a task in a popup.
 * @param {Object} task - The task object containing details of the task to edit.
 * @returns {string} The HTML string for the task editing popup.
 */
function generateTaskEditHTML(task) {
    return `
        <div class="popup-header">
            <div id="taskBadge">${generateTaskBadge(task.badge)}</div>
            <button class="close-btn" type="button" onclick="closeTaskPopup()">&#x2715</button>
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
                                <p>${capitalizeFirstLetter(priority)}</p>
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
                    <div class="selected-contacts" id="selectedContacts"></div>
                    <div class="dropdown-menu" id="assignedToList">
                         ${Object.entries(contacts)
                            .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                            .map(([contactKey, contact]) => {
                            let fullName = contact.name.split(" ");
                            let firstName = fullName[0] || "";
                            let lastName = fullName[1] || "";
                            let initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
                            let bgColor = contact.color || "#cccccc";
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
}


/**
 * Updates the subtasks list for a task.
 * @param {Object} task - The task object containing subtasks.
 */
function updateSubtasksList(task) {
    let subtasksList = document.querySelector('.subtasks-list');
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


/**
 * Switches a dropdown toggle button to display a search input.
 * @param {HTMLElement} dropdownToggle - The dropdown toggle button element.
 */
function switchToSearchInput(dropdownToggle) {
    dropdownToggle.innerHTML = `
        <input type="text" id="dropdownSearchInput" placeholder="" oninput="filterDropdownItems()" maxlength="20" />
        <img class="dropdown-icon rotated" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
    `;
    let searchInput = document.getElementById("dropdownSearchInput");
    searchInput.addEventListener("click", (event) => {
        event.stopPropagation();
    });
    searchInput.focus();
}


/**
 * Resets the dropdown toggle button to its default state.
 * @param {HTMLElement} dropdownToggle - The dropdown toggle button element.
 */
function resetToDropdownButton(dropdownToggle) {
    dropdownToggle.innerHTML = `
        Select contacts to assign
        <img class="dropdown-icon" src="./assets/icons/addtask_arrowdown.png" alt="Arrow down">
    `;
}