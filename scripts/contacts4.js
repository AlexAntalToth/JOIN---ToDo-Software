/**
 * Updates the desktop view after a contact is deleted.
 * 
 * This function adjusts the display of various sections in desktop view by ensuring
 * that both the contact details and contact list are visible, and clears the contact 
 * card container if it exists.
 * 
 * @function updateDesktopView
 * @param {HTMLElement} contactsDetails - The DOM element representing the contact details section.
 * @param {HTMLElement} contactsList - The DOM element representing the contact list section.
 * @param {HTMLElement} contactCardContainer - The DOM element representing the contact card container.
 * @returns {void}
 */
function updateDesktopView(contactsDetails, contactsList, contactCardContainer) {
    contactsDetails.style.display = "block";
    contactsList.style.display = "block";
    if (contactCardContainer) {
        clearContactCard(contactCardContainer);
    }
}


/**
 * Clears the contact card container by removing its content and visibility.
 * 
 * This function clears the inner HTML of the given contact card container and hides it
 * by removing the 'contacts-card-visible' class. This is typically used when switching
 * or deleting a contact card.
 * 
 * @function clearContactCard
 * @param {HTMLElement} contactCardContainer - The DOM element representing the contact card container.
 * @returns {void}
 */
function clearContactCard(contactCardContainer) {
    contactCardContainer.innerHTML = "";
    contactCardContainer.classList.remove("contacts-card-visible");
}


/**
 * Displays an overlay indicating a new contact has been created.
 * 
 * This function creates an overlay element and appends it to the parent container
 * (typically the contact details area). It conditionally displays the overlay based
 * on the device view (mobile or desktop).
 * 
 * @function showContactCreatedOverlay
 * @returns {void}
 */
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


/**
 * Creates an overlay element indicating that a contact has been successfully created.
 * 
 * This function creates a new `div` element, assigns it the class `contact-created-overlay`,
 * and sets the text content to "Contact successfully created".
 * 
 * @function createOverlay
 * @returns {HTMLElement} The created overlay element.
 */
function createOverlay() {
    let overlay = document.createElement("div");
    overlay.className = "contact-created-overlay";
    overlay.textContent = "Contact successfully created";
    return overlay;
}


/**
 * Appends an overlay element to a specified container.
 * 
 * This function takes an existing container and appends the given overlay element as a child.
 * 
 * @function appendOverlayToContainer
 * @param {HTMLElement} container - The container to which the overlay will be appended.
 * @param {HTMLElement} overlay - The overlay element to be appended to the container.
 */
function appendOverlayToContainer(container, overlay) {
    container.appendChild(overlay);
}


/**
 * Displays an overlay on mobile view for a specified duration.
 * 
 * This function shows an overlay in the `.contacts-details` container. It makes the container visible, sets its z-index, 
 * and then displays the overlay with a delay. After a set duration, the overlay is hidden.
 * 
 * @function showMobileOverlay
 * @param {HTMLElement} overlay - The overlay element to be displayed.
 */
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


/**
 * Displays an overlay on desktop view for a specified duration.
 * 
 * This function shows an overlay with a slight delay and then hides it after a specified duration.
 * It adds the "show" class to the overlay to make it visible, and after the timeout, it hides the overlay.
 * 
 * @function showDesktopOverlay
 * @param {HTMLElement} overlay - The overlay element to be displayed.
 */
function showDesktopOverlay(overlay) {
    setTimeout(() => {
        overlay.classList.add("show");
    }, 10);

    setTimeout(() => {
        hideOverlay(overlay);
    }, 1500);
}


/**
 * Hides and removes an overlay element.
 * 
 * This function first removes the "show" class to hide the overlay, and after a short timeout, 
 * it removes the overlay element from the DOM.
 * 
 * @function hideOverlay
 * @param {HTMLElement} overlay - The overlay element to be hidden and removed.
 */
function hideOverlay(overlay) {
    overlay.classList.remove("show");
    setTimeout(() => {
        overlay.remove();
    }, 600);
}


/**
 * Saves an existing contact after updating its details.
 * 
 * This function retrieves the contact details from the form, validates them, 
 * and updates the contact information in the database. If the update is successful, 
 * it handles the response accordingly.
 * 
 * @async
 * @function saveExistingContact
 * @param {string} contactId - The ID of the contact to be updated.
 * @returns {Promise<void>} A promise that resolves when the contact is successfully updated or fails.
 */
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


/**
 * Retrieves the values of the contact fields from the form.
 * 
 * This function fetches the current values of the name, email, and phone fields 
 * from the contact form and returns them as an object.
 * 
 * @function getContactFields
 * @returns {Object} An object containing the contact's name, email, and phone.
 * @property {string} name - The contact's name.
 * @property {string} email - The contact's email.
 * @property {string} phone - The contact's phone number.
 */
function getContactFields() {
    let name = getFieldValue("contact-name2");
    let email = getFieldValue("contact-email2");
    let phone = getFieldValue("contact-phone2");
    return { name, email, phone };
}


/**
 * Handles the response after attempting to save an updated contact.
 * 
 * This function checks the response from the save request and takes appropriate 
 * actions based on whether the save operation was successful or not.
 * 
 * @function handleSaveResponse
 * @param {Response} responsePut - The response from the save request.
 * @param {Object} updatedContact - The contact object that has been updated.
 * @returns {void}
 */
function handleSaveResponse(responsePut, updatedContact) {
    if (responsePut.ok) {
        updateViewAfterSave(updatedContact);
    } else {
        console.error("Failed to save contact.");
    }
}


/**
 * Handles errors that occur during the save operation.
 * 
 * This function logs the error to the console when an error occurs during the 
 * process of saving or updating a contact.
 * 
 * @function handleSaveError
 * @param {Error} error - The error object containing details about the failure.
 * @returns {void}
 */
function handleSaveError(error) {
    console.error("Error while deleting the contact", error);
}


/**
 * Retrieves the value of a form field by its ID and trims any leading or trailing spaces.
 * 
 * This function looks for a form field element with the specified ID and returns its value.
 * If the field is found, it returns the value with leading and trailing whitespace removed.
 * If the field is not found, it returns an empty string.
 * 
 * @function getFieldValue
 * @param {string} fieldId - The ID of the form field.
 * @returns {string} The trimmed value of the form field, or an empty string if the field is not found.
 */
function getFieldValue(fieldId) {
    let field = document.getElementById(fieldId);
    return field ? field.value.trim() : "";
}


/**
 * Fetches an existing contact's data from the database using the contact's ID.
 * 
 * This function sends a GET request to the server to retrieve the details of a contact 
 * specified by the given contact ID. If the request is successful, the contact data is returned. 
 * If the request fails, an error is thrown.
 * 
 * @async
 * @function fetchExistingContact
 * @param {string} contactId - The unique ID of the contact to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the contact's data in JSON format.
 * @throws {Error} Throws an error if the request fails or the contact is not found.
 */
async function fetchExistingContact(contactId) {
    let responseGet = await fetch(`${BASE_URL}/contacts/${contactId}.json`);
    if (!responseGet.ok) {
        throw new Error("Failed to fetch existing contact");
    }
    return await responseGet.json();
}


/**
 * Creates an updated contact object by merging the existing contact data with the new values.
 * 
 * This function creates a new contact object by using the existing contact's data, while
 * updating the name, email, and phone with the new values passed to the function.
 * The contact ID remains unchanged.
 * 
 * @function createUpdatedContact
 * @param {string} contactId - The unique ID of the contact being updated.
 * @param {Object} existingContact - The existing contact's data before the update.
 * @param {string} name - The updated name of the contact.
 * @param {string} email - The updated email of the contact.
 * @param {string} phone - The updated phone number of the contact.
 * @returns {Object} The updated contact object containing the new values.
 */
function createUpdatedContact(contactId, existingContact, name, email, phone) {
    return {
        id: contactId,
        ...existingContact,
        name,
        email,
        phone
    };
}


/**
 * Saves the updated contact to the database by sending a PUT request to the server.
 * 
 * This function sends a PUT request to update the contact data on the server.
 * The contact's updated information is passed as the body of the request.
 * 
 * @function saveUpdatedContact
 * @param {string} contactId - The unique ID of the contact being updated.
 * @param {Object} updatedContact - The updated contact object to be saved.
 * @returns {Promise<Response>} A promise that resolves to the response of the PUT request.
 */
async function saveUpdatedContact(contactId, updatedContact) {
    return await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContact),
    });
}


/**
 * Updates the view after saving an updated contact.
 * 
 * This function handles the UI updates after a contact has been successfully saved. 
 * It closes the modal, reloads the contacts, renders the updated contact card, 
 * and scrolls the updated contact element into view.
 * 
 * @function updateViewAfterSave
 * @param {Object} updatedContact - The contact object containing the updated information.
 */
function updateViewAfterSave(updatedContact) {
    if (!updatedContact) {
        console.error("No updated contact provided.");
        return;
    }
    closeModalEditContact();
    loadContacts();
    renderContactCard(updatedContact);
    setTimeout(() => {
        let updatedContactElement = document.querySelector(`.contact-item[data-id="${updatedContact.id}"]`);
        if (updatedContactElement) {
            ContactSelection(updatedContactElement);
            updatedContactElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 1600);
}


/**
 * Displays an error message to the user.
 * 
 * This function shows an error message inside a designated error message box. 
 * The message box is displayed for 2.5 seconds before automatically hiding.
 * 
 * @function showErrorMessage
 * @param {string} message - The error message to display.
 */
function showErrorMessage(message) {
    let errorBox = document.getElementById("error-message-box");
    errorBox.textContent = message;
    errorBox.classList.add("show");

    setTimeout(() => {
        errorBox.classList.remove("show");
    }, 2500);
}
