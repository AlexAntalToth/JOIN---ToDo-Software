
function renderLogin() {
  let wrapDivRef = document.getElementById("wrapDiv");



  wrapDivRef.innerHTML = `
   <div id="wrapDiv">
  <div class="animation-wrapper">
    <img id="joinImage" class="join_image" src="imgs/Capa 2 (1).png" alt="Join img" />
  </div>

  <div class="signup_div">
    <p>Not a Join user?</p>
    <button onclick="navigateToSignup()" class="blue_button1">Sign up</button>
  </div>

  <div class="content ">
    <div class="login_div">
      <div class="login">
        <h1>Log in</h1>
        <div class="separator"></div>
      </div>

      <div class="email_password">
        <input class="input1" placeholder="Email" type="text" />
        <input class="input2" placeholder="Password" type="password" />
      </div>

      <div class="login_guestlogin">
        <button class="blue_button2">Log in</button>
        <button class="white_button">Guest Log in</button>
      </div>
    </div>
    <div class="dataprotection_div">
      <a href="">Privacy Policy</a>
      <a href="">Legal Notice</a>
    </div>
  </div>
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



function navigateToSignup() {
  window.location.href = "signup.html";
}
