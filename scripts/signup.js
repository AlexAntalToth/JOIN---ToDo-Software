const BASE_URL =
  "https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * getContacts - This asynchronous function fetches contact data from a remote Firebase database.
 * It makes a GET request to the base URL, retrieves the response, and parses it into a JSON object.
 * 
 * Example:
 * ```js
 * await getContacts();
 * ```
 */
async function getContacts() {
  let contact = await fetch(BASE_URL + ".json");
  let contactAsJson = await contact.json();
}
/**
 * renderSignup - This function dynamically renders the sign-up form on the web page.
 * It manipulates the DOM by setting the inner HTML of the "wrapDiv" element.
 * It includes various form fields such as name, email, password, confirm password, 
 * and a checkbox for accepting the privacy policy. The form also includes icons and 
 * a navigation link to the login page.
 *
 * Example:
 * ```js
 * renderSignup();
 * ```
 */
function renderSignup() {
  let wrapDiv = document.getElementById("wrapDiv");

  wrapDiv.innerHTML = `
    <img class="join_image" src="assets/img/logo_grey.png" alt="Join img" />
    <div class="signup_div">
      <img onclick="navigateToLogin()" class="arrow-img" src="assets/icons/arrow-left-line.png" alt="">
      <div class="signup_titel">
        <h1>Sign up</h1>
        <div class="separator"></div>
      </div>
      
      <form class="form" onsubmit="if (!validateEmail() || !checkPassword()) return false; addContact(); return false;">
        <div class="inputfields_div">
          <div class="input-wrapper">
            <input class="input1" id="name" required placeholder="Name" type="text" />
            <i class="icon"><img src="assets/icons/person.png" /></i>
          </div>

         <div class="input-wrapper">
    <input
      class="input1"
      id="email"
      required
      placeholder="Email"
      type="email"
    />
    <i class="icon"><img src="assets/icons/mail.png" /></i>
  </div>

         <div class="input-wrapper">
  <input class="input3" id="password" required placeholder="Password" type="password" />
  <i class="icon" onclick="showPassword('password', 'passwordIcon')">
    <img class="lock-icon" id="passwordIcon" src="assets/icons/lock.png" alt="toggle password">
  </i>
</div>

          <div class="input-wrapper">
            <input class="input4" id="confirmPassword" required placeholder="Confirm password" type="password" />
            <i class="icon" onclick="showPassword('confirmPassword', 'confirmPasswordIcon')"><img class="lock-icon" id="confirmPasswordIcon" src="assets/icons/lock.png" alt="toggle password"></i>
          </div>
        </div>

        <div class="checkbox_div">
          <div class="checkbox-wrapper">
            <input id="acceptPolicy" class="checkbox" type="checkbox" />
            <label for="acceptPolicy" class="checkbox-label"></label>
          </div>
          <p>
            I accept the <a class="checkbox_input" href="privacy_policy.html" target="_blank">privacy policy</a>
          </p>
        </div>
        <button class="blue_button1">Sign up</button>
      </form>

      <div class="dataprotection_div">
        <a href="privacy_policy.html" target="_blank">Privacy Policy</a>
        <a href="legal_notice.html" target="_blank">Legal Notice</a>
      </div>`;
}

function validateEmail() {
  let emailInput = document.getElementById("email");
  let email = emailInput.value;
  let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let popupEmail= document.getElementById("popup-valid-email")

  if (!emailPattern.test(email)) {
    showPopupValidEmail(popupEmail);
    emailInput.focus();
    return false;
  }
  return true;
}

function showPopupValidEmail(popupEmail) {
  popupEmail.classList.add("show");
  setTimeout(() => {
    popupEmail.classList.remove("show"); 
  }, 1500); 
}

/**
 * addContact - This function asynchronously adds a new contact (user) to the database by making a POST request.
 * It retrieves the user's name, email, and password from the form fields, then sends this data to the specified URL.
 * After a successful registration, the user is redirected to the index page with a success message.
 *
 * @param {string} [path=""] - The URL path to append to the base URL for the request. Default is an empty string.
 * @param {Object} [data={}] - The data to be sent with the request, although it isn't used in this function directly.
 *
 * @returns {Promise<Object>} - Returns the response data from the POST request after converting it to JSON.
 *
 * Example:
 * ```js
 * addContact("/user", {name: "John Doe", email: "john@example.com", password: "1234"});
 * ```
 */
async function addContact(path = "", data = {}) {
  let name = document.getElementById("name");
  let email = document.getElementById("email");
  let password = document.getElementById("password").value.trim();

  let contact = await fetch(BASE_URL + path + "contacts.json", {
    method: "POST",
    headers: { "content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password,
    }),
  });
  window.location.href = "index.html?";
  return (contactAsJson = await contact.json());
}

/**
 * addCurrentUser - This function asynchronously adds the current user (from the signup form) to the database.
 * It retrieves the user's name and email from the form fields and sends this data to the specified URL.
 *
 * @param {string} [path=""] - The URL path to append to the base URL for the request. Default is an empty string.
 * @param {Object} [data={}] - The data to be sent with the request, although it isn't used in this function directly.
 *
 * @returns {Promise<void>} - This function doesn't return any value, but it performs a POST request to save the current user data.
 *
 * Example:
 * ```js
 * addCurrentUser("/user", {name: "John Doe", email: "john@example.com"});
 * ```
 */
async function addCurrentUser(path = "", data = {}) {

  let name = document.getElementById("name");
  let email = document.getElementById("email");

  let currentUser = await fetch(BASE_URL + path + "currentUser.json", {
    method: "POST",
    headers: { "content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
    }),
  });
}

/**
 * checkPassword - This function validates the password and confirmation password fields during user signup.
 * It checks if the password and confirmation password match, and if the user has accepted the privacy policy.
 * 
 * @returns {boolean} - Returns `true` if the password and confirmation password match, and the user has accepted the privacy policy.
 *                      Returns `false` if there is a mismatch between the passwords or if the privacy policy is not accepted.
 *
 * Example:
 * ```js
 * checkPassword();
 * ```
 */
function checkPassword() {
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  let acceptPolicy = document.getElementById("acceptPolicy").checked;
  let popupMismatch = document.getElementById("popup-mismatch");
  let popupPolicy = document.getElementById("popup-policy");
  if (password !== confirmPassword) {
    showPopup(popupMismatch); 
    return false;
  }
  if (!acceptPolicy) {
    showPopup(popupPolicy); 
    return false;
  }
  return true; 
}

function showPopup(popup) {
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 1500);
}

/**
 * ShowPassword - This function toggles the visibility of the password field when the user clicks on the password visibility icon.
 * It changes the password field's type between "password" (hidden) and "text" (visible), and also swaps the icon between a lock and an eye.
 * 
 * @returns {void} - This function does not return anything. It only modifies the password field and the visibility icon.
 * 
 * Example:
 * ```js
 * ShowPassword();
 * ```
 */
function showPassword(id, iconId) {
  let passwordField = document.getElementById(id);
  let icon = document.getElementById(iconId);

  if (passwordField.type === "password") {
    passwordField.type = "text";
    icon.src = "assets/icons/eye.png";
  } else {
    passwordField.type = "password";
    icon.src = "assets/icons/lock.png";
  }
}

/**
 * navigateToLogin - This function navigates the user to the login page (index.html).
 * It changes the current page's URL to "index.html", effectively redirecting the user to the login page.
 * 
 * @returns {void} - This function does not return anything. It only redirects the user to another page.
 * 
 * Example:
 * ```js
 * navigateToLogin();
 * ```
 */
function navigateToLogin() {
  window.location.href = "index.html";
}
