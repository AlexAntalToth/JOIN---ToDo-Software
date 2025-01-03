// const BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

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

            console.log("Contacts loaded:", sortedContacts);  // Debugging-Ausgabe

            return sortedContacts;
        } else {
            console.log("No contacts found in the database.");
            return [];
        }
    } catch (error) {
        console.error("Error loading contacts:", error);
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
            console.log("Tasks erfolgreich geladen:", tasksWithIds); // Debugging-Ausgabe
            return tasksWithIds;
        } else {
            console.warn("Keine Tasks in der Datenbank gefunden.");
            return [];
        }
    } catch (error) {
        console.error("Fehler beim Laden der Tasks:", error);
        return [];
    }
}