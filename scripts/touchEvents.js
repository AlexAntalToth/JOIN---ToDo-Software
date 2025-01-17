let touchTasks = document.querySelectorAll(".task");
let touchTaskLists = document.querySelectorAll(".task-list"); // Alle .task-list-Elemente

touchTasks.forEach(touchTask => {
    addTouchEventListeners(touchTask);
});

function addTouchEventListeners(elem) {
    elem.addEventListener("touchstart", e => {
        // Startposition des Touchs erfassen
        let startX = e.changedTouches[0].clientX;
        let startY = e.changedTouches[0].clientY;

        // Initiale Position speichern
        let offsetX = 0;
        let offsetY = 0;

        // Setze den Task in eine absolute Position
        elem.style.position = "absolute";
        elem.style.zIndex = 10;

        // Event Listener für das Bewegen des Tasks hinzufügen
        elem.addEventListener("touchmove", moveHandler);

        function moveHandler(eve) {
            eve.preventDefault();
            let nextX = eve.changedTouches[0].clientX;
            let nextY = eve.changedTouches[0].clientY;

            // Berechne die Verschiebung
            offsetX = nextX - startX;
            offsetY = nextY - startY;

            // Setze die neue Position des Tasks
            elem.style.left = offsetX + "px";
            elem.style.top = offsetY + "px";
        }

        // Event Listener für das Loslassen des Touchs hinzufügen
        elem.addEventListener("touchend", dropHandler);

        function dropHandler(eve) {
            elem.style.zIndex = 0;
            elem.removeEventListener("touchmove", moveHandler);
            elem.removeEventListener("touchend", dropHandler);

            let droppedIn = null;

            // Überprüfe, ob der Task in eine der task-list-Elemente abgelegt wurde
            touchTaskLists.forEach(touchTaskList => {
                let touchTaskListPos = touchTaskList.getBoundingClientRect();
                if (isInsideArea(elem, touchTaskListPos)) {
                    droppedIn = touchTaskList;
                }
            });

            // Wenn der Task in eine Liste abgelegt wurde, füge ihn dort hinzu
            if (droppedIn) {
                droppedIn.appendChild(elem);
            } else {
                // Wenn der Task nicht abgelegt wurde, setze ihn zurück in seine ursprüngliche Position
                elem.style.left = 0 + "px";
                elem.style.top = 0 + "px";
            }
        }
    });
}

/**
 * Überprüft, ob das Element innerhalb eines bestimmten Bereichs (z.B. task-list) abgelegt wurde.
 * 
 * @param {Element} elem - Das verschobene Task-Element.
 * @param {DOMRect} areaPos - Die Position des Bereichs (task-list).
 * @returns {boolean} - Gibt zurück, ob das Element im Bereich abgelegt wurde.
 */
function isInsideArea(elem, areaPos) {
    let elemPos = elem.getBoundingClientRect();
    return (
        elemPos.top >= areaPos.top &&
        elemPos.left >= areaPos.left &&
        elemPos.bottom <= areaPos.bottom &&
        elemPos.right <= areaPos.right
    );
}
