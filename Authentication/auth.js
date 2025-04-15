document.addEventListener("DOMContentLoaded", () => {
    const bcrypt = dcodeIO.bcrypt;
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const toggleBtn = document.getElementById("toggle-password");
  
    //Load and save users from localStorage
    const loadUsers = () => JSON.parse(localStorage.getItem("users") || "[]");
    const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));
  
    let users = loadUsers();
  
    const validateEmail = (email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
    const checkPasswordStrength = (password) => {
      const length = password.length >= 8;
      const upper = /[A-Z]/.test(password);
      const lower = /[a-z]/.test(password);
      const number = /[0-9]/.test(password);
      const symbol = /[^A-Za-z0-9]/.test(password);
      return length && upper && lower && number && symbol;
    };
  
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const pwdInput =
          document.getElementById("signup-password") ||
          document.getElementById("login-password");
  
        if (pwdInput) {
          const isHidden = pwdInput.getAttribute("type") === "password";
          pwdInput.setAttribute("type", isHidden ? "text" : "password");
          toggleBtn.textContent = isHidden ? "🙈" : "👁️";
        }
      });
    }
  
    //signup logic
    if (signupForm) {
      const emailInput = document.getElementById("signup-email");
      const passwordInput = document.getElementById("signup-password");
      const emailHelp = document.getElementById("emailHelp");
      const passwordHelp = document.getElementById("passwordHelp");
  
      emailInput.addEventListener("input", () => {
        emailHelp.textContent = validateEmail(emailInput.value)
          ? ""
          : "Invalid email format.";
      });
  
      passwordInput.addEventListener("input", () => {
        passwordHelp.textContent = checkPasswordStrength(passwordInput.value)
          ? ""
          : "Password must be 8+ chars with upper, lower, number, and symbol.";
      });
  
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const email = emailInput.value.trim();
        const username = document.getElementById("signup-username").value.trim();
        const password = passwordInput.value;
  
        if (!validateEmail(email)) {
          alert("Please enter a valid email.");
          return;
        }
  
        if (!checkPasswordStrength(password)) {
          alert("Please choose a stronger password.");
          return;
        }
  
        // Check for duplicate email or username
        const emailExists = users.some((u) => u.email === email);
        const usernameExists = users.some((u) => u.username === username);
  
        if (emailExists) {
          alert("Email already in use. Please log in instead.");
          return;
        }
  
        if (usernameExists) {
          alert("Username already taken. Please choose another one.");
          return;
        }
  
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
  
        users.push({ email, username, password: hashedPassword });
        saveUsers(users); // Save updated users
  
        alert("Signed up successfully");
  
        // Save current user and redirect
        localStorage.setItem("loggedInUser", JSON.stringify({ email, username }));
        window.location.href = "../Dashboard/Dashboard.html";
      });
    }
  
    //login logic
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
  
        const identifier = document.getElementById("login-identifier").value.trim();
        const password = document.getElementById("login-password").value;
  
        const user = users.find(
          (u) => u.email === identifier || u.username === identifier
        );
  
        if (!user) {
          alert("User not found");
          return;
        }
  
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          alert("Incorrect password");
          return;
        }
  
        alert("Logged in successfully");
  
        // Save current user and redirect
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "../Dashboard/Dashboard.html";
      });
    }
  });
  