function onloadFunc() {
    loadData("/contacts");
    // postData("/name",{"banana": "rama"});
//    deleteData("/name");

}

const BASE_URL="https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path="") {
    let response = await fetch(BASE_URL + path + ".json");
    return responseToJson = await response.json();
}

async function postData(path="", data={}) {
    let response = await fetch(BASE_URL + path + ".json",{
        method: "POST",
        header: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}

async function deleteData(path="", data={}) {
    let response = await fetch(BASE_URL + path + ".json",{
        method: "DELETE",

    });
    return responseToJson = await response.json();
}