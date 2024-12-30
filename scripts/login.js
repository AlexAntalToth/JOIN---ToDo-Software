const BASE_URL =
  "https://join-56225-default-rtdb.europe-west1.firebasedatabase.app/";

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

    <form onsubmit="login(); return false;">

       <div class="email_password">
      <input class="input1" id="email"   required placeholder="Email" type="email"/>
      <input class="input2" id="password" required placeholder="Password" type="password"/>
      </div>

      <div class="login_guestlogin">
        <button class="blue_button2">Log in</button>
        <button onclick="guestLogin()" class="white_button">Guest Log in</button>
      </div>
    </div>
    </form>

    <div class="dataprotection_div">
      <a href="privacy_policy.html">Privacy Policy</a>
      <a href="legal_notice.html">Legal Notice</a>
    </div>
  </div>
    <div id="msgBox"></div>
</div>
  `;

  startAnimation();
}

function startAnimation() {
  const joinImage = document.getElementById("joinImage");
  const content = document.querySelector(".content");

  joinImage.classList.add("move-to-position");

  joinImage.addEventListener("animationend", () => {
    setTimeout(() => {
      if (content) {
        content.classList.add("visible");
      }
    }, 200);
  });
}

function guestLogin() {
  window.location.href="summary.html";
}

async function login() {

  let contact = await fetch(BASE_URL + ".json");
  let contactAsJson = await contact.json();
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let signedUpContact = Object.values(contactAsJson.contacts || {}).find(
      (c) => c.email === email && c.password === password
    );

  console.log(signedUpContact);
  if (signedUpContact) {
    console.log("User gefunden:", signedUpContact.name);
    alert("Login erfolgreich! Willkommen, " + signedUpContact.name)
    window.location.href = "summary.html";
  } else {
    console.log("Benutzer nicht gefunden");
      alert("Login fehlgeschlagen. Bitte überprüfe deine Eingaben.")
  }
}

const msgBox = document.getElementById("msgBox");
const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get("msg");
if (msg) {
  msgBox.innerHTML = msg;
} else {
  msgBox.style.display = "none";
}

function navigateToSignup() {
  window.location.href = "signup.html";
}
