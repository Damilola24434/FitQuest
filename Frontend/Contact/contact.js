document.addEventListener("DOMContentLoaded", () => {
    const feedbackForm = document.getElementById("feedback-form");
  
    // Submit feedback logic
    if (feedbackForm) {
      feedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        // Get form input values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const comment = document.getElementById("comment").value.trim();
  
        // Make sure all fields are filled
        if (!name || !email || !comment) {
          alert("All fields are required.");
          return;
        }
  
        try {
          // Send feedback data to the server using POST
          const res = await fetch("http://127.0.0.1:8000/routes/submit-feedback.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, email, comment }),
          });
  
          const data = await res.json();
          alert(data.message);
  
          // Optionally, clear the form after submission
          if (res.ok) {
            feedbackForm.reset();
          }
        } catch (err) {
          console.error("Feedback submission failed:", err);
          alert("Failed to submit feedback. Please try again.");
        }
      });
    }
  
    // Retrieve and display feedback logic (GET request)
    async function getFeedback() {
      try {
        const res = await fetch("http://127.0.0.1:8000/routes/get-feedback.php", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
  
        const data = await res.json();
  
        if (res.ok) {
          // Assuming the response data is an array of feedbacks
          const feedbackList = document.getElementById("feedback-list");
          feedbackList.innerHTML = "";  // Clear existing feedbacks
  
          data.forEach(feedback => {
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
  
    // Fetch feedback on page load
    getFeedback();
  });
  