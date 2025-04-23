document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  fetch("http://127.0.0.1:8000/routes/check-session.php", {
    method: "GET",
    credentials: "include",
    headers: {
        "Content-Type": "application/json"
    }
  })
  .then(res => {
      if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
  })
  .then(data => {
      if (data.loggedIn) {
          window.location.href = "../Dashboard/Dashboard.html";
      }
  })
  .catch(err => console.error("Session check failed:", err));

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const toggleBtn = document.getElementById("toggle-password");

  // Toggle password visibility
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

  // Sign up logic
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("signup-email").value.trim();
      const username = document.getElementById("signup-username").value.trim();
      const password = document.getElementById("signup-password").value;

      try {
        const res = await fetch("http://127.0.0.1:8000/routes/auth.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ type: "register", email, username, password }),
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) {
          window.location.href = "../Dashboard/Dashboard.html";
        }
      } catch (err) {
        console.error("Signup failed:", err);
      }
    });
  }

  // Login logic
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("login-identifier").value.trim();
      const password = document.getElementById("login-password").value;

      try {
        const res = await fetch("http://127.0.0.1:8000/routes/auth.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ type: "login", identifier, password }),
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) {
          window.location.href = "../Dashboard/Dashboard.html";
        }
      } catch (err) {
        console.error("Login failed:", err);
      }
    });
  }
});
