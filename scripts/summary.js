let ToDoCount = 0;
let doneCount = 0;
let urgencyCount = 0;
let taskCount = 0;
let progressCount = 0;
let feedbackCount = 0;
let currentUser = "guest";
let greeting = getGreeting(currentUser);
let dueDate = "";
let tasks = [];

async function onloadFunc(){
    let userResponse = await getData("/tasks");
    let UserKeysArray = Object.keys(userResponse);
    for (let i = 0; i < UserKeysArray.length; i++) {
        const key = UserKeysArray[i];
        tasks.push({
            id: key,
            task: userResponse[key],
        });
    }
    dueDate = getUrgentDueDate(tasks);
    updateCount(tasks);
    renderHTML();
    renderGreeting();
}

function getToday(){
    let year = new Date().getFullYear();
    let month = String(new Date().getMonth() + 1).padStart(2, '0');
    let day = String(new Date().getDate()).padStart(2, '0');
    return today = `${year}-${month}-${day}`; 
}

function calculateDateDifference(dueDate, today) {
    const dueDateObj = new Date(dueDate); 
    return (dueDateObj - today) / (1000 * 60 * 60 * 24);
}

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

function formatDateToMonthDayYear(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getUrgentDueDate(tasks) {
    const today = new Date(getToday());
    return findClosestDueDate(tasks, today);
}

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

function renderHTML(){
    let content = document.getElementById('content');
    content.innerHTML = generateSummaryHTML();
}

function generateSummaryHTML(){
    return `
            <div class="badge-container flex-column">
                <div class="d-flex">
                    <div onclick="window.location.href='./board.html'" class="badge midsize-badge d-flex align-center justify-evenly">
                        <img src="./assets/icons/pencil.svg" alt="ToDo-Icon">
                        <div class="flex-column align-center">
                            <span class="count">${ToDoCount}</span>
                            <p class="count-text">To-Do</p>
                        </div>
                    </div>
                    <div onclick="window.location.href='./board.html'" class="badge midsize-badge d-flex align-center justify-evenly">
                        <img src="./assets/icons/checkmark.svg" alt="Checked-Icon">
                        <div class="flex-column align-center">
                            <span class="count">${doneCount}</span>
                            <p class="count-text">Done</p>
                        </div>
                    </div>
                </div>
                <div onclick="window.location.href='./board.html'" class="badge big-badge d-flex align-center justify-evenly">
                    <div class="d-flex align-center gap-20">
                        <img src="./assets/icons/urgency.svg" alt="Checked-Icon">
                        <div class="flex-column align-center">
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
                    <div onclick="window.location.href='./board.html'" class="badge small-badge flex-column align-center">
                        <span class="count">${taskCount}</span>
                        <p class="count-text">Tasks in <br> Board</p>
                    </div>
                    <div onclick="window.location.href='./board.html'" class="badge small-badge flex-column align-center">
                        <span class="count">${progressCount}</span>
                        <p class="count-text">Tasks in <br> Progress</p>
                    </div>
                    <div onclick="window.location.href='./board.html'" class="badge small-badge flex-column align-center">
                        <span class="count">${feedbackCount}</span>
                        <p class="count-text">Awaiting <br> Feedback</p>
                    </div>
                </div>
            </div>
            <div class="greet">
            </div>
    `
}

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
    return currentUser !== "guest" ? `${greeting},` : greeting;
}

function renderGreeting() {
    const greetingElement = document.querySelector('.greet');
    greetingElement.innerHTML = `
        <p>${getGreeting(currentUser)}</p>
        ${currentUser !== "guest" ? `<span>${currentUser}</span>` : ""}
    `;
}