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
      <div class="inputfields_div">
        <input class="input1" placeholder="Name" type="text" />
        <input class="input2" placeholder="Email" type="text" />
        <input class="input3" placeholder="Password" type="password" />
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
    <div class="dataprotection_div">
      <a href="">Privacy Policy</a>
      <a href="">Legal Notice</a>
    </div>`;
}

function navigateToLogin() {
  window.location.href = "index.html";
}

window.onload = renderSignup;
