function init() {
    loadData("/contacts");
}

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

function createContactElement(contact, initials) {
    let contactElement = document.createElement("div");
    contactElement.classList.add("contact-item");

    let template = getContactsTemplate(contact, initials);
    contactElement.innerHTML = template;

    let initialsCircle = contactElement.querySelector('.contact-initials-circle');
    if (!initials.trim()) {
        initialsCircle.classList.add('grey');
    }

    contactElement.addEventListener("click", () => {
        ContactSelection(contactElement);
        renderContactCard(contact);
    });
    return contactElement;
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

function createContactCard(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);

    let contactCard = document.createElement("div");
    contactCard.classList.add("contacts-card-content");

    contactCard.innerHTML = `
        <div class="contacts-card-header">
            <div class="contacts-card-initials">
            <div class="contacts-card-initials-circle">
                <span>${initials}</span>
            </div>
            <div class="contacts-card-name-section">
                <h3>${contact.name}</h3>
                <div class="contacts-card-name-section2">
                    <button class="edit-delete-button"> 
                        <img class="contact-edit-icon" src="../../assets/icons/contact_edit.png" alt="Contact Edit">
                        <p>Edit</p>
                    </button>
                    <button class="edit-delete-button"> 
                        <img class="contact-basket-icon" src="../../assets/icons/contact_basket.png" alt="Contact Delete">
                        <p>Delete</p>
                    </button>
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

    return contactCard;
}

function openModalContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content');

    modalContact.style.display = 'flex';
    requestAnimationFrame(() => {
        modalContact.classList.add('show');
        modalContactContent.classList.add('show');
    });
}

function closeModalContact() {
    let modalContact = document.getElementById('myModal-contact');
    let modalContactContent = document.getElementById('myModal-contact-content');
    
    modalContactContent.classList.remove('show');
    modalContactContent.classList.add('hide');

    setTimeout(() => {
        modalContact.classList.remove('show');
        modalContact.style.display = 'none';
        modalContactContent.classList.remove('hide');
    }, 600);
}

let contactsButton = document.querySelector('.contacts-button');
if (contactsButton) {
    contactsButton.addEventListener('click', () => {
        renderAddContactCard();
        attachCloseListeners();
        openModalContact();
    });
}

let closeModalButton = document.querySelector('.close-modal-contact');
if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModalContact);
}

window.onclick = function(event) {
    if (event.target === document.getElementById('myModal-contact')) {
        closeModalContact();
    }
};

function renderAddContactCard(contact) {
    let addContactCardContainer = document.querySelector(".add-contact-card");

    if (!addContactCardContainer) {
        console.error("Container .add-contact-card nicht gefunden!");
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

function createAddContactCard(contact) {
    let { initials } = getInitialsAndFirstLetter(contact);

    let addContactCard = document.createElement("div");
    addContactCard.classList.add("add-card-content");

    addContactCard.innerHTML = `
            <div class="contacts-card-initials">
                <div class="contacts-card-initials-circle">
                    <img class="add-contact-initials_blank" src="../../assets/icons/contact_initials_blank.png"
                    alt="Logo Contact Blank">
                    <span>${initials}</span>
            </div>
            <div class="add-contact-details">
                <button class="close-modal-contact">x</button>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-name" placeholder="Name">
                <img class="add-contact-icon" src="../../assets/icons/contact_name.png"
                alt="Logo Contact Name">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-email" placeholder="Email">
                <img class="add-contact-icon" src="../../assets/icons/contact_email.png"
                alt="Logo Contact Phone">
            </div>
            <div class="add-contact-container">
                <input class="add-contact-field" id="contact-phone" placeholder="Phone">
                <img class="add-contact-icon" src="../../assets/icons/contact_phone.png"
                alt="Logo Contact Phone">
            </div>
            </div>
    `;
    return addContactCard;
}

function attachCloseListeners() {
    document.querySelectorAll('.close-modal-contact').forEach(button => {
        button.addEventListener('click', closeModalContact);
    });
}