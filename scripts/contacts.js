let isMobileView = checkMobileView();

async function init() {
    await loadContacts();
    await includeHTML();
    await initApp();
}

async function loadSidebarAndHeader() {
    let sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    let headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}


function checkMobileView() {
    return window.matchMedia("(max-width: 1100px)").matches;
}

window.addEventListener('resize', () => {
    isMobileView = checkMobileView();
});


document.body.addEventListener('click', async (event) => {
    let target = event.target;
    if (target.closest('.delete-contact-button')) {
        let contactItem = target.closest('.contact-item');
        if (contactItem) {
            let contactId = contactItem.dataset.contactId;
            await deleteContact(contactId);
        } else {
        }
    }
});


function renderContactsList(contacts) {
    let contactsAreaList = getContactsAreaList();
    clearContactsArea(contactsAreaList);

    let displayedLetters = [];
    contacts.forEach(contact => {
        processContact(contact, displayedLetters, contactsAreaList);
    });
}

function getContactsAreaList() {
    return document.querySelector(".contacts-area-list");
}

function clearContactsArea(contactsAreaList) {
    contactsAreaList.innerHTML = "";
}


function processContact(contact, displayedLetters, contactsAreaList) {
    let { initials, firstLetter } = getInitialsAndFirstLetter(contact);

    if (!displayedLetters.includes(firstLetter)) {
        displayedLetters.push(firstLetter);
        addLetterDivider(firstLetter, contactsAreaList);
    }

    addContactElement(contact, initials, contactsAreaList);
}

function addLetterDivider(firstLetter, contactsAreaList) {
    let { letterElement, dividerElement } = getLetterDivider(firstLetter);
    contactsAreaList.appendChild(letterElement);
    contactsAreaList.appendChild(dividerElement);
}

function addContactElement(contact, initials, contactsAreaList) {
    let contactElement = createContactElement(contact, initials);
    contactsAreaList.appendChild(contactElement);
}





function getInitialsAndFirstLetter(contact) {
    let nameParts = contact.name.split(" ");
    let firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    let lastNameInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
    let firstLetter = contact.name.charAt(0).toUpperCase();
    let initials = firstNameInitial + lastNameInitial;
    return { initials, firstLetter };
}

function getLetterDivider(letter) {
    let letterElement = document.createElement("div");
    letterElement.classList.add("contact-first-letter");
    letterElement.textContent = letter;
    let dividerElement = document.createElement("div");
    dividerElement.classList.add("contact-divider");
    return { letterElement, dividerElement };
}


function initializeContactElement(contactElement, contact, initials) {
    let template = getContactsTemplate(contact, initials);
    contactElement.innerHTML = template;
    let initialsCircle = contactElement.querySelector('.contact-initials-circle');
    if (contact.color) {
        initialsCircle.style.backgroundColor = contact.color;
    }
    contactElement.addEventListener("click", () => {
        ContactSelection(contactElement);
        renderContactCard(contact);
    });
}

function createContactElement(contact, initials) {
    let contactElement = createBaseContactElement(contact);
    initializeContactElement(contactElement, contact, initials);
    return contactElement;
}

function generateRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function ContactSelection(selectedElement) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
    selectedElement.classList.add('contact-item-active');
}

function renderContactCard(contact) {
    let contactCardContainer = document.querySelector(".contacts-card");
    if (contactCardContainer.classList.contains('contacts-card-visible')) {
        contactCardContainer.classList.remove('contacts-card-visible');
    }
    contactCardContainer.innerHTML = "";
    let contactCard = createContactCard(contact);
    contactCardContainer.appendChild(contactCard);
    setTimeout(() => {
        contactCardContainer.classList.add('contacts-card-visible');
    }, 600);
}

function renderEditedContactCard(contact) {
    let contactCardContainer = document.querySelector(".contacts-card");
    if (contactCardContainer.classList.contains('contacts-card-visible')) {
        contactCardContainer.classList.remove('contacts-card-visible');
    }
    contactCardContainer.innerHTML = "";
    let contactCard = createContactCard(contact);
    contactCardContainer.appendChild(contactCard);
    contactCardContainer.classList.add('contacts-card-visible');
}


function createContactCardElement(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);
    let contactCard = document.createElement("div");
    contactCard.classList.add("contacts-card-content");
    contactCard.setAttribute("data-id", contact.id);
    contactCard.innerHTML = generateContactCardTemplate(contact, initials);
    return contactCard;
}

function attachEditButtonListener(contactCard) {
    let editButton = getEditButton(contactCard);
    if (editButton) {
        editButton.addEventListener('click', () => handleEditButtonClick(editButton));
    }
}

function getEditButton(contactCard) {
    return contactCard.querySelector('.edit-button');
}

function handleEditButtonClick(editButton) {
    let contactId = getContactIdFromButton(editButton);
    let contactElement = findContactElementById(contactId);

    if (contactElement) {
        let contact = extractContactData(contactElement);
        renderEditContactOverview(contact);
    }
}

function getContactIdFromButton(editButton) {
    return editButton.getAttribute('data-id');
}

function findContactElementById(contactId) {
    return document.querySelector(`.contact-item[data-id="${contactId}"]`);
}

function extractContactData(contactElement) {
    return {
        id: contactElement.getAttribute('data-id'),
        name: contactElement.getAttribute('data-name'),
        email: contactElement.getAttribute('data-email'),
        phone: contactElement.getAttribute('data-phone'),
        color: contactElement.getAttribute('data-color')
    };
}

function renderEditContactOverview(contact) {
    renderEditContactCard(contact);
    attachCloseListeners();
    openModalEditContact();
}



function clearHighlight() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
}


function ContactSelection(selectedElement) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
    selectedElement.classList.add('contact-item-active');
}


function createContactCard(contact) {
    let contactCard = createContactCardElement(contact);
    attachEditButtonListener(contactCard);
    return contactCard;
}

function openModalContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content-add');
    modalContact.style.display = 'flex';
    requestAnimationFrame(() => {
        modalContact.classList.add('show');
        modalContactContent.classList.add('show');
    });
}

function openModalEditContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content-edit');
    modalContact.style.display = 'flex';
    requestAnimationFrame(() => {
        modalContact.classList.add('show');
        modalContactContent.classList.add('show');
    });
}

function closeModalContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content-add');
    modalContactContent.classList.remove('show');
    modalContactContent.classList.add('hide');
    setTimeout(() => {
        modalContact.classList.remove('show');
        modalContact.style.display = 'none';
        modalContactContent.classList.remove('hide');
    }, 600);
}

function closeModalEditContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content-edit');
    modalContactContent.classList.remove('show');
    modalContactContent.classList.add('hide');
    setTimeout(() => {
        modalContact.classList.remove('show');
        modalContact.style.display = 'none';
        modalContactContent.classList.remove('hide');
    }, 600);
}

let addButton = document.querySelector('.add-contact');
if (addButton) {
    addButton.addEventListener('click', () => {
        renderAddContactCard();
        attachCloseListeners();
        openModalContact();
    });
}

let deleteButton = document.querySelector('.delete-button');
document.addEventListener('click', (event) => {
    let deleteButton = event.target.closest('.delete-button');
    if (deleteButton) {
        let contactId = deleteButton.getAttribute('data-id');
        if (contactId) {
            deleteContact(contactId);
        }
    }
});

let closeModalButton = document.querySelector('.close-modal-contact');
if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModalContact);
}

let deleteModalButton = document.querySelector('.delete-modal-contact');
if (deleteModalButton) {
    deleteModalButton.addEventListener('click', closeModalEditContact);
}

window.onclick = function (event) {
    if (event.target === document.getElementById('myModal-contact')) {
        closeModalContact();
        closeModalEditContact();
    }
};

function renderAddContactCard(contact) {
    let addContactCardContainer = document.querySelector(".add-contact-card");
    if (!addContactCardContainer) {
        return;
    }
    addContactCardContainer.innerHTML = "";
    addContactCardContainer.classList.remove('add-contact-card-visible');
    let addContactCard = createAddContactCard(contact || { name: "", email: "", phone: "" });
    addContactCardContainer.appendChild(addContactCard);
    setTimeout(() => {
        addContactCardContainer.classList.add('add-contact-card-visible');
    }, 600);
}

function renderEditContactCard(contact) {
    let editContactCardContainer = document.querySelector(".edit-contact-card");
    if (!editContactCardContainer) {
        return;
    }
    editContactCardContainer.innerHTML = "";
    editContactCardContainer.classList.remove('edit-contact-card-visible');
    let editContactCard = createEditContactCard(contact);
    editContactCardContainer.appendChild(editContactCard);
    setTimeout(() => {
        editContactCardContainer.classList.add('edit-contact-card-visible');
    }, 600);
}



function createAddContactCard(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);
    let addContactCard = document.createElement("div");
    addContactCard.classList.add("add-card-content");
    addContactCard.innerHTML = generateAddContactCardHTML(initials);
    let saveButton = addContactCard.querySelector(".save-contact-button");
    saveButton.addEventListener("click", saveNewContact);
    let cancelButton = addContactCard.querySelector(".cancel-contact-button");
    cancelButton.addEventListener("click", closeModalContact);
    return addContactCard;
}


function createEditContactCard(contact) {
    let initials = getContactInitials(contact);
    let editContactCard = createEditCardElement(contact, initials);
    setupSaveButton(editContactCard, contact.id);
    setupDeleteButton(editContactCard);
    return editContactCard;
}

function getContactInitials(contact) {
    return getInitialsAndFirstLetter(contact).initials;
}

function createEditCardElement(contact, initials) {
    let editContactCard = document.createElement("div");
    editContactCard.classList.add("edit-card-content");
    editContactCard.setAttribute("data-id", contact.id);
    editContactCard.innerHTML = generateEditContactCardHTML(contact, initials);
    return editContactCard;
}

function setupSaveButton(editContactCard, contactId) {
    let saveButton = editContactCard.querySelector(".save-contact-button");
    saveButton.addEventListener("click", () => saveExistingContact(contactId));
}

function setupDeleteButton(editContactCard) {
    let deleteButton = editContactCard.querySelector(".delete-contact-button");
    deleteButton.addEventListener("click", () => handleDeleteButtonClick(deleteButton));
}

function handleDeleteButtonClick(deleteButton) {
    let contactId = deleteButton.getAttribute("data-id");
    if (contactId) {
        deleteContact(contactId);
        closeModalEditContact();
    }
}


function attachCloseListeners() {
    document.querySelectorAll('.close-modal-contact').forEach(button => {
        button.addEventListener('click', closeModalContact);
    });
    document.querySelectorAll('.close-modal-edit-contact').forEach(button => {
        button.addEventListener('click', closeModalEditContact);
    });
}

async function saveNewContact() {
    let { name, email, phone } = getContactFormValues();
    if (!validateContactFields(name, email, phone)) return;
    let newContact = createNewContact(name, email, phone);
    try {
        let response = await saveContactToDatabase(newContact);
        if (response.ok) {
            await handleSuccessfulSave(response, newContact);
        }
    } catch (error) {
        console.error("Fehler beim Speichern des neuen Kontakts:", error);
    }
}

function getContactFormValues() {
    let nameField = document.getElementById("contact-name");
    let emailField = document.getElementById("contact-email");
    let phoneField = document.getElementById("contact-phone");
    return {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        phone: phoneField.value.trim()
    };
}

function validateContactFields(name, email, phone) {
    if (!name || !email || !phone) {
        showErrorMessage("Please complete all fields.");
        return false;
    }
    if (name.split(" ").length < 2) {
        showErrorMessage("Please enter your first and last name.");
        return false;
    }
    return true;
}

function createNewContact(name, email, phone) {
    return {
        name,
        email,
        phone,
        color: generateRandomColor()
    };
}

async function saveContactToDatabase(newContact) {
    return fetch(BASE_URL + "/contacts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
    });
}

async function handleSuccessfulSave(response, newContact) {
    let result = await response.json();
    newContact.id = result.name;
    closeModalContact();
    loadContacts();
    showContactCreatedOverlay();
    renderContactCard(newContact);
    setTimeout(() => {
        scrollToNewContact(newContact);
    }, 1600);
}

function scrollToNewContact(newContact) {
    let newContactElement = document.querySelector(`.contact-item[data-id="${newContact.id}"]`);
    if (newContactElement) {
        ContactSelection(newContactElement);
        if (isMobileView) {
            setActiveContact(newContactElement);
        }
        newContactElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}


async function deleteContact(contactId) {
    try {
        let response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
            method: "DELETE",
        });
        if (response.ok) {
            activeContact = null;
            updateViewAfterDelete();
            await loadContacts();
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Kontakts:", error);
    }
}

function updateViewAfterDelete() {
    let contactsDetails = document.querySelector('.contacts-details');
    let contactsList = document.querySelector('.contacts-list');
    let contactCardContainer = document.querySelector(".contacts-card");
    if (!contactsDetails || !contactsList) return;
    if (isMobileView) {
        updateMobileView(contactsDetails, contactsList, contactCardContainer);
    } else {
        updateDesktopView(contactsDetails, contactsList, contactCardContainer);
    }
    loadContacts();
    clearHighlight();
}

function updateMobileView(contactsDetails, contactsList, contactCardContainer) {
    contactsDetails.style.display = "none";
    contactsList.style.display = "block";
    if (contactCardContainer) {
        clearContactCard(contactCardContainer);
    }
}

function updateDesktopView(contactsDetails, contactsList, contactCardContainer) {
    contactsDetails.style.display = "block";
    contactsList.style.display = "block";
    if (contactCardContainer) {
        clearContactCard(contactCardContainer);
    }
}

function clearContactCard(contactCardContainer) {
    contactCardContainer.innerHTML = "";
    contactCardContainer.classList.remove("contacts-card-visible");
}


function showContactCreatedOverlay() {
    let parentContainer = document.querySelector(".contacts-details");

    let overlay = createOverlay();
    appendOverlayToContainer(parentContainer, overlay);

    if (isMobileView) {
        showMobileOverlay(overlay);
    } else {
        showDesktopOverlay(overlay);
    }
}

function createOverlay() {
    let overlay = document.createElement("div");
    overlay.className = "contact-created-overlay";
    overlay.textContent = "Contact successfully created";
    return overlay;
}

function appendOverlayToContainer(container, overlay) {
    container.appendChild(overlay);
}

function showMobileOverlay(overlay) {
    let parentContainer = document.querySelector(".contacts-details");
    parentContainer.style.display = 'block';
    parentContainer.style.zIndex = '2';

    setTimeout(() => {
        overlay.classList.add("show");
    }, 1000);

    setTimeout(() => {
        hideOverlay(overlay);
    }, 3000);
}

function showDesktopOverlay(overlay) {
    setTimeout(() => {
        overlay.classList.add("show");
    }, 10);

    setTimeout(() => {
        hideOverlay(overlay);
    }, 1500);
}

function hideOverlay(overlay) {
    overlay.classList.remove("show");
    setTimeout(() => {
        overlay.remove();
    }, 600);
}


async function saveExistingContact(contactId) {
    let { name, email, phone } = getContactFields();
    if (!validateContactFields(name, email, phone)) return;

    try {
        let existingContact = await fetchExistingContact(contactId);
        let updatedContact = createUpdatedContact(contactId, existingContact, name, email, phone);
        let responsePut = await saveUpdatedContact(contactId, updatedContact);
        handleSaveResponse(responsePut, updatedContact);
    } catch (error) {
        handleSaveError(error);
    }
}

function getContactFields() {
    let name = getFieldValue("contact-name2");
    let email = getFieldValue("contact-email2");
    let phone = getFieldValue("contact-phone2");
    return { name, email, phone };
}

function handleSaveResponse(responsePut, updatedContact) {
    if (responsePut.ok) {
        updateViewAfterSave(updatedContact);
    } else {
        console.error("Failed to save contact.");
    }
}

function handleSaveError(error) {
    console.error("Fehler beim Speichern des Kontakts:", error);
}

function getFieldValue(fieldId) {
    let field = document.getElementById(fieldId);
    return field ? field.value.trim() : "";
}

function validateContactFields(name, email, phone) {
    if (!name || !email || !phone) {
        showErrorMessage("Please complete all fields.");
        return false;
    }
    if (name.split(" ").length < 2) {
        showErrorMessage("Please enter your first and last name.");
        return false;
    }
    return true;
}

async function fetchExistingContact(contactId) {
    let responseGet = await fetch(`${BASE_URL}/contacts/${contactId}.json`);
    if (!responseGet.ok) {
        throw new Error("Failed to fetch existing contact");
    }
    return await responseGet.json();
}

function createUpdatedContact(contactId, existingContact, name, email, phone) {
    return {
        id: contactId,
        ...existingContact,
        name,
        email,
        phone
    };
}

async function saveUpdatedContact(contactId, updatedContact) {
    return await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContact),
    });
}

function updateViewAfterSave(updatedContact) {
    closeModalEditContact();
    loadContacts();
    renderEditedContactCard(updatedContact);
    setTimeout(() => {
        let updatedContactElement = document.querySelector(`.contact-item[data-id="${updatedContact.id}"]`);
        if (updatedContactElement) {
            ContactSelection(updatedContactElement);
            updatedContactElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 1600);
}


function showErrorMessage(message) {
    let errorBox = document.getElementById("error-message-box");
    errorBox.textContent = message;
    errorBox.classList.add("show");

    setTimeout(() => {
        errorBox.classList.remove("show");
    }, 2500);
}

