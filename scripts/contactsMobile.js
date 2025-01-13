document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialisierung der App
function initializeApp() {
    let activeContact = null;
    let isMobileView = checkMobileView();
    let contactsDetails = document.querySelector('.contacts-details');
    let contactsList = document.querySelector('.contacts-list');

    setupInitialView(activeContact, isMobileView, contactsDetails, contactsList);
    setupEventListeners(activeContact, contactsDetails, contactsList);
}

// Überprüfen, ob die Ansicht mobil ist
function checkMobileView() {
    return window.matchMedia("(max-width: 1100px)").matches;
}

// Einrichtung der initialen Ansicht
function setupInitialView(activeContact, isMobileView, contactsDetails, contactsList) {
    handleResponsiveView(activeContact, isMobileView, contactsDetails, contactsList);
}

// Event-Listener einrichten
function setupEventListeners(activeContact, contactsDetails, contactsList) {
    window.addEventListener('resize', () => 
        handleResponsiveView(activeContact, checkMobileView(), contactsDetails, contactsList)
    );

    document.body.addEventListener('click', (event) =>
        handleBodyClick(event, activeContact, contactsDetails, contactsList)
    );
}

// Responsive View behandeln
function handleResponsiveView(activeContact, isMobileView, contactsDetails, contactsList) {
    if (isMobileView) {
        if (activeContact) {
            showDetails(contactsDetails, contactsList);
        } else {
            showList(contactsDetails, contactsList);
        }
    } else {
        showBoth(contactsDetails, contactsList);
    }
}

// Anzeigeoptionen
function showDetails(contactsDetails, contactsList) {
    if (!contactsDetails || !contactsList) {
        console.error("contactsDetails oder contactsList ist undefined:", { contactsDetails, contactsList });
        return;
    }
    contactsDetails.style.display = 'block';
    contactsDetails.style.zIndex = '2';
    contactsList.style.display = 'none';
}

function showList(contactsDetails, contactsList) {
    contactsDetails.style.display = 'none';
    contactsList.style.display = 'block';
}

function showBoth(contactsDetails, contactsList) {
    contactsDetails.style.display = 'block';
    contactsList.style.display = 'block';
}

// Verarbeitung von Klick-Ereignissen
function handleBodyClick(event, activeContact, contactsDetails, contactsList) {
    let target = event.target;

    if (target.closest('.contact-item')) {
        setActiveContact(target.closest('.contact-item'), contactsDetails, contactsList);
    } else if (target.closest('.contacts-back-button') && checkMobileView()) {
        resetActiveContact(contactsDetails, contactsList);
    } else if (target.closest('.contacts-card-name-section-mobile')) {
        toggleSection(target.closest('.contacts-card-header'));
    } else {
        closeVisibleSection(target);
    }
}

// Aktiven Kontakt setzen
function setActiveContact(contactElement, contactsDetails, contactsList) {
    highlightContact(contactElement);
    if (checkMobileView()) {
        showDetails(contactsDetails, contactsList);
    } else {
        showBoth(contactsDetails, contactsList);
    }
}

// Aktiven Kontakt zurücksetzen
function resetActiveContact(contactsDetails, contactsList) {
    clearHighlight();
    showList(contactsDetails, contactsList);
}

// Kontakt hervorheben
function highlightContact(contactElement) {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
    contactElement.classList.add('contact-item-active');
}

// Hervorhebung entfernen
function clearHighlight() {
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('contact-item-active');
    });
}

// Abschnitt umschalten
function toggleSection(contactCard) {
    let section2 = contactCard.querySelector('.contacts-card-name-section2');
    let button = contactCard.querySelector('.contacts-card-name-section-mobile');
    if (section2) {
        let isVisible = section2.classList.toggle('visible');
        button.style.backgroundColor = isVisible ? 'rgb(41,171,226)' : 'rgba(42, 54, 71, 1)';
    }
}

// Sichtbare Abschnitte schließen
function closeVisibleSection(clickedElement) {
    let visibleSections = document.querySelectorAll('.contacts-card-name-section2.visible');
    visibleSections.forEach(section => {
        if (!section.contains(clickedElement)) {
            section.classList.remove('visible');
            let button = section.closest('.contacts-card-header')
                .querySelector('.contacts-card-name-section-mobile');
            if (button) {
                button.style.backgroundColor = 'rgba(42, 54, 71, 1)';
            }
        }
    });
}
