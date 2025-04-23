// Mobile menu toggle functionality
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNavLinks = document.getElementById("mobileNavLinks");

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

// Logout functionality for both desktop and mobile buttons
const logout = async () => {
  try {
    const res = await fetch("http://127.0.0.1:8000/routes/auth.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ type: "logout" }),
    });

    const data = await res.json();
    alert(data.message || "Logged out");
    window.location.href = "../Authentication/Login.html"; // redirect to login
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

const logoutBtn = document.getElementById("logout-btn");
const mobileLogoutBtn = document.getElementById("mobile-logout-btn");

if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", logout);
