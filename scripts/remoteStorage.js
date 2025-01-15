/**
 * Loads contacts from the database, processes them, ensures colors are saved, 
 * and renders the contacts list. Returns the sorted contacts.
 * 
 * @async
 * @function loadContacts
 * @returns {Promise<Object[]>} A promise that resolves to a sorted array of contact objects.
 */
async function loadContacts() {
    try {
        let data = await fetchContactsFromDatabase();
        if (data) {
            let sortedContacts = processContacts(data);
            await ensureColorsInDatabase(sortedContacts, data);
            renderContactsList(sortedContacts);
            return sortedContacts;
        }
    } catch (error) {
        console.error("Error loading contacts:", error);
        return [];
    }
}


/**
 * Fetches contact data from the database.
 * 
 * @async
 * @function fetchContactsFromDatabase
 * @returns {Promise<Object>} A promise that resolves to the raw contact data from the database.
 */
async function fetchContactsFromDatabase() {
    let response = await fetch(BASE_URL + "contacts.json");
    return await response.json();
}


/**
 * Processes raw contact data by converting it into an array, adding missing colors, 
 * and sorting the contacts alphabetically by name.
 * 
 * @function processContacts
 * @param {Object} data - The raw contact data from the database, where keys are contact IDs 
 * and values are contact details.
 * @returns {Object[]} An array of processed contact objects, each containing an `id`, 
 * the original contact details, and a `color`.
 */
function processContacts(data) {
    return Object.entries(data)
        .map(([id, contact]) => ({
            id,
            ...contact,
            color: contact.color || generateRandomColor()
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Ensures that all contacts have a color saved in the database.
 * If a contact is missing a color, it will generate a color and save it.
 * 
 * @async
 * @function ensureColorsInDatabase
 * @param {Object[]} sortedContacts - An array of processed contact objects, each containing an `id` and `color`.
 * @param {Object} data - The raw contact data from the database, where keys are contact IDs and values are contact details.
 * @returns {Promise<void>} A promise that resolves once all missing colors have been saved to the database.
 */
async function ensureColorsInDatabase(sortedContacts, data) {
    for (let contact of sortedContacts) {
        if (!data[contact.id].color) {
            await saveColorToDatabase(contact.id, contact.color);
        }
    }
}


/**
 * Loads task contacts by fetching data from the database, processing it, 
 * and returning a sorted array of contact objects.
 * 
 * @async
 * @function loadTaskContacts
 * @returns {Promise<Object[]>} A promise that resolves to a sorted array of contact objects, 
 * or an empty array if no data is available or an error occurs.
 * @throws {Error} Logs an error message to the console if the fetch or processing fails.
 */
async function loadTaskContacts() {
    try {
        let data = await fetchContacts();
        if (data) {
            let sortedContacts = prepareSortedContacts(data);
            return sortedContacts;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error loading task contacts:", error);
        return [];
    }
}


/**
 * Fetches contact data from the database by making a request to the contacts API.
 * 
 * @async
 * @function fetchContacts
 * @returns {Promise<Object>} A promise that resolves to the raw contact data from the database.
 * @throws {Error} Throws an error if the fetch operation fails (e.g., network error, invalid URL).
 */
async function fetchContacts() {
    let response = await fetch(BASE_URL + "contacts.json");
    return await response.json();
}


/**
 * Processes and sorts the contact data by adding missing colors and sorting contacts alphabetically by name.
 * 
 * @function prepareSortedContacts
 * @param {Object} data - The raw contact data, where keys are contact IDs and values are contact details.
 * @returns {Object[]} An array of processed and sorted contact objects, each containing `id`, `name`, and `color`.
 */
function prepareSortedContacts(data) {
    return Object.entries(data)
        .map(([id, contact]) => ({
            id,
            ...contact,
            color: contact.color || generateRandomColor()
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Asynchronously saves the color of a contact to the database by sending a PATCH request.
 * The color is updated for the specified contact ID in the database.
 *
 * @async
 * @function saveColorToDatabase
 * @param {string} contactId - The ID of the contact whose color is being updated.
 * @param {string} color - The color to be assigned to the contact.
 * @returns {Promise<void>} A promise that resolves when the color has been successfully saved to the database.
 * If the request fails, it silently catches the error and does not return anything.
 *
 * @throws {Error} Throws an error if the fetch request fails or encounters issues while updating the database.
 */
async function saveColorToDatabase(contactId, color) {
    try {
        await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ color })
        });
    } catch (error) {
    }
}


/**
 * Loads tasks from the database, processes them, and returns an array of tasks with IDs.
 * 
 * @async
 * @function loadTasks
 * @returns {Promise<Object[]>} A promise that resolves to an array of tasks with IDs, or an empty array if no data is found or an error occurs.
 */
async function loadTasks() {
    try {
        let data = await fetchTasks();
        if (data) {
            let tasksWithIds = mapTasksWithIds(data);
            return tasksWithIds;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error loading tasks:", error);
        return [];
    }
}


/**
 * Fetches task data from the database.
 * 
 * @async
 * @function fetchTasks
 * @returns {Promise<Object>} A promise that resolves to the raw task data from the database.
 */
async function fetchTasks() {
    let response = await fetch(BASE_URL + "tasks.json");
    return await response.json();
}


/**
 * Maps the raw task data into an array of task objects with IDs.
 * 
 * @function mapTasksWithIds
 * @param {Object} data - The raw task data from the database, where keys are task IDs and values are task details.
 * @returns {Object[]} An array of task objects, each containing the task `id` and its corresponding details.
 */
function mapTasksWithIds(data) {
    return Object.entries(data).map(([id, task]) => ({
        id,
        ...task
    }));
}


/**
 * Generates a random hex color code.
 * This function generates a random 6-character hex color code 
 * prefixed with a '#' character (e.g., "#A3C5D8").
 *
 * @returns {string} A random hex color code.
 */
function generateRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}