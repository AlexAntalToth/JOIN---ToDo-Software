let contacts = [
  { name: "alex", email: "email@form.de", password: "testcontact123" },
];

function renderSignup() {
  let wrapDiv = document.getElementById("wrapDiv");

  wrapDiv.innerHTML = `
    <img class="join_image" src="assets/img/logo_grey.png" alt="Join img" />
    <div class="signup_div">
      <img onclick="navigateToLogin()" class="arrow-img" src="assets/icons/arrow-left-line.png" alt="">
      <div class="signup_titel">
        <h1>Sign up</h1>
      </div>
      <div class="separator"></div>
  
      <form onsubmit="addUser();  return false;" >
      <div class="inputfields_div">
        <input class="input1" id="name"  required placeholder="Name" type="name" />
        <input class="input2"  id="email"  required placeholder="Email" type="email" />
        <input class="input3" id="password" required placeholder="Password" type="password" />
        <input class="input4" placeholder="Confirm Password" type="password" />
      </div>
      
      <div class="checkbox_div">
        <input class="checkbox_input" type="checkbox" style="height: 16px; width: 16px; border: 2px solid rgba(42, 54, 71, 1); border-radius: 3px;" />
        <p>
          I accept the <a class="checkbox_input" href="#privacypolicy">privacy policy</a>
        </p>
      </div>
      <button class="blue_button1">Sign up</button>
    </div>
    </form>

    <div class="dataprotection_div">
      <a href="">Privacy Policy</a>
      <a href="">Legal Notice</a>
    </div>`;
}

console.log(contacts);

function addUser() {
  let name = document.getElementById('name');
  let email = document.getElementById('email');
  let password = document.getElementById('password');

  contacts.push({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  window.location.href = 'index.html?msg=Die Registrierung war erfolgreich';

}

function navigateToLogin() {
  window.location.href = 'index.html';
}


