let isMobileView = checkMobileView();

/**
 * Initializes the application by loading contacts, including HTML templates, and setting up the app.
 * This function is asynchronous and waits for all required initialization steps to complete.
 *
 * @async
 * @function init
 * @returns {Promise<void>} A promise that resolves when all initialization steps are complete.
 */
async function init() {
    await loadContacts();
    await includeHTML();
    await initApp();
}


/**
 * Loads and inserts the sidebar and header HTML templates into their respective containers.
 * This function fetches the HTML templates asynchronously and updates the DOM.
 *
 * @async
 * @function loadSidebarAndHeader
 * @returns {Promise<void>} A promise that resolves when the sidebar and header content have been loaded and inserted.
 */
async function loadSidebarAndHeader() {
    let sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    let headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}


/**
 * Checks if the current viewport width is in mobile view.
 *
 * @function checkMobileView
 * @returns {boolean} `true` if the viewport width is 1100px or less, otherwise `false`.
 */
function checkMobileView() {
    return window.matchMedia("(max-width: 1100px)").matches;
}


/**
 * Updates the `isMobileView` variable whenever the window is resized.
 *
 * @listens window#resize
 */
window.addEventListener('resize', () => {
    isMobileView = checkMobileView();
});


/**
 * Handles click events on the document body, specifically for deleting contacts.
 *
 * @listens document.body#click
 * @param {MouseEvent} event - The click event object.
 * @async
 */
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


/**
 * Renders the list of contacts in the contacts area.
 *
 * @param {Array<Object>} contacts - An array of contact objects to render.
 */
function renderContactsList(contacts) {
    let contactsAreaList = getContactsAreaList();
    clearContactsArea(contactsAreaList);

    let displayedLetters = [];
    contacts.forEach(contact => {
        processContact(contact, displayedLetters, contactsAreaList);
    });
}


/**
 * Retrieves the contacts area list element from the DOM.
 *
 * @returns {HTMLElement} The DOM element representing the contacts area list.
 */
function getContactsAreaList() {
    return document.querySelector(".contacts-area-list");
}


/**
 * Clears the content of the provided contacts area list element by setting its innerHTML to an empty string.
 *
 * @param {HTMLElement} contactsAreaList - The DOM element representing the contacts area list to be cleared.
 */
function clearContactsArea(contactsAreaList) {
    contactsAreaList.innerHTML = "";
}


/**
 * Processes a contact by adding a letter divider for the first letter if not already displayed,
 * and appending the contact element to the contacts area list.
 *
 * @param {Object} contact - The contact object containing information about the contact.
 * @param {string[]} displayedLetters - An array of letters that have already been displayed as dividers.
 * @param {HTMLElement} contactsAreaList - The DOM element representing the contacts area list to append the contact element to.
 */
function processContact(contact, displayedLetters, contactsAreaList) {
    let { initials, firstLetter } = getInitialsAndFirstLetter(contact);
    if (!displayedLetters.includes(firstLetter)) {
        displayedLetters.push(firstLetter);
        addLetterDivider(firstLetter, contactsAreaList);
    }
    addContactElement(contact, initials, contactsAreaList);
}


/**
 * Adds a letter divider for the given first letter to the contacts area list.
 * This includes appending the letter element and the divider element.
 *
 * @param {string} firstLetter - The first letter of the contact's name to be used as a divider.
 * @param {HTMLElement} contactsAreaList - The DOM element representing the contacts area list where the divider will be added.
 */
function addLetterDivider(firstLetter, contactsAreaList) {
    let { letterElement, dividerElement } = getLetterDivider(firstLetter);
    contactsAreaList.appendChild(letterElement);
    contactsAreaList.appendChild(dividerElement);
}


/**
 * Adds a contact element to the contacts area list.
 * This function creates a contact element using the provided contact data and initials,
 * and appends it to the contacts area list.
 *
 * @param {Object} contact - The contact object containing the contact details.
 * @param {string} initials - The initials of the contact, used to display the contact's name or avatar.
 * @param {HTMLElement} contactsAreaList - The DOM element representing the contacts area list where the contact element will be added.
 */
function addContactElement(contact, initials, contactsAreaList) {
    let contactElement = createContactElement(contact, initials);
    contactsAreaList.appendChild(contactElement);
}


/**
 * Extracts the initials and first letter of a contact's name.
 * This function splits the contact's full name into first and last names,
 * then returns the initials (first letter of the first and last names) 
 * as well as the first letter of the full name.
 *
 * @param {Object} contact - The contact object containing the contact's details.
 * @param {string} contact.name - The full name of the contact.
 * @returns {Object} An object containing:
 *   - {string} initials - The initials formed from the first letter of the first and last names.
 *   - {string} firstLetter - The first letter of the contact's full name.
 */
function getInitialsAndFirstLetter(contact) {
    let nameParts = contact.name.split(" ");
    let firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    let lastNameInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
    let firstLetter = contact.name.charAt(0).toUpperCase();
    let initials = firstNameInitial + lastNameInitial;
    return { initials, firstLetter };
}


/**
 * Creates a letter divider element for a given letter.
 * This function generates two elements: one for displaying the letter
 * and another for a divider line that separates contacts by letter.
 *
 * @param {string} letter - The letter that will be displayed in the letter divider.
 * @returns {Object} An object containing:
 *   - {HTMLElement} letterElement - The element displaying the letter.
 *   - {HTMLElement} dividerElement - The divider element.
 */
function getLetterDivider(letter) {
    let letterElement = document.createElement("div");
    letterElement.classList.add("contact-first-letter");
    letterElement.textContent = letter;
    let dividerElement = document.createElement("div");
    dividerElement.classList.add("contact-divider");
    return { letterElement, dividerElement };
}


/**
 * Initializes a contact element by setting its HTML content, 
 * applying a background color to the initials circle (if a color is provided),
 * and adding an event listener to handle click events.
 *
 * @param {HTMLElement} contactElement - The element representing the contact.
 * @param {Object} contact - The contact data object.
 * @param {string} initials - The initials of the contact to display in the circle.
 */
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


/**
 * Creates a contact element by generating the base element and initializing it
 * with the provided contact data and initials.
 *
 * @param {Object} contact - The contact data object.
 * @param {string} initials - The initials of the contact to display in the circle.
 * @returns {HTMLElement} The fully initialized contact element.
 */
function createContactElement(contact, initials) {
    let contactElement = createBaseContactElement(contact);
    initializeContactElement(contactElement, contact, initials);
    return contactElement;
}





/**
 * Highlights the selected contact item and removes highlighting from all other contact items.
 *
 * This function removes the 'contact-item-active' class from all contact items and adds it to
 * the selected contact item, indicating that it is the active item.
 *
 * @param {Element} selectedElement - The contact item element to be marked as active.
 */
function ContactSelection(selectedElement) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
    selectedElement.classList.add('contact-item-active');
}


/**
 * Renders the contact card for the selected contact and displays it with an animation.
 *
 * This function updates the content of the contact card container with the contact's information
 * and applies an animation to make the contact card visible.
 *
 * @param {Object} contact - The contact object containing information to be displayed on the contact card.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} contact.color - The background color for the contact's initials circle (optional).
 */
function renderContactCard(contact) {
    let contactCardContainer = document.querySelector(".contacts-card");
    if (!contactCardContainer) {
        console.error("Contact card container not found.");
        return;
    }
    if (contactCardContainer.classList.contains('contacts-card-visible')) {
        contactCardContainer.classList.remove('contacts-card-visible');
    }
    contactCardContainer.innerHTML = "";
    let contactCard = createContactCard(contact);
    if (!(contactCard instanceof Node)) {
        console.error("Invalid contact card returned from createContactCard:", contactCard);
        return;
    }
    contactCardContainer.appendChild(contactCard);
    setTimeout(() => {
        contactCardContainer.classList.add('contacts-card-visible');
    }, 600);
}


/**
 * Renders the edited contact card for the updated contact and immediately displays it.
 *
 * This function updates the content of the contact card container with the updated contact's
 * information and makes the contact card visible without delay.
 *
 * @param {Object} contact - The contact object containing the updated information to be displayed on the contact card.
 * @param {string} contact.name - The updated name of the contact.
 * @param {string} contact.email - The updated email of the contact.
 * @param {string} contact.phone - The updated phone number of the contact.
 * @param {string} contact.color - The updated background color for the contact's initials circle.
 */
function renderEditedContactCard(contact) {
    let contactCardContainer = document.querySelector(".contacts-card");
    if (contactCardContainer.classList.contains('contacts-card-visible')) {
        contactCardContainer.classList.remove('contacts-card-visible');
    }
    contactCardContainer.innerHTML = "";
    let contactCard = renderContactCard(contact);
    contactCardContainer.appendChild(contactCard);
    contactCardContainer.classList.add('contacts-card-visible');
}


/**
 * Creates a contact card element containing the information of the specified contact.
 *
 * This function generates an HTML element representing a contact card. It uses the contact's
 * initials, ID, and other properties to populate the contact card template.
 *
 * @param {Object} contact - The contact object containing the information to be displayed in the contact card.
 * @param {string} contact.id - The unique identifier for the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} contact.color - The background color for the contact's initials circle.
 * @returns {HTMLElement} The contact card element populated with the contact's information.
 */
function createContactCardElement(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);
    let contactCard = document.createElement("div");
    contactCard.classList.add("contacts-card-content");
    contactCard.setAttribute("data-id", contact.id);
    contactCard.innerHTML = generateContactCardTemplate(contact, initials);
    return contactCard;
}


/**
 * Attaches an event listener to the edit button of a contact card.
 *
 * This function looks for the edit button within the provided contact card element,
 * and if found, it adds a click event listener to it. When the edit button is clicked,
 * it triggers the `handleEditButtonClick` function to handle the editing action.
 *
 * @param {HTMLElement} contactCard - The contact card element that contains the edit button.
 * @param {HTMLElement} contactCard.querySelector('.edit-button') - The edit button inside the contact card.
 */
function attachEditButtonListener(contactCard) {
    let editButton = getEditButton(contactCard);
    if (editButton) {
        editButton.addEventListener('click', () => handleEditButtonClick(editButton));
    }
}


/**
 * Retrieves the edit button from a contact card element.
 *
 * This function searches the provided contact card element for an element with the
 * class 'edit-button' and returns it. If no such element is found, it returns `null`.
 *
 * @param {HTMLElement} contactCard - The contact card element from which the edit button is to be retrieved.
 * @returns {HTMLElement|null} The edit button element if found, otherwise `null`.
 */
function getEditButton(contactCard) {
    return contactCard.querySelector('.edit-button');
}


/**
 * Handles the click event for the edit button.
 *
 * When the edit button is clicked, this function retrieves the contact's ID
 * from the button, finds the corresponding contact element, and extracts
 * the contact data. It then renders the contact's edit overview.
 *
 * @param {HTMLElement} editButton - The edit button element that was clicked.
 */
function handleEditButtonClick(editButton) {
    let contactId = getContactIdFromButton(editButton);
    let contactElement = findContactElementById(contactId);

    if (contactElement) {
        let contact = extractContactData(contactElement);
        renderEditContactOverview(contact);
    }
}
