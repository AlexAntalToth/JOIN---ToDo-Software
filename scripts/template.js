

function getContactsTemplate(contact, initials) {
    return `
        <div class="contact-header">
            <div class="contact-initials-circle">
                <span>${initials}</span>
            </div>
            <h3>${contact.name}</h3>
        </div>
        <p>${contact.email}</p>
    `;
}

