// Title
/**
 * Sets up the event listener for the task title field. 
 * The listener triggers validation whenever the input value changes.
 *
 * @function setupTitleField
 * @returns {void}
 */
function setupTitleField() {
    let titleField = document.getElementById('task-title');
    if (titleField) {
        titleField.addEventListener('input', validateFields);
    }
}


//AssignedTo
/**
 * Sets up the assigned-to field by retrieving the necessary elements and 
 * initializing the field with those elements.
 *
 * @function setupAssignedToField
 * @returns {void}
 */
// Assigned to
function setupAssignedToField() {
    let elements = getAssignedToElements();
    if (!elements) return;

    initializeAssignedToField(elements);
}


/**
 * Initializes the "Assigned To" field by setting up event listeners 
 * and rendering the contact list with selection.
 *
 * @function initializeAssignedToField
 * @param {Array} elements - The elements associated with the "Assigned To" field.
 * @returns {void}
 */
function initializeAssignedToField(elements) {
    let searchTerm = "";
    setupToggleListeners(elements, searchTerm);
    setupSearchListener(elements, searchTerm);
    setupGlobalClickListener(elements);
    renderContactListWithSelection();
}


/**
 * Sets up event listeners for toggling the contact list visibility 
 * when certain elements are clicked.
 *
 * @function setupToggleListeners
 * @param {Object} elements - An object containing the elements related to the "Assigned To" field.
 * @param {string} searchTerm - The search term used to filter contacts.
 * @returns {void}
 */
function setupToggleListeners(elements, searchTerm) {
    elements.assignedToIconWrapper.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleContactList(elements, searchTerm);
    });

    elements.assignedToField.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleContactList(elements, searchTerm);
    });
}


/**
 * Sets up an event listener to handle input events on the search field 
 * for filtering contacts based on the search term.
 *
 * @function setupSearchListener
 * @param {Object} elements - An object containing the elements related to the "Assigned To" field.
 * @param {string} searchTerm - The current search term used to filter contacts.
 * @returns {void}
 */
function setupSearchListener(elements, searchTerm) {
    elements.searchContacts.addEventListener("input", (event) => {
        searchTerm = event.target.value.toLowerCase();
        renderFilteredContactList(searchTerm);
    });
}


/**
 * Sets up a global click listener that detects clicks outside the "Assigned To" field 
 * or the contact list, and closes the contact list if clicked outside.
 *
 * @function setupGlobalClickListener
 * @param {Object} elements - An object containing the elements related to the "Assigned To" field and contact list.
 * @returns {void}
 */
function setupGlobalClickListener(elements) {
    document.addEventListener("click", (event) => {
        if (
            !elements.assignedToField.contains(event.target) &&
            !elements.contactList.contains(event.target)
        ) {
            closeContactList(elements);
        }
    });
}


/**
 * Toggles the visibility of the contact list. If the contact list is visible, it will be closed.
 * If it is not visible, it will be opened and the search term will be passed to filter contacts.
 *
 * @function toggleContactList
 * @param {Object} elements - An object containing the elements related to the contact list.
 * @param {string} searchTerm - A string used to filter contacts when the contact list is opened.
 * @returns {void}
 */
function toggleContactList(elements, searchTerm) {
    let isVisible = elements.contactList.style.display === "block";
    if (isVisible) {
        closeContactList(elements);
    } else {
        openContactList(elements, searchTerm);
    }
}


/**
 * Opens the contact list and prepares it for displaying the filtered contacts based on the search term.
 * It shows the contact list, modifies UI elements, and focuses the search input field.
 *
 * @function openContactList
 * @param {Object} elements - An object containing the elements related to the contact list.
 * @param {string} searchTerm - The search term used to filter contacts.
 * @returns {void}
 */
function openContactList(elements, searchTerm) {
    elements.contactList.style.display = "block";
    elements.assignedToField.classList.add("open");
    elements.assignedToIconWrapper.classList.add("rotated");
    elements.searchContacts.style.display = "block";
    elements.assignedToText.style.display = "none";
    elements.searchContacts.focus();
    renderFilteredContactList(searchTerm);
}


/**
 * Closes the contact list and resets the UI elements to their initial state.
 * It hides the contact list, restores the icon rotation, and resets the search input field.
 *
 * @function closeContactList
 * @param {Object} elements - An object containing the elements related to the contact list.
 * @returns {void}
 */
function closeContactList(elements) {
    elements.contactList.style.display = "none";
    elements.assignedToField.classList.remove("open");
    elements.assignedToIconWrapper.classList.remove("rotated");
    elements.searchContacts.style.display = "none";
    elements.assignedToText.style.display = "block";
    resetFilter();
}


/**
 * Renders a filtered list of contacts based on the provided search filter.
 * It iterates through all contact items and displays them if the contact's name starts with the filter term.
 *
 * @function renderFilteredContactList
 * @param {string} filter - The search term used to filter the contact list.
 * @returns {void}
 */
function renderFilteredContactList(filter) {
    let contactItems = document.querySelectorAll(".contact-item");
    contactItems.forEach(contactItem => {
        let contactName = contactItem.querySelector(".contact-name").textContent.toLowerCase();
        let shouldShow = contactName.startsWith(filter);
        contactItem.style.display = shouldShow ? "flex" : "none";
    });
}


/**
 * Resets the contact list filter by clearing the search input and displaying all contact items.
 * It restores the contact list to its original state without any filtering applied.
 *
 * @function resetFilter
 * @returns {void}
 */
function resetFilter() {
    let searchContacts = document.getElementById("searchContacts");
    let contactItems = document.querySelectorAll(".contact-item");

    if (searchContacts) searchContacts.value = "";
    contactItems.forEach(contactItem => {
        contactItem.style.display = "flex";
    });
}


/**
 * Renders the contact list with selection and updates checkbox statuses.
 * This function first updates the checkbox status based on the selected contacts
 * and then adds the necessary event listeners for each contact item.
 * 
 */
function renderContactListWithSelection() {
    updateCheckboxStatus();
    addEventListenersToContactItems();
}


/**
 * Updates the checkbox status for each contact item based on the selected contacts.
 * This function checks each checkbox to see if the contact item is in the selectedContacts array.
 * If a contact is selected, its checkbox will be checked.
 * 
 */
function updateCheckboxStatus() {
    let contactItems = document.querySelectorAll(".contact-item");
    contactItems.forEach(contactItem => {
        let contactId = contactItem.dataset.id;
        let checkbox = contactItem.querySelector(".contact-checkbox");
        if (checkbox) {
            checkbox.checked = selectedContacts.some(contact => contact.id === contactId);
        }
    });
}


/**
 * Adds event listeners to all contact items for handling click events.
 * Each contact item gets a listener for the click event to handle selection changes.
 * The checkboxes within each contact item also get a listener to handle their click events.
 * 
 */
function addEventListenersToContactItems() {
    let contactItems = document.querySelectorAll(".contact-item");
    contactItems.forEach(contactItem => {
        contactItem.removeEventListener("click", handleContactItemClick);
        contactItem.addEventListener("click", handleContactItemClick);

        let checkbox = contactItem.querySelector(".contact-checkbox");
        if (checkbox) {
            checkbox.removeEventListener("click", handleCheckboxClick);
            checkbox.addEventListener("click", handleCheckboxClick);
        }
    });
}


/**
 * Handles the click event on a contact item.
 * Toggles the checkbox state when the contact item is clicked,
 * and updates the contact selection accordingly.
 *
 * @param {Event} event - The click event triggered by clicking on a contact item.
 */
function handleContactItemClick(event) {
    let contactItem = event.currentTarget;
    let checkbox = contactItem.querySelector(".contact-checkbox");
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        handleContactSelection(contactItem, checkbox.checked);
    }
}


/**
 * Handles the click event on a checkbox inside a contact item.
 * Prevents the event from propagating and calls the `handleContactItemClick`
 * function to toggle the checkbox state and update the contact selection.
 *
 * @param {Event} event - The click event triggered by clicking on a checkbox.
 */
function handleCheckboxClick(event) {
    event.stopPropagation();
    handleContactItemClick({ currentTarget: event.currentTarget.closest(".contact-item") });
}


/**
 * Handles the selection or deselection of a contact item.
 * Adds or removes the contact from the selected list based on the checkbox state.
 * Updates the initials of the selected contacts after the change.
 *
 * @param {HTMLElement} contactItem - The contact item DOM element that was clicked.
 * @param {boolean} isChecked - The checkbox state (true if selected, false if deselected).
 */
function handleContactSelection(contactItem, isChecked) {
    let contactId = contactItem.dataset.id;
    let contact = contacts.find(c => c.id === contactId);
    if (contact) {
        if (isChecked) {
            addContact(contactItem, contact);
        } else {
            removeContact(contactItem, contactId);
        }
        updateSelectedContactInitials();
    }
}


/**
 * Adds a contact to the selected contacts list and marks the contact item as selected.
 *
 * @param {HTMLElement} contactItem - The DOM element representing the contact item.
 * @param {Object} contact - The contact object containing details such as id and name.
 * @param {string} contact.id - The unique identifier of the contact.
 */
function addContact(contactItem, contact) {
    if (!selectedContacts.some(c => c.id === contact.id)) {
        selectedContacts.push(contact);
    }
    contactItem.classList.add("selected");
}


/**
 * Removes a contact from the selected contacts list and unmarks the contact item as selected.
 *
 * @param {HTMLElement} contactItem - The DOM element representing the contact item.
 * @param {string} contactId - The unique identifier of the contact to be removed.
 */
function removeContact(contactItem, contactId) {
    selectedContacts = selectedContacts.filter(c => c.id !== contactId);
    contactItem.classList.remove("selected");
}


/**
 * Sets up the event listener for the contact list. When a contact is clicked, 
 * the corresponding click handler is triggered.
 * 
 */
function setupContactList() {
    let contactListElement = document.getElementById("contactList");
    if (contactListElement) {
        contactListElement.addEventListener("click", (event) => {
            handleContactClick(event);
        });
    }
}


/**
 * Handles the click event on a contact item. Toggles the selection state of the contact 
 * by checking or unchecking the associated checkbox and adding or removing the 'selected' class.
 * 
 * @param {Event} event - The click event triggered when a contact item is clicked.
 */
function handleContactClick(event) {
    let target = event.target;
    let contactItem = target.closest(".contact-item");
    if (!contactItem) return;
    let checkbox = contactItem.querySelector(".contact-checkbox");
    if (!checkbox) return;
    let isSelected = checkbox.checked;
    checkbox.checked = !isSelected;
    if (checkbox.checked) {
        contactItem.classList.add("selected");
    } else {
        contactItem.classList.remove("selected");
    }
}