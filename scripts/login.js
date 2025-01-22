/**
 * renderLogin - This function renders the login page, displaying the login form and buttons for signing up or logging in as a guest.
 *
 * 1. Sets the HTML content of the `wrapDiv` element.
 * 2. Adds a login form with fields for email and password, along with buttons for logging in or guest login.
 * 3. Adds a logo image wrapped in an animation container.
 * 4. Calls `startAnimation()` to start animations (implementation of `startAnimation` is assumed to be elsewhere).
 *
 * Example:
 * ```js
 * renderLogin();
 * ```
 */
function renderLogin() {
  let wrapDivRef = document.getElementById("wrapDiv");

  wrapDivRef.innerHTML = `
  
   <div id="wrapDiv">
  <div class="animation-wrapper">
    <img id="joinImage" class="join_image" <img src="assets/img/logo_grey.png" alt="join_img">
  </div>

  <div class="signup_div">
    <p>Not a Join user?</p>
    <button onclick="navigateToSignup()" class="blue_button1">Sign up</button>
  </div>

  <div class="content">
    <div class="login_div">
      <div class="login">
        <h1>Log in</h1>
        <div class="separator"></div>
      </div>


<form class="form" onsubmit="login(); return false;">
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
  <input
    class="input2"
    id="password"
    required
    placeholder="Password"
    type="password"
  />
  <i class="icon" id="togglePassword" onclick="showPassword()">
  <img class="lock-icon" src="assets/icons/lock.png" alt="hide password">
</i>
</div>

  <div class="login_guestlogin">
    <button class="blue_button2">Log in</button>
    <button type="button" onclick="guestLogin()" class="white_button">Guest Log in</button>
  </div>
</form>
   </div>
  `;

  startAnimation();
}

/**
 * startAnimation - This function handles the animation of the logo image and reveals the content of the page after the animation ends.
 *
 * 1. Adds the `move-to-position` class to the `joinImage` element, which triggers its animation (presumably to move it to a specific position).
 * 2. Once the animation ends, it waits for 200 milliseconds and then adds the `visible` class to the `.content` element, making it visible.
 *
 * Example:
 * ```js
 * startAnimation();
 * ```
 */
function startAnimation() {
  let joinImage = document.getElementById("joinImage");
  let content = document.querySelector(".content");

  joinImage.classList.add("move-to-position");

  joinImage.addEventListener("animationend", () => {
    setTimeout(() => {
      if (content) {
        content.classList.add("visible");
      }
    }, 100);
  });
}

function validateEmail() {
  let emailInput = document.getElementById("email");
  let email = emailInput.value;
  let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let popupEmail = document.getElementById("popup-valid-email")

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
 * guestLogin - This function allows a guest user to log in by setting the current user's name to "guest" in the backend and then redirects to a different page.
 *
 * 1. Makes an asynchronous HTTP PUT request to update the current user data with the name "guest".
 * 2. After the request is completed, the page is redirected to `summary.html`.
 *
 * @param {string} [path=""] - The base path to the API endpoint (optional).
 * @param {Object} [data={}] - Additional data to be sent in the request (optional).
 * 
 * Example:
 * ```js
 * guestLogin();
 * ```
 */
async function guestLogin(path = "", data = {}) {

  await fetch(BASE_URL + path + "currentUser.json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "guest",
    }),
  });
  window.location.href = "summary.html";
}

/**
 * login - This function handles the login process by verifying the user's credentials (email and password) and then processes the login if the credentials are valid.
 * 
 * 1. Sends a GET request to the backend to fetch all contacts.
 * 2. Searches for the contact that matches the entered email and password.
 * 3. If a match is found, it calls the `processLogin` function to handle the login.
 * 4. If an error occurs during the process, it shows an alert message.
 * 
 * @throws {Error} If there is an issue with the fetch request or any other operation, an error alert is shown.
 * 
 * Example:
 * ```js
 * login();
 * ```
 */
async function login() {
  try {
    let contact = await fetch(BASE_URL + ".json");
    let contactAsJson = await contact.json();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let signedUpContact = Object.values(contactAsJson.contacts || {}).find(
      (c) => c.email === email && c.password === password
    );
    await processLogin(signedUpContact);
  } catch (error) {
    alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
  }
}

/**
 * Processes the login for a signed-up contact. If the login is successful, displays a success popup, 
 * updates the user data, and redirects to the summary page. If the login fails, shows an alert.
 * 
 * @param {Object} signedUpContact - The contact object containing the details of the signed-up user.
 * @param {string} signedUpContact.name - The name of the signed-up user.
 * @returns {void}
 */
async function processLogin(signedUpContact) {
  if (signedUpContact) {
    let popup = document.getElementById('task-created-popup');
    popup.classList.add('show');
    setTimeout(() => {
      popup.classList.remove('show');
      putData('currentUser', { name: signedUpContact.name })
      window.location.href = "summary.html";
    }, 1500);
  } else {
    let popup = document.getElementById('task-created-popup2');
    popup.classList.add('show');
    setTimeout(() => {
      popup.classList.remove('show');
    }, 1500);
  }
}

/**
 * ShowPassword - This function toggles the visibility of the password field.
 * It switches the input type of the password field between "password" (hidden text) and "text" (visible text).
 * Additionally, it changes the icon to represent the current state of the password visibility (eye for visible, lock for hidden).
 * 
 * The function is triggered by clicking the icon to show or hide the password.
 * 
 * Example:
 * ```js
 * ShowPassword();
 * ```
 */
function showPassword() {
  let passwordField = document.getElementById("password");
  let icon = document.querySelector("#togglePassword img");

  if (passwordField.type === "password") {
    passwordField.type = "text";
    icon.src = "assets/icons/eye.png";
    icon.alt = "show password";
  } else {
    passwordField.type = "password";
    icon.src = "assets/icons/lock.png";
    icon.alt = "hide password";
  }
}

/**
 * navigateToSignup - This function redirects the user to the "signup.html" page.
 * It changes the current page URL to the signup page, effectively navigating the user to the sign-up form.
 * 
 * Example:
 * ```js
 * navigateToSignup();
 * ```
 */
function navigateToSignup() {
  window.location.href = "signup.html";
}


