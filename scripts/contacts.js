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
    contactElement.innerHTML = getContactsTemplate(contact, initials);
    contactElement.addEventListener("click", () => renderContactCard(contact));
    return contactElement;
}

function renderContactCard(contact) {
    let contactCardContainer = document.querySelector(".contacts-card");
    contactCardContainer.innerHTML = "";
    let contactCard = createContactCard(contact);
    contactCardContainer.appendChild(contactCard);
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
