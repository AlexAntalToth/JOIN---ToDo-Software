let ToDoCount = 0;
let doneCount = 0;
let urgencyCount = 0;
let taskCount = 0;
let progressCount = 0;
let feedbackCount = 0;
let greeting = "";
let dueDate = "";
let tasks = [];

/**
 * Executes the onload functionality by calling multiple async functions to set up the app.
 * - Includes HTML content, initializes the app, fetches task data, and renders the greeting and HTML.
 */
async function onloadFunc() {
    await includeHTML();
    await initApp();
    greeting = getGreeting(currentUser);
    const userResponse = await getData("/tasks");
    tasks = parseTasks(userResponse);
    dueDate = getUrgentDueDate(tasks);
    updateCount(tasks);
    renderHTML();
    renderGreeting();
}

/**
 * Parses the raw task data into a structured array of task objects.
 * @param {Object} userResponse - The raw task data response.
 * @returns {Array} An array of task objects with id and task properties.
 */
function parseTasks(userResponse) {
    return Object.keys(userResponse).map(key => ({
        id: key,
        task: userResponse[key],
    }));
}

/**
 * Determines the most urgent due date from the provided tasks.
 * @param {Array} tasks - The array of task objects.
 * @returns {string} The closest due date formatted as "Month Day, Year" or "No Deadlines".
 */
function getUrgentDueDate(tasks) {
    const today = new Date(getToday());
    return findClosestDueDate(tasks, today);
}


/**
 * Finds the closest due date to today from the provided tasks.
 * @param {Array} tasks - The array of task objects.
 * @param {Date} today - The current date to compare against.
 * @returns {string} The closest due date formatted as "Month Day, Year" or "No Deadlines".
 */
function findClosestDueDate(tasks, today) {
    let closestDueDate = null;
    let smallestDifference = Infinity;
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i].task;
        const dueDate = task.dueDate;
        if (dueDate) {
            const difference = calculateDateDifference(dueDate, today);
            if (difference >= 0 && difference < smallestDifference) {
                smallestDifference = difference;
                closestDueDate = dueDate;
            }
        }
    }
    return closestDueDate ? formatDateToMonthDayYear(closestDueDate) : "No Deadlines";
}

/**
 * Calculates the difference in days between two dates.
 * @param {string} dueDate - The due date to compare against.
 * @param {Date} today - The current date to compare.
 * @returns {number} The difference in days.
 */
function calculateDateDifference(dueDate, today) {
    const dueDateObj = new Date(dueDate); 
    return (dueDateObj - today) / (1000 * 60 * 60 * 24);
}

/**
 * Formats a date string into a readable format "Month Day, Year".
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date in "Month Day, Year" format.
 */
function formatDateToMonthDayYear(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Updates the task counts based on the tasks' categories and priorities.
 * @param {Array} tasks - The array of task objects.
 */
function updateCount(tasks) {
    tasks.forEach(taskObj => {
        const task = taskObj.task;
        taskCount++;
        if (task.category === "To-Do") {
            ToDoCount++;
        } else if (task.category === "Done") {
            doneCount++;
        } else if (task.category === "In Progress") {
            progressCount++;
        } else if (task.category === "Await Feedback") {
            feedbackCount++;
        }
        if (task.priority === "urgent") {
            urgencyCount++;
        }
    });
}

/**
 * Renders the HTML content by generating a summary based on the current task counts.
 */
function renderHTML() {
    let content = document.getElementById('content');
    content.innerHTML = generateSummaryHTML();
}

/**
 * Generates the HTML string for displaying the task summary with badges.
 * @returns {string} The HTML string representing the task summary.
 */
function generateSummaryHTML() {
    return `
        <div class="badge-container">
            <div class="d-flex">
                <div onclick="window.location.href='./board.html'" class="badge midsize-badge d-flex align-center justify-evenly">
                    <img src="./assets/icons/pencil.svg" alt="ToDo-Icon">
                    <div class="flex-column">
                        <span class="count">${ToDoCount}</span>
                        <p class="count-text">To-Do</p>
                    </div>
                </div>
                <div onclick="window.location.href='./board.html'" class="badge midsize-badge d-flex align-center justify-evenly">
                    <img src="./assets/icons/checkmark.svg" alt="Checked-Icon">
                    <div class="flex-column">
                        <span class="count">${doneCount}</span>
                        <p class="count-text">Done</p>
                    </div>
                </div>
            </div>
            <div onclick="window.location.href='./board.html'" class="badge big-badge d-flex align-center justify-evenly">
                <div class="d-flex align-center gap-20">
                    <img src="./assets/icons/urgency.svg" alt="Checked-Icon">
                    <div class="flex-column">
                        <span class="count">${urgencyCount}</span>
                        <p class="count-text">Urgent</p>
                    </div>
                </div>
                <div class="separator-grey"></div>
                <div class="deadline">
                    <span class="date">${dueDate}</span>
                    <p>Upcoming Deadline</p>
                </div>
            </div>
            <div class="d-flex">
                <div onclick="window.location.href='./board.html'" class="badge small-badge flex-column">
                    <span class="count">${taskCount}</span>
                    <p class="count-text">Tasks in <br> Board</p>
                </div>
                <div onclick="window.location.href='./board.html'" class="badge small-badge flex-column">
                    <span class="count">${progressCount}</span>
                    <p class="count-text">Tasks in <br> Progress</p>
                </div>
                <div onclick="window.location.href='./board.html'" class="badge small-badge flex-column">
                    <span class="count">${feedbackCount}</span>
                    <p class="count-text">Awaiting <br> Feedback</p>
                </div>
            </div>
        </div>
        <div class="greet"></div>
    `;
}

/**
 * Returns a greeting message based on the current time of the day.
 * @param {Object} currentUser - The current user object.
 * @returns {string} A personalized greeting message.
 */
function getGreeting(currentUser) {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }
    return currentUser.name !== "guest" ? `${greeting},` : greeting;
}

/**
 * Renders a greeting message in the UI for the current user.
 */
function renderGreeting() {
    const greetingElement = document.querySelector('.greet');
    greetingElement.innerHTML = `
        <p>${getGreeting(currentUser)}</p>
        ${currentUser.name !== "guest" ? `<span>${currentUser.name}</span>` : ""}
    `;
}
