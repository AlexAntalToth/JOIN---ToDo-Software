const BASE_URL =
  "https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

async function getContacts() {
  let contact = await fetch(BASE_URL + ".json");
  let contactAsJson = await contact.json();
}

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
      
   <form class="form" onsubmit="if (!checkPassword()) return false; addContact(); addCurrentUser(); return false;">
  <div class="inputfields_div">

    <div class="input-wrapper">
      <input class="input1" id="name" required placeholder="Name" type="name" />
      <i class="icon"><img src="assets/icons/person.png" /></i>
    </div>

   <div class="input-wrapper">
      <input class="input2" id="email" required placeholder="Email" type="email" />
      <i class="icon"><img src="assets/icons/mail.png" /></i>
    </div>

    <div class="input-wrapper">
      <input class="input3" id="password" required placeholder="Password" type="Password" />
      <i class="icon"><img src="assets/icons/lock.png" /></i>
    </div>
    
    <div class="input-wrapper">
      <input class="input4" id="confirmPassword" required placeholder="Confirm password" type="password" />
      <i class="icon"><img src="assets/icons/mail.png" /></i>
    </div>
  </div>

  <div class="checkbox_div">
  
    <input
      id="acceptPolicy"
      class="checkbox"
      type="checkbox"
    />
    
    <p>
      I accept the <a class="checkbox_input" href="pirvacy_policy.html">privacy policy</a>
    </p>
  </div>
  <button class="blue_button1">Sign up</button>
</form>

    <div class="dataprotection_div">
      <a href="privacy_policy.html">Privacy Policy</a>
      <a href="legal_notice.html">Legal Notice</a>
    </div>`;
}

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
  window.location.href = "index.html?msg=Die Registrierung war erfolgreich";
  return (contactAsJson = await contact.json());
}

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

function checkPassword() {
  let password = document.getElementById("password").value.trim();
  let confirmPassword = document.getElementById("confirmPassword").value.trim();
  let acceptPolicy = document.getElementById("acceptPolicy").checked;

  if (password !== confirmPassword) {
    alert("Die Passwörter stimmen nicht überein.");
    return false;
  }

  if (!acceptPolicy) {
    alert("Bitte akzeptiere die Datenschutzrichtlinie.");
    return false;
  }
  return true;
}



function navigateToLogin() {
  window.location.href = "index.html";
}
