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
