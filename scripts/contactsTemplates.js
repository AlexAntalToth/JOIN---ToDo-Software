
/**
 * Generates the HTML template for displaying a contact's details.
 * 
 * This function creates a template string containing the HTML structure for a contact's name, 
 * email, and initials. The template is used to display contact information in the UI.
 * 
 * @param {Object} contact - The contact object containing the contact's details.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @param {string} initials - The initials to display in a circle representing the contact.
 * 
 * @returns {string} The HTML string representing the contact's details template.
 */
function getContactsTemplate(contact, initials) {
    return `
        <div class="contact-info">
            <div class="contact-initials-circle">
                <span>${initials}</span>
            </div>
            <div class="contact-name-and-email">
                <h3>${contact.name}</h3>
                <p>${contact.email}</p>
            </div>
        </div>
    `;
}


/**
 * Creates a base contact element with attributes for displaying contact information.
 * 
 * This function creates a `div` element with class `contact-item` and sets various
 * data attributes (such as `data-id`, `data-name`, `data-email`, etc.) based on the
 * provided contact details. It is intended to create the basic structure for a contact
 * element to be added to the UI.
 * 
 * @param {Object} contact - The contact object containing the contact's details.
 * @param {string} contact.id - The unique identifier of the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} [contact.color] - An optional background color associated with the contact.
 * 
 * @returns {HTMLElement} The created `div` element representing the contact.
 */
function createBaseContactElement(contact) {
    let contactElement = document.createElement("div");
    contactElement.classList.add("contact-item");
    contactElement.setAttribute("data-id", contact.id);
    contactElement.setAttribute("data-name", contact.name);
    contactElement.setAttribute("data-email", contact.email);
    contactElement.setAttribute("data-phone", contact.phone);
    if (contact.color) {
        contactElement.setAttribute("data-color", contact.color);
    }
    return contactElement;
}


/**
 * Generates an HTML template for a contact card.
 * 
 * This function generates the full HTML markup for a contact card, which includes the contact's
 * initials, name, email, and phone number. It also includes buttons for editing and deleting
 * the contact, with the option to add a custom background color to the initials circle.
 * 
 * @param {Object} contact - The contact object containing the contact's details.
 * @param {string} contact.id - The unique identifier of the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email address of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} [contact.color] - An optional background color associated with the contact's initials circle.
 * @param {string} initials - The initials of the contact to display in the circle.
 * 
 * @returns {string} The HTML markup for the contact card.
 */
function generateContactCardTemplate(contact, initials) {
    return `
        <div class="contacts-card-header">
            <div class="contacts-card-initials">
                <div class="contacts-card-initials-circle" ${contact.color ? `style="background-color: ${contact.color}"` : ''}>
                    <span>${initials}</span>
                </div>
                <div class="contacts-card-name-section">
                    <h3>${contact.name}</h3>
                    <div class="contacts-card-name-section-mobile-wrapper">
                        <button class="contacts-card-name-section-mobile">
                            <img class="contacts-card-name-section-mobile-edit" src="../../assets/icons/contact_edit_mobile.png"
                                alt="Logo Edit Contact Mobile">
                        </button>
                        <div class="contacts-card-name-section2">
                            <button class="edit-button" data-id="${contact.id}"> 
                                <svg class="edit-contact-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_268101_3948" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                    <rect width="24" height="24" fill="#D9D9D9"/>
                                    </mask>
                                    <g mask="url(#mask0_268101_3948)">
                                        <path d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3042 2.75 17.8625 2.75C18.4208 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.57083 21.275 6.1125C21.2917 6.65417 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4Z" fill="#2A3647"/>
                                    </g>
                                </svg>
                                <p>Edit</p>
                            </button>
                            <button class="delete-button" data-id="${contact.id}">
                                <svg class="delete-contact-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <mask id="mask0_268101_4160" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                                        <rect width="24" height="24" fill="#D9D9D9"/>
                                    </mask>
                                    <g mask="url(#mask0_268101_4160)">
                                        <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
                                    </g>
                                </svg>
                                <p>Delete</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="contacts-card-details">
            <h2>Contact information</h2>
            <p>Email</p>
            <h3>${contact.email}</h3>
            <p>Phone</p>
            <h4>${contact.phone}</h4>
        </div>
    `;
}


/**
 * Generates an HTML template for the "Add Contact" card.
 * 
 * This function generates the HTML markup for a contact creation form, including fields for entering 
 * a contact's name, email, and phone number. It also includes buttons for cancelling or saving the 
 * contact, as well as the contact's initials displayed in a circle.
 * 
 * @param {string} initials - The initials of the contact to display in the circle.
 * @returns {string} The HTML markup for the "Add Contact" card.
 */
function generateAddContactCardHTML(initials) {
    return `
        <div class="contacts-card-initials">
            <div class="contacts-card-initials-circle">
                <img class="add-contact-initials_blank" src="../../assets/icons/contact_initials_blank.png"
                    alt="Logo Contact Blank">
                <span>${initials}</span>
            </div>
        </div>
        <div class="add-contact-details">
            <button class="close-modal-contact">x</button>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-name" placeholder="Name">
                <img class="add-contact-icon" src="../../assets/icons/contact_name.png" alt="Logo Contact Name">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-email" placeholder="Email">
                <img class="add-contact-icon" src="../../assets/icons/contact_email.png" alt="Logo Contact Phone">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-phone" placeholder="Phone">
                <img class="add-contact-icon" src="../../assets/icons/contact_phone.png" alt="Logo Contact Phone">
            </div>
            <div class="add-contact-buttons">
                <button class="cancel-contact-button">
                    <h2>Cancel</h2>
                    <svg class="cancel-contact-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                        <path d="M12.001 12.5001L17.244 17.7431M6.758 17.7431L12.001 12.5001L6.758 17.7431ZM17.244 7.25708L12 12.5001L17.244 7.25708ZM12 12.5001L6.758 7.25708L12 12.5001Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="save-contact-button"><h2>Create contact</h2>
                    <img class="create-contact-icon" src="../../assets/icons/contact_create.png" alt="Icon Create Contact">
                </button>
            </div>
        </div>
    `;
}


/**
 * Generates an HTML template for the "Edit Contact" card.
 * 
 * This function generates the HTML markup for editing an existing contact. The contact's name, email, 
 * and phone fields are pre-filled with the contact's existing values, and there are buttons to delete 
 * or save the edited contact. The contact's initials are displayed in a circle, with an optional background color.
 * 
 * @param {Object} contact - The contact object to be edited.
 * @param {string} initials - The initials of the contact to display in the circle.
 * @param {string} contact.id - The ID of the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.email - The email of the contact.
 * @param {string} contact.phone - The phone number of the contact.
 * @param {string} [contact.color] - The background color of the initials circle (optional).
 * 
 * @returns {string} The HTML markup for the "Edit Contact" card.
 */
function generateEditContactCardHTML(contact, initials) {
    return `
        <div class="contacts-card-initials">
            <div class="contacts-card-initials-circle" ${contact.color ? `style="background-color: ${contact.color}"` : ''}>
                <span>${initials}</span>
            </div>
        </div>
        <div class="add-contact-details">
            <button class="close-modal-edit-contact">x</button>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-name2" value="${contact.name}" placeholder="Name">
                <img class="add-contact-icon" src="../../assets/icons/contact_name.png" alt="Logo Contact Name">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-email2" value="${contact.email}" placeholder="Email">
                <img class="add-contact-icon" src="../../assets/icons/contact_email.png" alt="Logo Contact Email">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-phone2" value="${contact.phone}" placeholder="Phone">
                <img class="add-contact-icon" src="../../assets/icons/contact_phone.png" alt="Logo Contact Phone">
            </div>
            <div class="edit-contact-buttons">
                <button class="delete-contact-button" data-id="${contact.id}">
                    <h2>Delete</h2>
                </button>
                <button class="save-contact-button"><h2>Save</h2>
                    <img class="create-contact-icon" src="../../assets/icons/contact_create.png" alt="Icon Save Contact">
                </button>
            </div>
        </div>
    `;
}
