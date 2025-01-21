/**
 * Initializes the contact management application once the DOM content is fully loaded.
 * 
 * This function sets up the application by defining necessary variables and event listeners.
 * It handles the responsiveness of the view and adjusts the layout based on window size.
 * 
 * @event DOMContentLoaded
 * @listens document
 * 
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', () => {
    let activeContact = null;
    let isMobileView = window.matchMedia("(max-width: 1100px)").matches;
    let contactsDetails = document.querySelector('.contacts-details');
    let contactsList = document.querySelector('.contacts-list');
    handleResponsiveView();
    window.addEventListener('resize', handleResponsiveView);


    /**
    * Adjusts the view layout based on the screen size to ensure proper display on both mobile and desktop views.
    * 
    * This function checks if the current view is mobile by comparing the window's width to a predefined breakpoint (1100px).
    * It then decides whether to show the contact list, the contact details, or both based on the screen size and if there is an active contact.
    * 
    * @returns {void}
    */
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


    /**
    * Displays the contact details view and hides the contact list on mobile devices.
    * 
    * This function is called when a contact is selected on mobile view to display the contact's detailed information
    * while hiding the list of contacts. It ensures that the details section is visible with a higher stacking context 
    * (using z-index), and the contact list is hidden.
    * 
    * @returns {void}
    */
    function showDetails() {
        contactsDetails.style.display = 'block';
        contactsDetails.style.zIndex = '2';
        contactsList.style.display = 'none';
    }


    /**
    * Displays the contacts list and hides the contact details view on mobile devices.
    * 
    * This function is called when the user wants to see the list of contacts on mobile view.
    * It hides the contact details section and makes the contacts list visible.
    * 
    * @returns {void}
    */    
    function showList() {
        contactsDetails.style.display = 'none';
        contactsList.style.display = 'block';
    }


    /**
    * Displays both the contacts details and contacts list views.
    * 
    * This function is called when the application is in desktop view and both the
    * contact details and contacts list need to be shown at the same time.
    * 
    * @returns {void}
    */
    function showBoth() {
        contactsDetails.style.display = 'block';
        contactsList.style.display = 'block';
    }


    /**
    * Event listener for click events on the body element.
    * 
    * This function handles different interactions with the contact list and contact
    * details on both mobile and desktop views. It sets an active contact when a contact
    * item is clicked, resets the active contact when the back button is clicked in mobile
    * view, and handles toggling or closing sections of the contact card.
    * 
    * @param {Event} event - The click event triggered on the body element.
    * 
    * @returns {void}
    */
    document.body.addEventListener('click', (event) => {
        let target = event.target;
        if (target.closest('.contact-item')) {
            let selectedContact = target.closest('.contact-item');
            setActiveContact(selectedContact);
        }
        if (target.closest('.contacts-back-button') && isMobileView) {
            resetActiveContact();
        }
        if (target.closest('.contacts-card-name-section-mobile')) {
            toggleSection(target.closest('.contacts-card-header'));
        } else {
            closeVisibleSection(event.target);
        }
    });


    /**
    * Sets the selected contact as the active contact and highlights it.
    * 
    * This function marks the specified contact element as active by storing it in
    * the `activeContact` variable. It also highlights the contact and adjusts the
    * layout based on the current view (mobile or desktop).
    * 
    * @param {Element} contactElement - The DOM element representing the contact to be set as active.
    * 
    * @returns {void}
    */    
    function setActiveContact(contactElement) {
        activeContact = contactElement;
        highlightContact(contactElement);
        if (isMobileView) {
            showDetails();
        } else {
            showBoth();
        }
    }


    /**
    * Sets the `setActiveContact` function to the global `window` object, making it accessible globally.
    * 
    * This allows the `setActiveContact` function to be used anywhere in the application via `window.setActiveContact`.
    * 
    * @function
    */
    window.setActiveContact = setActiveContact;


    /**
    * Resets the active contact and clears any highlights.
    * 
    * This function sets the `activeContact` to `null`, removes any contact item highlight, 
    * and ensures that the contact list is displayed (in mobile view).
    * 
    * @function
    */
    function resetActiveContact() {
        activeContact = null;
        clearHighlight();
        showList();
    }


    /**
    * Toggles the visibility of a contact card section and updates the button's background color.
    * 
    * This function toggles the visibility of the section with the class `contacts-card-name-section2` 
    * inside the given `contactCard`. It also updates the background color of the 
    * `contacts-card-name-section-mobile` button based on whether the section is visible or not.
    * 
    * @param {HTMLElement} contactCard - The contact card element that contains the section to toggle.
    * @function
    */
    function toggleSection(contactCard) {
        let section2 = contactCard.querySelector('.contacts-card-name-section2');
        let button = contactCard.querySelector('.contacts-card-name-section-mobile');
        if (section2) {
            let isVisible = section2.classList.toggle('visible');
            button.style.backgroundColor = isVisible ? 'rgb(41,171,226)' : 'rgba(42, 54, 71, 1)';
        }
    }


    /**
    * Highlights the selected contact element by adding the 'contact-item-active' class.
    * 
    * This function removes the 'contact-item-active' class from all other contact items 
    * and then adds it to the provided `contactElement`, visually indicating that it is the active contact.
    * 
    * @param {HTMLElement} contactElement - The contact item element to be highlighted.
    * @function
    */
    function highlightContact(contactElement) {
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('contact-item-active');
        });
        contactElement.classList.add('contact-item-active');
    }


    /**
    * Clears the highlight from all contact items by removing the 'contact-item-active' class.
    * 
    * This function removes the 'contact-item-active' class from all elements with the class 'contact-item',
    * effectively clearing any active state or highlighting from previously selected contacts.
    * 
    * @function
    */
    function clearHighlight() {
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('contact-item-active');
        });
    }


    /**
    * Closes visible sections that are not clicked, by removing the 'visible' class.
    * 
    * This function checks all currently visible sections (identified by the 'visible' class) and 
    * closes those that are not the clicked element by removing the 'visible' class. It also resets 
    * the background color of the section toggle button to its default color.
    * 
    * @param {Element} clickedElement - The element that was clicked to potentially leave its section open.
    * 
    * @function
    */
    function closeVisibleSection(clickedElement) {
        let visibleSections = document.querySelectorAll('.contacts-card-name-section2.visible');
        visibleSections.forEach((section) => {
            if (!section.contains(clickedElement)) {
                section.classList.remove('visible');
                let button = section.closest('.contacts-card-header').querySelector('.contacts-card-name-section-mobile');
                if (button) {
                    button.style.backgroundColor = 'rgba(42, 54, 71, 1)';
                }
            }
        });
    }
});
