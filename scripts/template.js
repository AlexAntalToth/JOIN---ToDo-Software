

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

