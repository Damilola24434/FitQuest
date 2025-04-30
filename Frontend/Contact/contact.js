document.addEventListener("DOMContentLoaded", () => {
  const feedbackForm = document.getElementById("feedback-form");
  const feedbackList = document.getElementById("feedback-list");

  // Submit feedback logic
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const comment = document.getElementById("comment").value.trim();

      if (!name || !email || !comment) {
        alert("All fields are required.");
        return;
      }

      try {
        const res = await fetch("https://fitquest-backend-3pdn.onrender.com/routes/feedback.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, email, comment }),
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
          feedbackForm.reset();
          getFeedback(); // Refresh feedback list after successful submission
        }
      } catch (err) {
        console.error("Feedback submission failed:", err);
        alert("Failed to submit feedback. Please try again.");
      }
    });
  }

  // Fetch feedbacks from server
  async function getFeedback() {
    try {
      const res = await fetch("https://fitquest-backend-3pdn.onrender.com/routes/feedback.php", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        feedbackList.innerHTML = ""; // Clear existing list

        data.forEach((feedback) => {
          const feedbackItem = document.createElement("li");
          feedbackItem.textContent = `${feedback.name}: ${feedback.comment}`;
          feedbackList.appendChild(feedbackItem);
        });
      } else {
        console.error("Failed to fetch feedback:", data.error);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  }

  //  Fetch feedback when page loads
  getFeedback();
});

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

// Function to handle the feedback form submission
