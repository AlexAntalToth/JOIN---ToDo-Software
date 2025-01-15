const BASE_URL =
  "https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

function renderLogin() {
  let wrapDivRef = document.getElementById("wrapDiv");

  wrapDivRef.innerHTML = `
   
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
  <div class="input-icon">
    <div class="input-wrapper">
  <input
    class="input1"
    id="email"
    required
    placeholder="Email"
    type="email"
  />
  <i class="icon mail"></i> 
</div>

<div class="input-wrapper">
  <input
    class="input2"
    id="password"
    required
    placeholder="Password"
    type="password"
  />
  <i class="icon lock" id="togglePassword" onclick="ShowPassword()"></i>
</div>

  <div class="login_guestlogin">
    <button class="blue_button2">Log in</button>
    <button onclick="guestLogin()" class="white_button">Guest Log in</button>
  </div>
</form>
    <div id="msgBox"></div>
  `;

  startAnimation();
}

function startAnimation() {
  let joinImage = document.getElementById("joinImage");
  let content = document.querySelector(".content");

  joinImage.classList.add("move-to-position");

  joinImage.addEventListener("animationend", () => {
    setTimeout(() => {
      if (content) {
        content.classList.add("visible");
      }
    }, 200);
  });
}

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

async function processLogin(signedUpContact) { 

  if (signedUpContact) {
    alert("Login erfolgreich! Willkommen, " + signedUpContact.name);
      await fetch(BASE_URL + "contacts.json", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signedUpContact.email,
          password: signedUpContact.password,
          name: signedUpContact.name,
        }),
      });
      window.location.href = "summary.html";
  } else {
    alert("Login fehlgeschlagen. Bitte überprüfe deine Eingaben.");
  }
}

function ShowPassword() {
  let passwordField = document.getElementById("password");
  let togglePasswordIcon = document.getElementById("togglePassword");

  if (passwordField.type === "password") {
    passwordField.type = "text"; 
    togglePasswordIcon.classList.remove("lock"); 
    togglePasswordIcon.classList.add("eye"); 
  } else {
    passwordField.type = "password"; 
    togglePasswordIcon.classList.remove("eye"); 
    togglePasswordIcon.classList.add("lock"); 
  }
}

let msgBox = document.getElementById("msgBox");
let urlParams = new URLSearchParams(window.location.search);
let msg = urlParams.get("msg");
if (msg) {
  msgBox.innerHTML = msg;
} else {
  msgBox.style.display = "none";
}

function navigateToSignup() {
  window.location.href = "signup.html";
}


