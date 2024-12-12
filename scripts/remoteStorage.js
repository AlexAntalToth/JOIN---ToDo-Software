const BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path = "") {
    try {
        const response = await fetch(BASE_URL + path + ".json");
        const data = await response.json();

        if (data) {
            const sortedContacts = Object.entries(data)
                .map(([id, contact]) => ({
                    id,
                    ...contact,
                    color: contact.color || generateRandomColor()
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            for (const contact of sortedContacts) {
                if (!data[contact.id].color) {
                    await saveColorToDatabase(contact.id, contact.color);
                }
            }

            renderContactsList(sortedContacts);
        }
    } catch (error) {
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