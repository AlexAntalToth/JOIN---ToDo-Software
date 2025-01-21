/**
 * Retrieves the contact ID from the edit button.
 *
 * This function gets the `data-id` attribute from the given edit button
 * element, which stores the unique ID of the contact associated with the button.
 *
 * @param {HTMLElement} editButton - The edit button element.
 * @returns {string} The contact ID associated with the edit button.
 */
function getContactIdFromButton(editButton) {
    return editButton.getAttribute('data-id');
}


/**
 * Finds a contact element by its ID.
 *
 * This function searches the DOM for an element with the class `contact-item`
 * that has the specified `data-id` attribute corresponding to the given contact ID.
 *
 * @param {string} contactId - The unique ID of the contact.
 * @returns {HTMLElement|null} The contact element if found, otherwise null.
 */
function findContactElementById(contactId) {
    return document.querySelector(`.contact-item[data-id="${contactId}"]`);
}


/**
 * Extracts the contact data from a contact element.
 *
 * This function retrieves the `data-*` attributes from a given contact element
 * and returns an object containing the extracted contact information.
 *
 * @param {HTMLElement} contactElement - The DOM element representing the contact.
 * @returns {Object} An object containing the contact's data.
 * @returns {string} return.id - The unique ID of the contact.
 * @returns {string} return.name - The name of the contact.
 * @returns {string} return.email - The email address of the contact.
 * @returns {string} return.phone - The phone number of the contact.
 * @returns {string} return.color - The background color associated with the contact.
 */
function extractContactData(contactElement) {
    return {
        id: contactElement.getAttribute('data-id'),
        name: contactElement.getAttribute('data-name'),
        email: contactElement.getAttribute('data-email'),
        phone: contactElement.getAttribute('data-phone'),
        color: contactElement.getAttribute('data-color')
    };
}


/**
 * Renders the edit contact overview for a given contact.
 *
 * This function renders the contact card for editing, attaches event listeners
 * for closing the edit modal, and opens the modal to display the edit contact form.
 *
 * @param {Object} contact - The contact object to be edited.
 * @param {string} contact.id - The unique ID of the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} contact.color - The background color associated with the contact.
 */
function renderEditContactOverview(contact) {
    renderEditContactCard(contact);
    attachCloseListeners();
    openModalEditContact();
}


/**
 * Removes the 'contact-item-active' class from all contact items.
 *
 * This function loops through all contact items and removes the 
 * 'contact-item-active' class, effectively clearing any active highlighting 
 * applied to the contact items.
 */
function clearHighlight() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
}


/**
 * Highlights the selected contact item by adding the 'contact-item-active' class.
 * 
 * This function removes the 'contact-item-active' class from all contact items and 
 * adds it to the specified `selectedElement`, which visually highlights the selected contact.
 *
 * @param {Element} selectedElement - The contact item element to be highlighted.
 */
function ContactSelection(selectedElement) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
    selectedElement.classList.add('contact-item-active');
}


/**
 * Creates a contact card element and attaches an edit button listener.
 *
 * This function generates a contact card based on the provided contact data and attaches
 * an event listener to the edit button, allowing for interaction with the contact card.
 *
 * @param {Object} contact - The contact object containing the contact details.
 * @param {string} contact.id - The unique ID of the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} contact.color - The background color associated with the contact.
 * 
 * @returns {Element} The created contact card element.
 */
function createContactCard(contact) {
    let contactCard = createContactCardElement(contact);
    attachEditButtonListener(contactCard);
    return contactCard;
}


/**
 * Opens the contact modal for adding a new contact.
 *
 * This function displays the modal window for adding a new contact. It sets the modal's
 * display to 'flex' and triggers the animation to show the modal and its content.
 * 
 * @returns {void}
 */
function openModalContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content-add');
    modalContact.style.display = 'flex';
    requestAnimationFrame(() => {
        modalContact.classList.add('show');
        modalContactContent.classList.add('show');
    });
}


/**
 * Opens the contact edit modal.
 *
 * This function displays the modal window for editing an existing contact. It sets the modal's
 * display to 'flex' and triggers the animation to show the modal and its content.
 * 
 * @returns {void}
 */
function openModalEditContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content-edit');
    modalContact.style.display = 'flex';
    requestAnimationFrame(() => {
        modalContact.classList.add('show');
        modalContactContent.classList.add('show');
    });
}


/**
 * Closes the contact modal.
 *
 * This function hides the contact modal by removing the 'show' class and adding the 'hide' class 
 * to the modal content. After a delay, it removes the 'show' class from the modal itself and sets 
 * its display to 'none'.
 *
 * @returns {void}
 */
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


/**
 * Closes the edit contact modal.
 *
 * This function hides the edit contact modal by removing the 'show' class and adding the 'hide' class 
 * to the modal content. After a delay, it removes the 'show' class from the modal itself and sets 
 * its display to 'none'.
 *
 * @returns {void}
 */
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


/**
 * Adds an event listener to the "Add Contact" button.
 *
 * When the "Add Contact" button is clicked, this function triggers the process of rendering
 * the "Add Contact" card, attaching the necessary close listeners, and opening the contact modal.
 *
 * @returns {void}
 */
let addButton = document.querySelector('.add-contact');
if (addButton) {
    addButton.addEventListener('click', () => {
        renderAddContactCard();
        attachCloseListeners();
        openModalContact();
    });
}


/**
 * Adds an event listener for the "click" event on the document to handle the deletion of a contact.
 *
 * When a "delete-button" is clicked, this function retrieves the `data-id` attribute of the
 * button, checks if it exists, and if so, calls the `deleteContact()` function to delete the
 * corresponding contact.
 *
 * @returns {void}
 */
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


/**
 * Adds an event listener for the "click" event on the modal close button.
 *
 * When the "close-modal-contact" button is clicked, this function calls the `closeModalContact`
 * function to close the contact modal.
 *
 * @returns {void}
 */
let closeModalButton = document.querySelector('.close-modal-contact');
if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModalContact);
}


/**
 * Adds an event listener for the "click" event on the modal delete button.
 *
 * When the "delete-modal-contact" button is clicked, this function calls the `closeModalEditContact`
 * function to close the edit contact modal.
 *
 * @returns {void}
 */
let deleteModalButton = document.querySelector('.delete-modal-contact');
if (deleteModalButton) {
    deleteModalButton.addEventListener('click', closeModalEditContact);
}


/**
 * Handles a click event on the window to close the contact modals when clicking outside the modal.
 *
 * If the target of the click event is the modal container (`#myModal-contact`), 
 * it triggers the functions to close the contact modal (`closeModalContact`) and the edit contact modal (`closeModalEditContact`).
 *
 * @param {Event} event - The click event triggered by the user.
 * @returns {void}
 */
window.onclick = function (event) {
    if (event.target === document.getElementById('myModal-contact')) {
        closeModalContact();
        closeModalEditContact();
    }
};


/**
 * Renders and displays the add contact card inside the container.
 *
 * This function clears any existing content in the `.add-contact-card` container, 
 * creates a new contact card (with default values if no contact is passed), 
 * and appends it to the container. It also applies a fade-in effect by adding
 * a class after a short delay.
 *
 * @param {Object} [contact] - The contact data to display in the add contact card.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * 
 * @returns {void}
 */
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


/**
 * Renders and displays the edit contact card inside the container.
 *
 * This function clears any existing content in the `.edit-contact-card` container,
 * creates a new contact card (with the provided contact data), and appends it to the container. 
 * It also applies a fade-in effect by adding a class after a short delay.
 *
 * @param {Object} contact - The contact data to display in the edit contact card.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} contact.color - The color associated with the contact.
 * 
 * @returns {void}
 */
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


/**
 * Creates the add contact card element and attaches event listeners for save and cancel actions.
 *
 * This function creates a new contact card for adding a contact. It initializes the contact card 
 * with the provided initials, generates the HTML structure for the card, and attaches event listeners 
 * for the "save" and "cancel" buttons. The "save" button triggers the save process, while the "cancel" 
 * button closes the modal.
 *
 * @param {Object} contact - The contact data used to generate the add contact card.
 * @param {string} contact.name - The name of the contact (used for generating initials).
 * @param {string} contact.email - The email of the contact (not directly used in the card, but part of the contact).
 * @param {string} contact.phone - The phone number of the contact (not directly used in the card, but part of the contact).
 * @param {string} contact.color - The color associated with the contact (not directly used in the card, but part of the contact).
 *
 * @returns {HTMLElement} The created add contact card element.
 */
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
