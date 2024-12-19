const BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

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
            return [];
        }
    } catch (error) {
        return [];
    }
}

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
        }

        return [];
    } catch (error) {
        console.error("Fehler beim Laden der Tasks:", error);
        return [];
    }
}