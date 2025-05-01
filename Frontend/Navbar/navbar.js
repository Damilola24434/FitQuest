// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle functionality
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNavLinks = document.getElementById("mobileNavLinks");
  
  // Logout functionality
  const logout = async () => {
      try {
          const res = await fetch("https://fitquest-backend-3pdn.onrender.com/routes/auth.php", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({ type: "logout" }),
          });

          const data = await res.json();
          alert(data.message || "Logged out successfully");
          // Use relative path from root to ensure it works from any page
          window.location.href = "/Authentication/Login.html";
      } catch (err) {
          console.error("Logout failed:", err);
          alert("Logout failed. Please try again.");
      }
  };

  // Attach event listeners to both logout buttons
  const logoutBtn = document.getElementById("logout-btn");
  const mobileLogoutBtn = document.getElementById("mobile-logout-btn");

  if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
  }
  if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener("click", logout);
  }

  // Mobile menu toggle
  if (mobileMenuBtn && mobileNavLinks) {
      mobileMenuBtn.addEventListener("click", () => {
          mobileNavLinks.classList.toggle("open");
          mobileMenuBtn.innerHTML = mobileNavLinks.classList.contains("open")
              ? '<i class="fas fa-times"></i>'
              : '<i class="fas fa-bars"></i>';
      });

      // Close mobile menu when a link is clicked
      document.querySelectorAll(".mobile-nav .nav-link").forEach((link) => {
          link.addEventListener("click", () => {
              mobileNavLinks.classList.remove("open");
              mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
          });
      });
  }

  // Scroll to workout planner function
  function scrollToWorkoutPlanner() {
      const plannerSection = document.getElementById("workout-planner");
      if (plannerSection) {
          plannerSection.scrollIntoView({ behavior: "smooth" });
      }
  }

  // Automatically highlight the current page in navbar
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach((link) => {
      const linkPage = link.getAttribute("href")?.split("/").pop();
      if (linkPage === currentPage) {
          link.classList.add("active");
      } else {
          link.classList.remove("active");
      }
  });

  // Make function available globally
  window.scrollToWorkoutPlanner = scrollToWorkoutPlanner;
});