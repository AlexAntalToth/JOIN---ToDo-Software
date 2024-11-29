const BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path = "") {
    try {
        const response = await fetch(BASE_URL + path + ".json");
        const data = await response.json();
        
        if (data) {
            const sortedContacts = Object.entries(data)
                .map(([id, contact]) => ({ id, ...contact }))
                .sort((a, b) => a.name.localeCompare(b.name));
            renderContactsList(sortedContacts);
        }
    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
    }
}