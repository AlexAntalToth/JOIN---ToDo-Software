let isMobileView = window.matchMedia("(max-width: 1100px)").matches;

async function init() {
    await loadContacts();
    await includeHTML();
    await initApp();
}

window.addEventListener('resize', () => {
    isMobileView = window.matchMedia("(max-width: 1100px)").matches;
});

async function loadSidebarAndHeader() {
    const sidebarContent = await fetch('./assets/templates/sidebar.html').then(res => res.text());
    document.getElementById('sidebar-container').innerHTML = sidebarContent;

    const headerContent = await fetch('./assets/templates/header.html').then(res => res.text());
    document.getElementById('header-container').innerHTML = headerContent;
}

function renderContactsList(contacts) {
    let contactsAreaList = document.querySelector(".contacts-area-list");
    contactsAreaList.innerHTML = "";
    let displayedLetters = [];
    contacts.forEach(contact => {
        let { initials, firstLetter } = getInitialsAndFirstLetter(contact);
        if (!displayedLetters.includes(firstLetter)) {
            displayedLetters.push(firstLetter);
            let { letterElement, dividerElement } = getLetterDivider(firstLetter);
            contactsAreaList.appendChild(letterElement);
            contactsAreaList.appendChild(dividerElement);
        }
        let contactElement = createContactElement(contact, initials);
        contactsAreaList.appendChild(contactElement);
    });
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
    const letters = '0123456789ABCDEF';
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

function createContactCardElement(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);
    let contactCard = document.createElement("div");
    contactCard.classList.add("contacts-card-content");
    contactCard.setAttribute("data-id", contact.id);
    contactCard.innerHTML = generateContactCardTemplate(contact, initials);
    return contactCard;
}

function attachEditButtonListener(contactCard) {
    let editButton = contactCard.querySelector('.edit-button');
    if (editButton) {
        editButton.addEventListener('click', () => {
            let contactId = editButton.getAttribute('data-id');
            let contactElement = document.querySelector(`.contact-item[data-id="${contactId}"]`);
            if (contactElement) {
                let contact = {
                    id: contactElement.getAttribute('data-id'),
                    name: contactElement.getAttribute('data-name'),
                    email: contactElement.getAttribute('data-email'),
                    phone: contactElement.getAttribute('data-phone'),
                    color: contactElement.getAttribute('data-color')
                };
                renderEditContactCard(contact);
                attachCloseListeners();
                openModalEditContact();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let activeContact = null;
    let isMobileView = window.matchMedia("(max-width: 1100px)").matches;

    const contactsDetails = document.querySelector('.contacts-details');
    const contactsList = document.querySelector('.contacts-list');

    // Initial View Check
    handleResponsiveView();

    // Responsive View Handling
    window.addEventListener('resize', handleResponsiveView);

    function handleResponsiveView() {
        isMobileView = window.matchMedia("(max-width: 1100px)").matches;
        if (isMobileView) {
            if (activeContact) {
                showDetails();
            } else {
                showList();
            }
        } else {
            showBoth();
        }
    }

    function showDetails() {
        contactsDetails.style.display = 'block';
        contactsDetails.style.zIndex = '2';
        contactsList.style.display = 'none';
    }

    function showList() {
        contactsDetails.style.display = 'none';
        contactsList.style.display = 'block';
    }

    function showBoth() {
        contactsDetails.style.display = 'block';
        contactsList.style.display = 'block';
    }

    // Event Delegation
    document.body.addEventListener('click', (event) => {
        const target = event.target;

        if (target.closest('.contact-item')) {
            const selectedContact = target.closest('.contact-item');
            setActiveContact(selectedContact);
        }

        if (target.closest('.contacts-back-button') && isMobileView) {
            resetActiveContact();
        }

        if (target.closest('.contacts-card-name-section-mobile')) {
            toggleSection(target.closest('.contacts-card-header'));
        } else {
            // Schließen, wenn außerhalb geklickt wird
            closeVisibleSection(event.target);
        }
    });

    function setActiveContact(contactElement) {
        activeContact = contactElement;
        highlightContact(contactElement);
        isMobileView ? showDetails() : showBoth();
    }

    function resetActiveContact() {
        activeContact = null;
        clearHighlight();
        showList();
    }

    function toggleSection(contactCard) {
        const section2 = contactCard.querySelector('.contacts-card-name-section2');
        const button = contactCard.querySelector('.contacts-card-name-section-mobile');

        if (section2) {
            const isVisible = section2.classList.toggle('visible');
            button.style.backgroundColor = isVisible ? 'rgb(41,171,226)' : 'rgba(42, 54, 71, 1)';
        }
    }

    function highlightContact(contactElement) {
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('contact-item-active');
        });
        contactElement.classList.add('contact-item-active');
    }

    function clearHighlight() {
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('contact-item-active');
        });
    }

    function closeVisibleSection(clickedElement) {
        const visibleSections = document.querySelectorAll('.contacts-card-name-section2.visible');
        visibleSections.forEach((section) => {
            if (!section.contains(clickedElement)) {
                section.classList.remove('visible');
                const button = section.closest('.contacts-card-header').querySelector('.contacts-card-name-section-mobile');
                if (button) {
                    button.style.backgroundColor = 'rgba(42, 54, 71, 1)';
                }
            }
        });
    }
});




// Funktion zum Setzen der Auswahl für eine Kontaktkarte
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
    const deleteButton = event.target.closest('.delete-button');
    if (deleteButton) {
        const contactId = deleteButton.getAttribute('data-id');
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

function createEditContactCard(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);

    let editContactCard = document.createElement("div");
    editContactCard.classList.add("edit-card-content");
    editContactCard.setAttribute("data-id", contact.id);

    editContactCard.innerHTML = generateEditContactCardHTML(contact, initials);

    let saveButton = editContactCard.querySelector(".save-contact-button");
    saveButton.addEventListener("click", () => saveExistingContact(contact.id));

    let deleteButton = editContactCard.querySelector(".delete-contact-button");
    deleteButton.addEventListener("click", () => {
        let contactId = deleteButton.getAttribute("data-id");
        if (contactId) {
            deleteContact(contactId);
            closeModalEditContact();
        }
    });

    return editContactCard;
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
    let nameField = document.getElementById("contact-name");
    let emailField = document.getElementById("contact-email");
    let phoneField = document.getElementById("contact-phone");

    let name = nameField.value.trim();
    let email = emailField.value.trim();
    let phone = phoneField.value.trim();

    if (!name || !email || !phone) {
        showErrorMessage("Please complete all fields.");
        return;
    }

    if (name.split(" ").length < 2) {
        showErrorMessage("Please enter your first and last name.");
        return;
    }

    let newContact = {
        name,
        email,
        phone,
        color: generateRandomColor()
    };

    try {
        const response = await fetch(BASE_URL + "/contacts.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newContact),
        });

        if (response.ok) {
            let result = await response.json();
            newContact.id = result.name;
            closeModalContact();
            loadContacts();

            showContactCreatedOverlay();
            renderContactCard(newContact);

            setTimeout(() => {
                let newContactElement = document.querySelector(`.contact-item[data-id="${newContact.id}"]`);
                if (newContactElement) {
                    ContactSelection(newContactElement);

                    newContactElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 1600);
        }
    } catch (error) {
    }
}

async function deleteContact(contactId, contactsDetails, contactsList, isMobileView) {
    try {
        const response = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
            method: "DELETE",
        });

        if (response.ok) {
            // Wenn im mobilen Modus, Kontakte-Details ausblenden
            if (isMobileView) {
                if (contactsDetails) {
                    contactsDetails.style.display = 'none';  // Blendet die Kontakt-Details aus
                    console.log('111');
                } else {
                    console.log('222');
                }

                // Hier kannst du die Kontaktliste anzeigen, wenn gewünscht
                if (contactsList) {
                    contactsList.style.display = 'block';  // Zeigt die Kontaktliste an
                }
            }

            // Entferne den aktiven Kontakt, falls vorhanden
            let contactCardContainer = document.querySelector(".contacts-card");
            if (contactCardContainer) {
                contactCardContainer.innerHTML = "";
                contactCardContainer.classList.remove("contacts-card-visible");
            }

            // Lade die Kontaktliste neu
            await loadContacts();
        }
    } catch (error) {
        console.error("Fehler beim Löschen des Kontakts:", error);
    }
}


function showContactCreatedOverlay() {

    let parentContainer = document.querySelector(".contacts-details");
    if (isMobileView) {
        // Kontaktdetails werden eingeblendet, wenn die Bildschirmbreite unter 1100px liegt
        parentContainer.style.display = 'block';
        parentContainer.style.zIndex = '2';
        
        // Overlay ebenfalls einblenden
        let overlay = document.createElement("div");
        overlay.className = "contact-created-overlay";
        overlay.textContent = "Contact successfully created";
        parentContainer.appendChild(overlay);

        setTimeout(() => {
            overlay.classList.add("show");
        }, 10);

        setTimeout(() => {
            overlay.classList.remove("show");
            setTimeout(() => {
                overlay.remove();
            }, 600);
        }, 1500);
    } else {
        // Andernfalls zeigen wir nur das Overlay
        let overlay = document.createElement("div");
        overlay.className = "contact-created-overlay";
        overlay.textContent = "Contact successfully created";
        parentContainer.appendChild(overlay);
        
        setTimeout(() => {
            overlay.classList.add("show");
        }, 10);
        
        setTimeout(() => {
            overlay.classList.remove("show");
            setTimeout(() => {
                overlay.remove();
            }, 600);
        }, 1500);
    }
}


async function saveExistingContact(contactId) {
    let nameField = document.getElementById("contact-name2");
    let emailField = document.getElementById("contact-email2");
    let phoneField = document.getElementById("contact-phone2");

    let name = nameField.value.trim();
    let email = emailField.value.trim();
    let phone = phoneField.value.trim();

    if (!name || !email || !phone) {
        showErrorMessage("Please complete all fields.");
        return;
    }

    if (name.split(" ").length < 2) {
        showErrorMessage("Please enter your first and last name.");
        return;
    }

    try {
        const responseGet = await fetch(`${BASE_URL}/contacts/${contactId}.json`);
        if (!responseGet.ok) {
            throw new Error("Failed to fetch existing contact");
        }

        let existingContact = await responseGet.json();

        let updatedContact = {
            id: contactId,
            ...existingContact,
            name,
            email,
            phone
        };
        
        let responsePut = await fetch(`${BASE_URL}/contacts/${contactId}.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedContact),
        });

        if (responsePut.ok) {
            closeModalEditContact();
            loadContacts();
            renderEditedContactCard(updatedContact);

            setTimeout(() => {
                let updatedContactElement = document.querySelector(`.contact-item[data-id="${contactId}"]`);
                if (updatedContactElement) {
                    ContactSelection(updatedContactElement);
                    updatedContactElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 1600);
        } else {
        }
    } catch (error) {
    }
}

function showErrorMessage(message) {
    let errorBox = document.getElementById("error-message-box");
    errorBox.textContent = message;
    errorBox.classList.add("show");

    setTimeout(() => {
        errorBox.classList.remove("show");
    }, 2500);
}

