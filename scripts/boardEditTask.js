
function editTask() {
    if (currentTaskIndex === null) return;
    let task = tasks[currentTaskIndex].task;
    isEditing = true;
    task.subtasks = task.subtasks || {};
    let taskView = document.getElementById("taskView");
    let taskEdit = document.getElementById("taskEdit");
    taskView.classList.add("hidden");
    taskEdit.classList.remove("hidden");
    taskEdit.innerHTML = generateTaskEditHTML(task);
    updateSubtasksList(task);
    setupSubtaskInput();
    populateSelectedContacts();
}



function populateSelectedContacts() {
    let selectedContacts = document.getElementById("selectedContacts");
    selectedContacts.innerHTML = "";
    const assignedTo = tasks[currentTaskIndex]?.task?.assignedTo || {};
    Object.values(assignedTo).forEach(({ name, color }) => {
        if (name && color) {
            let profileCircle = createProfileCircle({ name, color });
            selectedContacts.appendChild(profileCircle);
        }
    });
}

function setupSubtaskInput() {
    let subtaskInput = document.getElementById("newSubtaskInput");
    let addIcon = document.getElementById("addSubtaskButton");
    let iconsContainer = document.getElementById("subtaskIcons");

    if (subtaskInput && addIcon && iconsContainer) {
        initializeSubtaskUI(addIcon, iconsContainer);
        addSubtaskInputListeners(subtaskInput, addIcon, iconsContainer);
    }
}

function initializeSubtaskUI(addIcon, iconsContainer) {
    addIcon.classList.remove("hidden");
    iconsContainer.classList.add("hidden");
}

function addSubtaskInputListeners(subtaskInput, addIcon, iconsContainer) {
    subtaskInput.addEventListener("focus", () => toggleSubtaskIcons(addIcon, iconsContainer, true));
    subtaskInput.addEventListener("blur", () => {
        if (!subtaskInput.value.trim()) {
            toggleSubtaskIcons(addIcon, iconsContainer, false);
        }
    });
    subtaskInput.addEventListener("keydown", (event) => handleSubtaskInputKeydown(event));
}

function toggleSubtaskIcons(addIcon, iconsContainer, isFocused) {
    addIcon.classList.toggle("hidden", isFocused);
    iconsContainer.classList.toggle("hidden", !isFocused);
}

function handleSubtaskInputKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addSubtask(event);
    }
}




function cancelSubtaskInput() {
    let newSubtaskInput = document.getElementById("newSubtaskInput");
    newSubtaskInput.value = "";
    document.getElementById("addSubtaskButton").classList.remove("hidden");
    document.getElementById("subtaskIcons").classList.add("hidden");
}

function addSubtask(event) {
    event.preventDefault();
    let task = tasks[currentTaskIndex]?.task;
    let subtaskName = getSubtaskName();
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
    let subtaskId = `subtask-${subtaskCounter++}`;
    task.subtasks[subtaskId] = { name: subtaskName, completed: false };
}

function clearSubtaskInput() {
    document.getElementById('newSubtaskInput').value = "";
}

function unfocusInput() {
    document.getElementById('newSubtaskInput').blur();
}



function editSubtask(subtaskId) {
    let task = tasks[currentTaskIndex].task;
    let subtask = task.subtasks[subtaskId];
    let subtaskElement = document.getElementById(subtaskId);
    if (!subtask || !subtaskElement) return;
    setupSubtaskEditUI(subtask, subtaskElement, task);
}

function setupSubtaskEditUI(subtask, subtaskElement, task) {
    let inputField = createInputField(subtask);
    let checkIcon = createCheckIcon();
    subtaskElement.innerHTML = '';
    subtaskElement.appendChild(inputField);
    subtaskElement.appendChild(checkIcon);
    checkIcon.addEventListener('click', function () {
        handleSubtaskSave(inputField, subtask, task);
    });
}

function handleSubtaskSave(inputField, subtask, task) {
    let newSubtaskName = inputField.value.trim();
    if (newSubtaskName) {
        subtask.name = newSubtaskName;
        updateSubtasksList(task);
    }
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
    let task = tasks[currentTaskIndex].task;
    if (!task.subtasks[subtaskId]) return;
    delete task.subtasks[subtaskId];
    updateSubtasksList(task);
}
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function setPriority(priority) {
    let activeButton = getActivePriorityButton();
    let clickedButton = document.querySelector(`.priority-btn[data-priority="${priority}"]`);

    if (clickedButton !== activeButton) {
        updatePriorityButtonState(clickedButton);
    }
}

function getActivePriorityButton() {
    let activeButton = null;
    let priorityButtons = document.querySelectorAll(".priority-btn");
    priorityButtons.forEach(btn => btn.classList.remove("active"));
    priorityButtons.forEach(btn => {
        if (btn.classList.contains("active")) {
            activeButton = btn;
        }
    });
    return activeButton;
}

function updatePriorityButtonState(clickedButton) {
    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}


function toggleDropdown() {
    let dropdown = document.querySelector(".dropdown");
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    let icon = document.querySelector(".dropdown-toggle .dropdown-icon");
    dropdown.classList.toggle("open");
    icon.classList.toggle("rotated");
    if (dropdown.classList.contains("open")) {
        handleDropdownOpen(dropdown, dropdownToggle);
    } else {
        handleDropdownClose(dropdownToggle);
    }
}

function handleDropdownOpen(dropdown, dropdownToggle) {
    switchToSearchInput(dropdownToggle);
    updateDropdownItems(dropdown);
    document.addEventListener("click", handleOutsideClick);
}

function handleDropdownClose(dropdownToggle) {
    dropdownToggle.blur();
    resetToDropdownButton(dropdownToggle);
    document.removeEventListener("click", handleOutsideClick);
}


function handleOutsideClick(event) {
    let dropdown = document.querySelector(".dropdown");
    let dropdownToggle = document.querySelector(".dropdown-toggle");
    if (!dropdown.contains(event.target) && !dropdownToggle.contains(event.target)) {
        dropdown.classList.remove("open");
        let icon = document.querySelector(".dropdown-toggle .dropdown-icon");
        icon.classList.remove("rotated");
        resetToDropdownButton(dropdownToggle);
        document.removeEventListener("click", handleOutsideClick);
    }
}





function toggleDropdownItem(item) {
    let checkbox = item.querySelector("input[type='checkbox']");
    if (!checkbox) return;
    checkbox.checked = !checkbox.checked;
    let contactKey = checkbox.value;
    let contact = contacts[contactKey];
    updateTaskAssignment(contactKey, checkbox.checked);
    updateItemStyle(item, checkbox.checked);
    updateSelectedContactsDisplay(contact, checkbox.checked);
}

function updateTaskAssignment(contactKey, isChecked) {
    let task = tasks[currentTaskIndex].task;
    task.assignedTo = task.assignedTo || {};

    if (isChecked) {
        task.assignedTo[contactKey] = true;
    } else {
        delete task.assignedTo[contactKey];
        if (Object.keys(task.assignedTo).length === 0) {
            delete task.assignedTo;
        }
    }
}


function updateSelectedContactsDisplay(contact, isSelected) {
    let selectedContacts = document.getElementById("selectedContacts");
    if (isSelected) {
        let profileCircle = createProfileCircle(contact);
        selectedContacts.appendChild(profileCircle);
    } else {
        removeProfileCircle(contact.id);
    }
}

function createProfileCircle(contact) {
    let fullName = contact.name.split(" ");
    let firstName = fullName[0] || "";
    let lastName = fullName[1] || "";
    let initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
    let bgColor = contact.color || "#cccccc";
    let profileCircle = document.createElement("div");
    profileCircle.className = "profile-circle";
    profileCircle.style.backgroundColor = bgColor;
    profileCircle.textContent = initials;
    profileCircle.dataset.contactKey = contact.id;
    return profileCircle;
}

function removeProfileCircle(contactKey) {
    let selectedContacts = document.getElementById("selectedContacts");
    let profileCircle = selectedContacts.querySelector(`[data-contact-key="${contactKey}"]`);
    if (profileCircle) {
        selectedContacts.removeChild(profileCircle);
    }
}

function filterDropdownItems() {
    let searchInput = document.getElementById("dropdownSearchInput")
    let searchTerm = searchInput.value.toLowerCase();
    let dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => {
        let contactName = item.querySelector("p").textContent.toLowerCase();
        if (contactName.includes(searchTerm)) {
            item.style.display = ""; 
        } else {
            item.style.display = "none";
        }
    });
}

function updateDropdownItems(dropdown) {
    let items = dropdown.querySelectorAll(".dropdown-item");
    items.forEach(item => {
        let checkbox = item.querySelector("input[type='checkbox']");
        if (checkbox) {
            updateItemStyle(item, checkbox.checked);
        }
    });
}

function updateItemStyle(item, isChecked) {
    item.classList.toggle("checked", isChecked);
}


function updateTaskHtml(taskIndex) {
    let task = tasks[taskIndex].task;
    let taskDiv = document.getElementById(`task-${taskIndex}`);
    if (taskDiv) {
        taskDiv.outerHTML = generateTaskHtml(task, taskIndex, contacts);
    }
}

async function saveTaskChanges() {
    let taskObj = tasks[currentTaskIndex];
    if (!taskObj || !taskObj.id) return handleError();
    let task = taskObj.task;
    task = updateTaskFields(task);
    await updateTaskData(taskObj.id, task);
    refreshTaskPopup();
    updateTaskHtml(currentTaskIndex);
}

function handleError() {
    console.error("Task ID is undefined. Cannot update task.");
}

function updateTaskFields(task) {
    task.title = document.getElementById("editTaskTitle").value;
    task.description = document.getElementById("editTaskDescription").value;
    task.dueDate = document.getElementById("editTaskDueDate").value;
    task.priority = document.querySelector(".priority-btn.active")?.getAttribute("data-priority");
    task.assignedTo = getAssignedContacts();
    task.subtasks = getCurrentSubtasks();
    return task;
}

async function updateTaskData(taskId, task) {
    await putData(`tasks/${taskId}`, task);
    tasks[currentTaskIndex].task = task;
    isEditing = false;
}



function getAssignedContacts() {
    let assignedContacts = {};
    let dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach(item => processDropdownItem(item, assignedContacts));
    return assignedContacts;
}

function processDropdownItem(item, assignedContacts) {
    let checkbox = item.querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
        let contactKey = checkbox.value;
        addContactToAssigned(contactKey, assignedContacts);
    }
}

function addContactToAssigned(contactKey, assignedContacts) {
    if (contacts[contactKey]) {
        assignedContacts[contactKey] = {
            name: contacts[contactKey].name,
            color: contacts[contactKey].color
        };
    } else {
        console.warn(`Kontakt mit ID "${contactKey}" existiert nicht in contacts.`);
    }
}




function getCurrentSubtasks() {
    let subtasksList = document.querySelectorAll(".subtasks-list .subtask-item");
    let subtasks = {};
    subtasksList.forEach((subtaskElement, index) => {
        let subtaskName = subtaskElement.querySelector(".subtask-item-name span").textContent.trim();
        if (subtaskName) {
            subtasks[index] = { name: subtaskName, completed: false };
        }
    });
    return subtasks;
}

function refreshTaskPopup() {
    showTaskView();
    let task = tasks[currentTaskIndex].task;
    updateTaskDetails(task);
}

function showTaskView() {
    let taskView = document.getElementById("taskView");
    let taskEdit = document.getElementById("taskEdit");
    let taskPopup = document.getElementById("taskPopup");
    taskView.classList.remove("hidden");
    taskEdit.classList.add("hidden");
    if (!taskPopup.classList.contains("show")) {
        taskPopup.classList.add("show");
    }
}

function updateTaskDetails(task) {
    document.getElementById("taskBadge").innerHTML = generateTaskBadge(task.badge);
    document.getElementById("taskTitle").innerHTML = task.title;
    document.getElementById("taskDescription").innerHTML = task.description;
    document.getElementById("taskDueDate").innerHTML = formatDateToDDMMYYYY(task.dueDate);
    generateTaskPriorityElement(task.priority);
    document.getElementById("taskContacts").innerHTML = generateContactsHtml(task.assignedTo, contacts);
    document.getElementById("subtasksList").innerHTML = generateSubtasksHtml(task.subtasks, currentTaskIndex);
}
