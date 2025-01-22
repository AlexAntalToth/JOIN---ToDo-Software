/**
 * Creates the edit contact card element and attaches event listeners for save and delete actions.
 *
 * This function creates a contact card for editing an existing contact. It generates the contact card 
 * with the provided contact data, sets up event listeners for the "save" and "delete" buttons, and 
 * returns the card element. The "save" button triggers the save process, while the "delete" button 
 * triggers the deletion of the contact.
 *
 * @param {Object} contact - The contact data used to generate the edit contact card.
 * @param {string} contact.id - The unique ID of the contact being edited.
 * @param {string} contact.name - The name of the contact (used for generating initials).
 * @param {string} contact.email - The email of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} contact.color - The color associated with the contact.
 *
 * @returns {HTMLElement} The created edit contact card element.
 */
function createEditContactCard(contact) {
    let initials = getContactInitials(contact);
    let editContactCard = createEditCardElement(contact, initials);
    setupSaveButton(editContactCard, contact.id);
    setupDeleteButton(editContactCard);
    return editContactCard;
}


/**
 * Retrieves the initials of the contact based on the contact's name.
 *
 * This function extracts the first letter of the first and last name from the given contact 
 * object, and returns them as the initials. The initials are formed by the first letter of 
 * the first name and the first letter of the last name (if available).
 *
 * @param {Object} contact - The contact object containing the name information.
 * @param {string} contact.name - The full name of the contact.
 *
 * @returns {string} The initials of the contact, formed by the first letters of the first and last name.
 */
function getContactInitials(contact) {
    return getInitialsAndFirstLetter(contact).initials;
}


/**
 * Creates the HTML element for the edit contact card.
 *
 * This function creates a new `div` element for the contact's edit card, sets its data attributes,
 * and populates its content with the provided contact data and initials. It uses the 
 * `generateEditContactCardHTML` function to generate the HTML structure.
 *
 * @param {Object} contact - The contact object containing the information to be displayed.
 * @param {string} initials - The initials of the contact to be displayed.
 * 
 * @returns {HTMLElement} The created `div` element representing the edit contact card.
 */
function createEditCardElement(contact, initials) {
    let editContactCard = document.createElement("div");
    editContactCard.classList.add("edit-card-content");
    editContactCard.setAttribute("data-id", contact.id);
    editContactCard.innerHTML = generateEditContactCardHTML(contact, initials);
    return editContactCard;
}


/**
 * Sets up the event listener for the save button in the edit contact card.
 *
 * This function finds the save button within the provided edit contact card element
 * and adds an event listener to trigger the `saveExistingContact` function when clicked.
 *
 * @param {HTMLElement} editContactCard - The contact's edit card element.
 * @param {string} contactId - The unique ID of the contact being edited.
 */
function setupSaveButton(editContactCard, contactId) {
    let saveButton = editContactCard.querySelector(".save-contact-button");
    saveButton.addEventListener("click", () => saveExistingContact(contactId));
}


/**
 * Sets up the event listener for the delete button in the edit contact card.
 *
 * This function finds the delete button within the provided edit contact card element
 * and adds an event listener to trigger the `handleDeleteButtonClick` function when clicked.
 *
 * @param {HTMLElement} editContactCard - The contact's edit card element.
 */
function setupDeleteButton(editContactCard) {
    let deleteButton = editContactCard.querySelector(".delete-contact-button");
    deleteButton.addEventListener("click", () => handleDeleteButtonClick(deleteButton));
}


/**
 * Handles the click event on the delete button in the edit contact card.
 * 
 * This function retrieves the contact ID from the delete button's data attribute,
 * calls the `deleteContact` function to delete the contact, and then closes the 
 * modal for editing the contact.
 *
 * @param {HTMLElement} deleteButton - The delete button element in the edit contact card.
 */
function handleDeleteButtonClick(deleteButton) {
    let contactId = deleteButton.getAttribute("data-id");
    if (contactId) {
        deleteContact(contactId);
        closeModalEditContact();
    }
}


/**
 * Attaches event listeners to all close modal buttons.
 * 
 * This function adds event listeners to buttons with the classes `.close-modal-contact` 
 * and `.close-modal-edit-contact`. When these buttons are clicked, the corresponding 
 * modal close functions (`closeModalContact` and `closeModalEditContact`) are triggered.
 */
function attachCloseListeners() {
    document.querySelectorAll('.close-modal-contact').forEach(button => {
        button.addEventListener('click', closeModalContact);
    });
    document.querySelectorAll('.close-modal-edit-contact').forEach(button => {
        button.addEventListener('click', closeModalEditContact);
    });
}


/**
 * Saves a new contact after validating the contact form data.
 * 
 * This function retrieves the values from the contact form, validates the input, and if valid,
 * creates a new contact object. It then attempts to save the contact to the database. If the save 
 * is successful, it handles the response accordingly.
 * 
 * @async
 * @function saveNewContact
 * @throws {Error} Throws an error if the contact save process fails.
 */
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
        console.error("Error while deleting the contact", error);
    }
}


/**
 * Retrieves and returns the values from the contact form fields.
 * 
 * This function retrieves the values from the contact form's name, email, and phone fields,
 * trims any leading or trailing spaces, and returns them as an object.
 * 
 * @function getContactFormValues
 * @returns {Object} An object containing the contact form values:
 *   - {string} name - The trimmed name entered in the contact form.
 *   - {string} email - The trimmed email entered in the contact form.
 *   - {string} phone - The trimmed phone number entered in the contact form.
 */
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


/**
 * Validates the contact form fields (name, email, and phone).
 * Checks that all fields are filled, that the name contains both first and last name,
 * and that the email address is valid.
 * 
 * @param {string} name - The name of the contact (should contain first and last name).
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 * @returns {boolean} Returns `true` if all fields are valid, otherwise `false`.
 */
function validateContactFields(name, email, phone) {
    if (!name || !email || !phone) {
        showErrorMessage("Please complete all fields.");
        return false;
    }
    if (name.split(" ").length < 2) {
        showErrorMessage("Please enter your first and last name.");
        return false;
    }
    if (!validateEmail(email)) {
        showErrorMessage("Please enter a valid email address.");
        return false;
    }
    if (!validatePhone(phone)) {
        showErrorMessage("Please enter a valid phone number.");
        return false;
    }
    return true;
}


/**
 * Validates an email address using a regular expression pattern.
 * Checks if the email follows the standard format: local-part@domain.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} Returns `true` if the email is valid, otherwise `false`.
 */
function validateEmail(email) {
    let emailPattern = /^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}


/**
 * Validiert eine Telefonnummer.
 * Überprüft, ob die Eingabe nur aus Ziffern besteht.
 * 
 * @param {string} phone Die Telefonnummer als Zeichenkette, die validiert werden soll.
 * @returns {boolean} `true`, wenn die Telefonnummer nur aus Ziffern besteht, sonst `false`.
 */
function validatePhone(phone) {
    let phonePattern = /^[0-9]+$/;
    return phonePattern.test(phone);
}


/**
 * Creates a new contact object.
 * 
 * This function generates a new contact object with the provided name, email, and phone,
 * and assigns a random color to the contact using the `generateRandomColor` function.
 * 
 * @function createNewContact
 * @param {string} name - The name of the contact.
 * @param {string} email - The email address of the contact.
 * @param {string} phone - The phone number of the contact.
 * @returns {Object} Returns an object representing the new contact, with properties:
 *                   - `name`: The name of the contact.
 *                   - `email`: The email address of the contact.
 *                   - `phone`: The phone number of the contact.
 *                   - `color`: A randomly generated color for the contact.
 */
function createNewContact(name, email, phone) {
    return {
        name,
        email,
        phone,
        color: generateRandomColor()
    };
}


/**
 * Saves a new contact to the database.
 * 
 * This function sends a POST request to save a new contact to the database using the provided
 * contact object. The contact data is sent as a JSON payload in the request body.
 * 
 * @async
 * @function saveContactToDatabase
 * @param {Object} newContact - The new contact to be saved.
 * @param {string} newContact.name - The name of the contact.
 * @param {string} newContact.email - The email address of the contact.
 * @param {string} newContact.phone - The phone number of the contact.
 * @param {string} newContact.color - The color assigned to the contact.
 * @returns {Promise<Response>} A Promise that resolves to the response object from the `fetch` request.
 */
async function saveContactToDatabase(newContact) {
    return fetch(BASE_URL + "/contacts.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
    });
}


/**
 * Handles the successful saving of a new contact.
 * 
 * This function processes the response from the database after a new contact is successfully saved. 
 * It updates the new contact with the generated ID, closes the modal, reloads the contacts, 
 * displays a success overlay, renders the contact card, and scrolls to the newly added contact.
 * 
 * @async
 * @function handleSuccessfulSave
 * @param {Response} response - The response object returned from the `fetch` request after saving the new contact.
 * @param {Object} newContact - The new contact object that was saved.
 * @param {string} newContact.name - The name of the new contact.
 * @param {string} newContact.email - The email of the new contact.
 * @param {string} newContact.phone - The phone number of the new contact.
 * @param {string} newContact.color - The color assigned to the new contact.
 * @param {string} newContact.id - The ID assigned to the new contact after saving.
 * @returns {Promise<void>} A Promise that resolves once the contact has been processed and the view updated.
 */
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


/**
 * Scrolls the page to the newly added contact and selects it.
 * 
 * This function locates the newly added contact element based on its ID, scrolls the page 
 * to bring it into view, and highlights the contact. If the view is mobile, it also activates 
 * the contact by setting it as the active contact.
 * 
 * @function scrollToNewContact
 * @param {Object} newContact - The new contact that was added.
 * @param {string} newContact.id - The ID of the new contact.
 * @param {string} newContact.name - The name of the new contact.
 * @param {string} newContact.email - The email address of the new contact.
 * @param {string} newContact.phone - The phone number of the new contact.
 * @param {string} newContact.color - The assigned color of the new contact.
 * @returns {void}
 */
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


/**
 * Deletes a contact from the database by its ID and updates the view.
 * 
 * This function sends a DELETE request to remove a contact from the database 
 * and updates the UI accordingly. After deletion, the contact list is reloaded, 
 * and the active contact (if any) is cleared. Any errors during the deletion 
 * process are logged to the console.
 * 
 * @function deleteContact
 * @param {string} contactId - The ID of the contact to be deleted.
 * @returns {Promise<void>} Resolves when the contact is successfully deleted and the view is updated.
 */
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
        console.error("Error while deleting the contact", error);
    }
}


/**
 * Updates the view after a contact is deleted.
 * 
 * This function adjusts the layout based on the current view (mobile or desktop) 
 * after a contact has been deleted. It clears the highlighted contact, reloads 
 * the contacts list, and updates the relevant sections of the page.
 * 
 * @function updateViewAfterDelete
 * @returns {void}
 */
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


/**
 * Updates the mobile view after a contact is deleted.
 * 
 * This function adjusts the display of various sections in mobile view by hiding
 * the contact details, showing the contact list, and clearing the contact card 
 * container if it exists.
 * 
 * @function updateMobileView
 * @param {HTMLElement} contactsDetails - The DOM element representing the contact details section.
 * @param {HTMLElement} contactsList - The DOM element representing the contact list section.
 * @param {HTMLElement} contactCardContainer - The DOM element representing the contact card container.
 * @returns {void}
 */
function updateMobileView(contactsDetails, contactsList, contactCardContainer) {
    contactsDetails.style.display = "none";
    contactsList.style.display = "block";
    if (contactCardContainer) {
        clearContactCard(contactCardContainer);
    }
}
