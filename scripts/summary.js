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
                            <span class="count">1</span>
                            <p class="count-text">To-Do</p>
                        </div>
                    </div>
                    <div class="badge midsize-badge d-flex align-center justify-evenly">
                        <img src="./assets/icons/checkmark.svg" alt="Checked-Icon">
                        <div class="flex-column align-center">
                            <span class="count">1</span>
                            <p class="count-text">Done</p>
                        </div>
                    </div>
                </div>
                <div class="badge big-badge d-flex align-center justify-evenly">
                    <div class="d-flex align-center gap-20">
                        <img src="./assets/icons/urgency.svg" alt="Checked-Icon">
                        <div class="flex-column align-center">
                            <span class="count">1</span>
                            <p class="count-text">Urgent</p>
                        </div>
                    </div>
                    <div class="separator-grey"></div>
                    <div class="deadline">
                        <span class="date">October 16, 2022</span>
                        <p>Upcoming Deadline</p>
                    </div>
                </div>
                <div class="d-flex">
                    <div class="badge small-badge flex-column align-center">
                        <span class="count">5</span>
                        <p class="count-text">Tasks in <br> Board</p>
                    </div>
                    <div class="badge small-badge flex-column align-center">
                        <span class="count">2</span>
                        <p class="count-text">Tasks in <br> Progress</p>
                    </div>
                    <div class="badge small-badge flex-column align-center">
                        <span class="count">2</span>
                        <p class="count-text">Awaiting <br> Feedback</p>
                    </div>
                </div>

            </div>
            <div class="greet">
                <p>Good morning,</p>
                <span>Sofia Müller</span>
            </div>
        </div>
    `
}