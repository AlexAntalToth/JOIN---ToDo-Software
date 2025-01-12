/**
 * Asynchronously loads contacts from a JSON file, processes them, 
 * and renders the list of contacts. If any contact doesn't have a color, 
 * it generates a random color and saves it to the database.
 *
 * @async
 * @function loadContacts
 * @returns {Promise<Object[]>} A promise that resolves to an array of sorted and processed contact objects.
 * If the contacts could not be loaded, the promise resolves to an empty array.
 *
 * @throws {Error} Throws an error if the fetch operation fails or if there are issues with the data processing.
 */
async function loadContacts() {
    try {
        let response = await fetch(BASE_URL + "contacts.json");
        let data = await response.json();
        if (data) {
            let sortedContacts = Object.entries(data)
                .map(([id, contact]) => ({
                    id,
                    ...contact,
                    color: contact.color || generateRandomColor()
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            for (let contact of sortedContacts) {
                if (!data[contact.id].color) {
                    await saveColorToDatabase(contact.id, contact.color);
                }
            }
            renderContactsList(sortedContacts);
            return sortedContacts;
        }
    } catch (error) {
        return [];
    }
}


/**
 * Asynchronously loads contacts from a JSON file, processes them, 
 * and returns a sorted list of contacts. If a contact does not have a color, 
 * a random color is generated for it.
 *
 * @async
 * @function loadTaskContacts
 * @returns {Promise<Object[]>} A promise that resolves to an array of sorted and processed contact objects.
 * If the contacts could not be loaded, the promise resolves to an empty array.
 *
 * @throws {Error} Throws an error if the fetch operation fails or if there are issues with processing the data.
 */
async function loadTaskContacts() {
    try {
        let response = await fetch(BASE_URL + "contacts.json");
        let data = await response.json();
        if (data) {
            let sortedContacts = Object.entries(data)
                .map(([id, contact]) => ({
                    id,
                    ...contact,
                    color: contact.color || generateRandomColor()
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            return sortedContacts;
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
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
 * Asynchronously loads tasks from a JSON file, processes them, 
 * and returns a list of tasks with their associated IDs.
 *
 * @async
 * @function loadTasks
 * @returns {Promise<Object[]>} A promise that resolves to an array of tasks, each with an associated `id` property.
 * If the tasks could not be loaded, the promise resolves to an empty array.
 *
 * @throws {Error} Throws an error if the fetch operation fails or if there are issues with processing the data.
 */
async function loadTasks() {
    try {
        let response = await fetch(BASE_URL + "tasks.json");
        let data = await response.json();

        if (data) {
            let tasksWithIds = Object.entries(data).map(([id, task]) => ({
                id,
                ...task
            }));
            return tasksWithIds;
        } else {
            return [];
        }
    } catch (error) {
        return [];
    }
}