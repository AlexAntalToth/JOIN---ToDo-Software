let ToDoCount = 1;
let doneCount = 1;
let urgencyCount = 1;
let taskCount = 4;
let progressCount = 2;
let feedbackCount = 2;
let currentUser = "Sofia Müller";
let greeting = getGreeting();
let deadlineDate = "October 16, 2022"

function renderHTML(){
    let container = document.getElementById('container');
    container.innerHTML = generateSummaryHTML();
}

function generateSummaryHTML(){
    return `
    <div class="sum-headline">
            <h1>Join 360</h1>
            <div class="separator"></div>
            <h2>Key Metrics at a Glance</h2>
        </div>
        <div class="content">
            <div class="badge-container flex-column">
                <div class="d-flex">
                    <div class="badge midsize-badge d-flex align-center justify-evenly">
                        <img src="./assets/icons/pencil.svg" alt="ToDo-Icon">
                        <div class="flex-column align-center">
                            <span class="count">${ToDoCount}</span>
                            <p class="count-text">To-Do</p>
                        </div>
                    </div>
                    <div class="badge midsize-badge d-flex align-center justify-evenly">
                        <img src="./assets/icons/checkmark.svg" alt="Checked-Icon">
                        <div class="flex-column align-center">
                            <span class="count">${doneCount}</span>
                            <p class="count-text">Done</p>
                        </div>
                    </div>
                </div>
                <div class="badge big-badge d-flex align-center justify-evenly">
                    <div class="d-flex align-center gap-20">
                        <img src="./assets/icons/urgency.svg" alt="Checked-Icon">
                        <div class="flex-column align-center">
                            <span class="count">${urgencyCount}</span>
                            <p class="count-text">Urgent</p>
                        </div>
                    </div>
                    <div class="separator-grey"></div>
                    <div class="deadline">
                        <span class="date">${deadlineDate}</span>
                        <p>Upcoming Deadline</p>
                    </div>
                </div>
                <div class="d-flex">
                    <div class="badge small-badge flex-column align-center">
                        <span class="count">${taskCount}</span>
                        <p class="count-text">Tasks in <br> Board</p>
                    </div>
                    <div class="badge small-badge flex-column align-center">
                        <span class="count">${progressCount}</span>
                        <p class="count-text">Tasks in <br> Progress</p>
                    </div>
                    <div class="badge small-badge flex-column align-center">
                        <span class="count">${feedbackCount}</span>
                        <p class="count-text">Awaiting <br> Feedback</p>
                    </div>
                </div>
            </div>
            <div class="greet">
                <p>${greeting}</p>
                <span>${currentUser}</span>
            </div>
        </div>
    `
}

function getGreeting(){
    const hour = new Date().getHours();
    if (hour < 12) {
        return "Good Morning,";
    } else if (hour < 18) {
        return "Good Afternoon,";
    } else {
        return "Good Evening,";
    }
}