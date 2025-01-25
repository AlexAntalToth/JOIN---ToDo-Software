//Header and Sidebar
/**
 * Loads the sidebar and header templates asynchronously and inserts them into 
 * their respective containers in the DOM.
 * 
 * @async
 * @function
 * @returns {Promise<void>} A promise that resolves when the sidebar and header content 
 *                          has been successfully fetched and inserted.
 */
async function loadSidebarAndHeader() {
    let sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;
    let headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}


//Main
/**
 * Generates the HTML for the "Add Task" card, including task details, contact assignments, 
 * due date, priority, category and subtasks.
 * 
 * @async
 * @function generateAddTaskCardHTML
 * @param {Object} task - The task object containing task details.
 * @param {string} task.title - The title of the task.
 * @param {string} task.description - The description of the task.
 * @param {string} task.dueDate - The due date for the task in 'yyyy-mm-dd' format.
 * @param {string} task.priority - The priority level of the task (e.g., 'low', 'medium', 'high').
 * @returns {Promise<string>} - A promise that resolves to a string containing the HTML structure for the "Add Task" card.
 */
async function generateAddTaskCardHTML(task) {
    let contacts = await loadTaskContacts();
    let contactList = contacts
        .map(contact => `
            <div class="contact-item" data-id="${contact.id}">
                <div class="contact-initials" style="background-color: ${contact.color};">
                    ${contact.name.split(" ").map(name => name[0]).join("").toUpperCase()}
                </div>
                <span class="contact-name">${contact.name}</span>
                <input type="checkbox" class="contact-checkbox" data-id="${contact.id}" />
            </div>
        `)
        .join("");

    return `
        <div class="addTask-left">
            <div class="addTask-title">
                <div class="addTask-title-header">
                    <h2>Title</h2>
                    <p>*</p>
                </div>
                <input class="addTask-title-field" id="task-title" value="${task.title}" placeholder="Enter a title" required data-focused="false">
            </div>
            <div class="addTask-description">
                <h2>Description</h2>
                <textarea class="addTask-description-field" id="task-description" placeholder="Enter a description">${task.description}</textarea>
            </div>
            <div class="addTask-assignedTo">
                <h2 class="addTask-assignedTo-header">Assigned to</h2>
                <div class="addTask-assignedTo-container">
                    <div class="addTask-assignedTo-mainField">
                        <div class="addTask-assignedTo-field" id="task-assignedTo">
                            <span id="assignedToText">Select contacts to assign</span>
                            <input type="text" id="searchContacts" class="addTask-contact-search" placeholder="Search contacts..." style="display: none;" />
                        </div>
                        <div class="addTask-assignedTo-icon-wrapper">
                            <img class="addTask-assignedTo-icon" src="../../assets/icons/addtask_arrowdown2.png" alt="Arrow Down">
                        </div>
                    </div>
                    <div class="addTask-assignedTo-contactList" id="contactList" style="display: none;">
                        <div class="contact-list-scrollable">
                            ${contactList}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="addTask-vertical-line">
        </div>
        <div class="addTask-right">
            <div class="addTask-dueDate">
                <div class="addTask-dueDate-header">
                    <h2>Due Date</h2>
                    <p>*</p>
                </div>
                <div class="addTask-dueDate-field">
                    <input id="task-dueDate" type="date" value="${task.dueDate || ''}" placeholder="dd/mm/yyyy">
                    <img class="addTask-date-icon" src="../../assets/icons/addTask_date.png" alt="Logo Due Date">
                </div>
            </div>
            <div class="addTask-prio">
                <div class="addTask-prio-header">
                    <h2>Prio</h2>
                </div>
                <div class="addTask-prio-field" id="task-priority" ${task.priority}>
                    <button class= "addTask-prio-button" id="task-urgent">
                        <h2>Urgent</h2>
                        <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.6528 15.2547C19.4182 15.2551 19.1896 15.1803 19.0007 15.0412L10.7487 8.958L2.49663 15.0412C2.38078 15.1267 2.24919 15.1887 2.10939 15.2234C1.96959 15.2582 1.82431 15.2651 1.68184 15.2437C1.53937 15.2223 1.40251 15.1732 1.27906 15.099C1.15562 15.0247 1.04801 14.927 0.96238 14.8112C0.876751 14.6954 0.814779 14.5639 0.780002 14.4243C0.745226 14.2846 0.738325 14.1394 0.759696 13.997C0.802855 13.7095 0.958545 13.4509 1.19252 13.2781L10.0966 6.70761C10.2853 6.56802 10.5139 6.49268 10.7487 6.49268C10.9835 6.49268 11.212 6.56802 11.4007 6.70761L20.3048 13.2781C20.4908 13.415 20.6286 13.6071 20.6988 13.827C20.7689 14.0469 20.7678 14.2833 20.6955 14.5025C20.6232 14.7216 20.4834 14.9124 20.2962 15.0475C20.1089 15.1826 19.8837 15.2551 19.6528 15.2547Z" fill="#FF3D00"/>
                            <path d="M19.6528 9.50568C19.4182 9.50609 19.1896 9.43124 19.0007 9.29214L10.7487 3.20898L2.49663 9.29214C2.26266 9.46495 1.96957 9.5378 1.68184 9.49468C1.39412 9.45155 1.13532 9.29597 0.962385 9.06218C0.789449 8.82838 0.716541 8.53551 0.7597 8.24799C0.802859 7.96048 0.95855 7.70187 1.19252 7.52906L10.0966 0.958588C10.2853 0.818997 10.5139 0.743652 10.7487 0.743652C10.9835 0.743652 11.212 0.818997 11.4007 0.958588L20.3048 7.52906C20.4908 7.66598 20.6286 7.85809 20.6988 8.07797C20.769 8.29785 20.7678 8.53426 20.6955 8.75344C20.6232 8.97262 20.4834 9.16338 20.2962 9.29847C20.1089 9.43356 19.8837 9.50608 19.6528 9.50568Z" fill="#FF3D00"/>
                        </svg>
                        </button>
                        <button class= "addTask-prio-button" id="task-medium">
                            <h2>Medium</h2>
                            <svg width="21" height="8" viewBox="0 0 21 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.1526 7.72528H1.34443C1.05378 7.72528 0.775033 7.60898 0.569514 7.40197C0.363995 7.19495 0.248535 6.91419 0.248535 6.62143C0.248535 6.32867 0.363995 6.0479 0.569514 5.84089C0.775033 5.63388 1.05378 5.51758 1.34443 5.51758H19.1526C19.4433 5.51758 19.722 5.63388 19.9276 5.84089C20.1331 6.0479 20.2485 6.32867 20.2485 6.62143C20.2485 6.91419 20.1331 7.19495 19.9276 7.40197C19.722 7.60898 19.4433 7.72528 19.1526 7.72528Z" fill="orange"/>
                                <path d="M19.1526 2.48211H1.34443C1.05378 2.48211 0.775033 2.36581 0.569514 2.1588C0.363995 1.95179 0.248535 1.67102 0.248535 1.37826C0.248535 1.0855 0.363995 0.804736 0.569514 0.597724C0.775033 0.390712 1.05378 0.274414 1.34443 0.274414L19.1526 0.274414C19.4433 0.274414 19.722 0.390712 19.9276 0.597724C20.1331 0.804736 20.2485 1.0855 20.2485 1.37826C20.2485 1.67102 20.1331 1.95179 19.9276 2.1588C19.722 2.36581 19.4433 2.48211 19.1526 2.48211Z" fill="orange"/>
                            </svg>
                        </button>
                        <button class= "addTask-prio-button" id="task-low">
                            <h2>Low</h2>
                            <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.2485 9.50589C10.0139 9.5063 9.7854 9.43145 9.59655 9.29238L0.693448 2.72264C0.57761 2.63708 0.47977 2.52957 0.405515 2.40623C0.33126 2.28289 0.282043 2.14614 0.260675 2.00379C0.217521 1.71631 0.290421 1.42347 0.463337 1.1897C0.636253 0.955928 0.895022 0.800371 1.18272 0.757248C1.47041 0.714126 1.76347 0.786972 1.99741 0.95976L10.2485 7.04224L18.4997 0.95976C18.6155 0.874204 18.7471 0.812285 18.8869 0.777538C19.0266 0.742791 19.1719 0.735896 19.3144 0.757248C19.4568 0.7786 19.5937 0.82778 19.7171 0.901981C19.8405 0.976181 19.9481 1.07395 20.0337 1.1897C20.1194 1.30545 20.1813 1.43692 20.2161 1.57661C20.2509 1.71629 20.2578 1.86145 20.2364 2.00379C20.215 2.14614 20.1658 2.28289 20.0916 2.40623C20.0173 2.52957 19.9195 2.63708 19.8036 2.72264L10.9005 9.29238C10.7117 9.43145 10.4831 9.5063 10.2485 9.50589Z" fill="#7AE229"/>
                                <path d="M10.2485 15.2544C10.0139 15.2548 9.7854 15.18 9.59655 15.0409L0.693448 8.47117C0.459502 8.29839 0.30383 8.03981 0.260675 7.75233C0.217521 7.46485 0.290421 7.17201 0.463337 6.93824C0.636253 6.70446 0.895021 6.54891 1.18272 6.50578C1.47041 6.46266 1.76347 6.53551 1.99741 6.7083L10.2485 12.7908L18.4997 6.7083C18.7336 6.53551 19.0267 6.46266 19.3144 6.50578C19.602 6.54891 19.8608 6.70446 20.0337 6.93824C20.2066 7.17201 20.2795 7.46485 20.2364 7.75233C20.1932 8.03981 20.0376 8.29839 19.8036 8.47117L10.9005 15.0409C10.7117 15.18 10.4831 15.2548 10.2485 15.2544Z" fill="#7AE229"/>
                            </svg>
                        </button>
                </div>
            </div>
            <div class="addTask-category">
                <div class="addTask-category-header">
                    <h2>Category</h2>
                    <p>*</p>
                </div>
                <div class="addTask-category-container">
                    <div class="addTask-category-field" id="task-category">
                    <span>Select task category</span>
                    </div>
                    <div class="addTask-category-icon-wrapper">
                        <img class="addTask-category-icon" src="../../assets/icons/addtask_arrowdown2.png" alt="Logo Arrow Down">
                    </div>
                    <div class="addTask-category-dropdown" id="categoryDropdown" style="display: none;">
                        <div class="category-item" data-value="Technical Task">Technical Task</div>
                        <div class="category-item" data-value="User Story">User Story</div>
                    </div>
                </div>
            </div>
            <div class="addTask-subtasks">
                <h2>Subtasks</h2>
                <div class="addTask-subtasks-field">
                    <input class="addTask-subtasks-content" type="text" id="addTaskNewSubTaskInput" placeholder="Add new subtask">
                    <svg class="addTask-subtasks-icon-add" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_75601_15213" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                        <rect x="0.248535" width="24" height="25" fill="#D9D9D9"/>
                        </mask>
                        <g mask="url(#mask0_75601_15213)">
                        <path d="M11.2485 13H6.24854C5.9652 13 5.7277 12.9042 5.53604 12.7125C5.34437 12.5208 5.24854 12.2833 5.24854 12C5.24854 11.7167 5.34437 11.4792 5.53604 11.2875C5.7277 11.0958 5.9652 11 6.24854 11H11.2485V6C11.2485 5.71667 11.3444 5.47917 11.536 5.2875C11.7277 5.09583 11.9652 5 12.2485 5C12.5319 5 12.7694 5.09583 12.961 5.2875C13.1527 5.47917 13.2485 5.71667 13.2485 6V11H18.2485C18.5319 11 18.7694 11.0958 18.961 11.2875C19.1527 11.4792 19.2485 11.7167 19.2485 12C19.2485 12.2833 19.1527 12.5208 18.961 12.7125C18.7694 12.9042 18.5319 13 18.2485 13H13.2485V18C13.2485 18.2833 13.1527 18.5208 12.961 18.7125C12.7694 18.9042 12.5319 19 12.2485 19C11.9652 19 11.7277 18.9042 11.536 18.7125C11.3444 18.5208 11.2485 18.2833 11.2485 18V13Z" fill="#2A3647"/>
                        </g>
                    </svg>
                    <div class="addTask-icons-input">
                        <svg class="cancel-addTask-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                            <path d="M12.001 12.5001L17.244 17.7431M6.758 17.7431L12.001 12.5001L6.758 17.7431ZM17.244 7.25708L12 12.5001L17.244 7.25708ZM12 12.5001L6.758 7.25708L12 12.5001Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>  
                        <div class="addTask-subtasks-vertical-line">
                        </div>
                        <div id="addSubtaskButton2" onclick="addSubtask(event)">
                            <svg class="create-addTask-icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <mask id="mask0_267600_4053" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                                    <rect y="0.5" width="24" height="24" fill="#D9D9D9"/>
                                </mask>
                                <g mask="url(#mask0_267600_4053)">
                                    <path d="M9.55057 15.65L18.0256 7.175C18.2256 6.975 18.4631 6.875 18.7381 6.875C19.0131 6.875 19.2506 6.975 19.4506 7.175C19.6506 7.375 19.7506 7.6125 19.7506 7.8875C19.7506 8.1625 19.6506 8.4 19.4506 8.6L10.2506 17.8C10.0506 18 9.81724 18.1 9.55057 18.1C9.28391 18.1 9.05057 18 8.85057 17.8L4.55057 13.5C4.35057 13.3 4.25474 13.0625 4.26307 12.7875C4.27141 12.5125 4.37557 12.275 4.57557 12.075C4.77557 11.875 5.01307 11.775 5.28807 11.775C5.56307 11.775 5.80057 11.875 6.00057 12.075L9.55057 15.65Z" fill="black"/>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
                        <ul class="subtasks-list" id="addTaskSubtasksList">
                        </ul>
            </div>
        </div>
        <div id="task-created-popup" class="task-created-popup">
            <span>Task added to board</span>
            <img class="task-created-icon" src="../../assets/icons/board.png" alt="Board Icon">
        </div>
    `;
}


//AssignedTo
/**
 * Retrieves DOM elements related to the "assigned to" section of the task.
 * This function checks if all required elements exist in the DOM and returns them
 * as an object. If any of the elements are missing, it returns `null`.
 * 
 * @returns {Object|null} An object containing the DOM elements for the assignedTo section,
 * or `null` if any of the elements are not found.
 * @property {HTMLElement} assignedToField - The input field for assigned tasks.
 * @property {HTMLElement} contactList - The list of contacts to assign to the task.
 * @property {HTMLElement} assignedToContainer - The container wrapping the assignedTo section.
 * @property {HTMLElement} assignedToIconWrapper - The wrapper for the assignedTo icon.
 * @property {HTMLElement} searchContacts - The search input for finding contacts.
 * @property {HTMLElement} assignedToText - The text element showing the current assigned contact.
 */
function getAssignedToElements() {
    let assignedToField = document.getElementById("task-assignedTo");
    let contactList = document.getElementById("contactList");
    let assignedToContainer = document.querySelector(".addTask-assignedTo-container");
    let assignedToIconWrapper = document.querySelector(".addTask-assignedTo-icon-wrapper");
    let searchContacts = document.getElementById("searchContacts");
    let assignedToText = document.getElementById("assignedToText");
    if (!assignedToField || !contactList || !assignedToIconWrapper || !searchContacts || !assignedToText) {
        return null;
    }
    return {
        assignedToField,
        contactList,
        assignedToContainer,
        assignedToIconWrapper,
        searchContacts,
        assignedToText,
    };
}


/**
 * Updates the initials of selected contacts and adds them to the assignedTo container.
 * Removes the previous list of selected contacts and creates a new one based on the current selected contacts.
 * If the number of contacts exceeds the available space, it shows a `+X` indicating the number of remaining contacts.
 * 
 * @function
 */
function updateSelectedContactInitials() {
    let assignedToContainer = document.querySelector(".addTask-assignedTo-container");
    let selectedContactsDiv = document.querySelector(".selected-contacts");

    if (selectedContactsDiv) selectedContactsDiv.remove();
    
    if (selectedContacts.length > 0) {
        let initialsHTML = generateInitialsHTML(assignedToContainer);
        let newSelectedContactsDiv = document.createElement("div");
        newSelectedContactsDiv.className = "selected-contacts";
        newSelectedContactsDiv.innerHTML = initialsHTML;
        assignedToContainer.appendChild(newSelectedContactsDiv);
    }
}


/**
 * Generates the HTML for the initials of selected contacts, considering the available width.
 * @param {HTMLElement} assignedToContainer - The container where the initials will be displayed.
 * @returns {string} The generated HTML for the contact initials.
 */
function generateInitialsHTML(assignedToContainer) {
    let maxWidth = assignedToContainer.offsetWidth;
    let usedWidth = 0;
    let remainingContacts = 0;
    let initialsHTML = "";
    for (let i = 0; i < selectedContacts.length; i++) {
        let contact = selectedContacts[i];
        let contactInitial = createContactInitial(contact);
        let tempWidth = getTempDivWidth(assignedToContainer, contactInitial);
        if (usedWidth + tempWidth <= maxWidth) {
            initialsHTML += contactInitial;
            usedWidth += tempWidth;
        } else {
            remainingContacts = selectedContacts.length - i;
            break;
        }
    }
    if (remainingContacts > 0) {
        initialsHTML += createMoreContactsInitial(remainingContacts);
    }
    return initialsHTML;
}


/**
 * Creates the HTML for a contact's initials.
 * @param {Object} contact - The contact object containing the name and color.
 * @returns {string} The HTML string representing the contact's initials.
 */
function createContactInitial(contact) {
    return `
        <div class="contact-initials" style="background-color: ${contact.color};">
            ${contact.name.split(" ").map(name => name[0]).join("").toUpperCase()}
        </div>
    `;
}


/**
 * Creates the HTML for the "more contacts" initials display.
 * @param {number} remainingContacts - The number of remaining contacts to be displayed.
 * @returns {string} The HTML string for displaying the remaining contacts.
 */
function createMoreContactsInitial(remainingContacts) {
    return `
        <div class="contact-initials more-contacts">
            +${remainingContacts}
        </div>
    `;
}


/**
 * Calculates the width of a temporary div that wraps the contact initials.
 * @param {HTMLElement} assignedToContainer - The container to calculate the width in.
 * @param {string} contactInitial - The HTML string for the contact's initials.
 * @returns {number} The width of the temporary div.
 */
function getTempDivWidth(assignedToContainer, contactInitial) {
    let tempDiv = document.createElement("div");
    tempDiv.style.display = "inline-block";
    tempDiv.innerHTML = contactInitial;
    assignedToContainer.appendChild(tempDiv);
    let tempWidth = tempDiv.offsetWidth;
    assignedToContainer.removeChild(tempDiv);
    return tempWidth;
}


//Footer
/**
 * Generates the HTML structure for the footer section of the "Add Task" card.
 * This includes a required field message on the left and action buttons (Clear and Create Task) on the right.
 * The "Clear" button includes an icon for clearing, and the "Create Task" button includes an icon for task creation.
 * 
 * @returns {string} The generated HTML string representing the footer content of the "Add Task" card.
 */
function generateAddTaskCardFooterHTML() {
    return `
        <div class="addTask-footer-generated">
            <div class="addTask-footer-left">
                <p>*</p>
                <h2>This field is required</h2>
            </div>
            <div class="addTask-footer-right">
                <div class="addTask-buttons">
                    <button class="clear-addTask-button">
                        <h2>Clear</h2>
                        <svg class="clear-addTask-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                            <path d="M12.001 12.5001L17.244 17.7431M6.758 17.7431L12.001 12.5001L6.758 17.7431ZM17.244 7.25708L12 12.5001L17.244 7.25708ZM12 12.5001L6.758 7.25708L12 12.5001Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="create-addTask-button">
                        <h2>Create Task</h2>
                        <img class="create-addTask-icon" src="../../assets/icons/contact_create.png" alt="Icon Create AddTask">
                    </button>
                </div>
            </div>
        </div>
    `;
}


//Subtasks
/**
 * Updates the list of subtasks by rendering the subtasks from the current task into the HTML.
 * Each subtask is displayed with its name, an edit button, and a delete button.
 * The edit and delete buttons trigger respective functions (`editSubtask` and `deleteSubtask`) when clicked.
 * 
 * @returns {void} This function doesn't return any value. It directly modifies the inner HTML of the subtasks list.
 */
function updateSubtasksList() {
    let list = document.getElementById("addTaskSubtasksList");
    let subtasks = tasks[currentTaskIndex].subtasks;

    list.innerHTML = subtasks
        .map(
            (subtask, index) => `
        <li class="editing-subtask">
            <span>${subtask.name}</span>
            <div class="subtask-detail-buttons">
            <button class="subtask-buttons" onclick="editSubtask(${index})">
                <svg class="edit-subtask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_268101_3948" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_268101_3948)">
                        <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#2A3647"/>
                    </g>
                </svg>
            </button>
            <div class="addTask-subtasks-detail-vertical-line">
            </div>
            <button class="subtask-buttons" onclick="deleteSubtask(${index})">
                <svg class="delete-subtask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_268101_4160" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                        <rect width="24" height="24" fill="#D9D9D9"/>
                    </mask>
                    <g mask="url(#mask0_268101_4160)">
                        <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                    </g>
                </svg>
            </button>
            </div>
        </li>
    `
        )
        .join("");
        if (subtasks.length > 0) {
            let lastSubtask = list.lastElementChild;
            if (lastSubtask) {
                lastSubtask.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
}


/**
 * Initiates the editing mode for a subtask, allowing the user to modify its name.
 * This function first checks if another subtask is being edited, and if so, it updates the list.
 * Then, it sets the selected subtask into an editable state with an input field for the task's name.
 * The subtask is displayed with options to save the changes or delete the subtask.
 * 
 * @param {number} index - The index of the subtask to be edited within the current task's subtasks array.
 * @returns {void} This function doesn't return any value. It directly updates the HTML content for the specified subtask.
 */
function editSubtask(index) {
    let list = document.getElementById("addTaskSubtasksList");
    let subtasks = tasks[currentTaskIndex].subtasks;

    if (editingSubtaskIndex !== null) {
        updateSubtasksList();
    }

    editingSubtaskIndex = index;

    let subtask = subtasks[index];
    let editTemplate = `
        <li class="editing">
            <div class="subtask-edit-mode">
                <input class="edit-input" type="text" value="${subtask.name}" id="editSubtaskInput"/>
                <div class="subtask-detail-buttons">
                    <button class="subtask-buttons" onclick="deleteSubtask(${index})">
                        <svg class="delete-subtask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_268101_4160" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                <rect width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_268101_4160)">
                                <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                            </g>
                        </svg>
                    </button>
                    <div class="addTask-subtasks-detail-vertical-line"></div>
                    <button class="subtask-buttons" onclick="saveSubtask(${index})">
                        <svg class="create-addTask-icon" width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="mask0_267600_4053" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="25">
                                <rect y="0.5" width="24" height="24" fill="#D9D9D9"/>
                            </mask>
                            <g mask="url(#mask0_267600_4053)">
                                <path d="M9.55057 15.65L18.0256 7.175C18.2256 6.975 18.4631 6.875 18.7381 6.875C19.0131 6.875 19.2506 6.975 19.4506 7.175C19.6506 7.375 19.7506 7.6125 19.7506 7.8875C19.7506 8.1625 19.6506 8.4 19.4506 8.6L10.2506 17.8C10.0506 18 9.81724 18.1 9.55057 18.1C9.28391 18.1 9.05057 18 8.85057 17.8L4.55057 13.5C4.35057 13.3 4.25474 13.0625 4.26307 12.7875C4.27141 12.5125 4.37557 12.275 4.57557 12.075C4.77557 11.875 5.01307 11.775 5.28807 11.775C5.56307 11.775 5.80057 11.875 6.00057 12.075L9.55057 15.65Z" fill="black"/>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </li>
    `;

    list.children[index].outerHTML = editTemplate;
}