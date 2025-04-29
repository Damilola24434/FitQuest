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
          const res = await fetch("http://127.0.0.1:8000/routes/feedback.php", {
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
        const res = await fetch("http://127.0.0.1:8000/routes/feedback.php", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
  
        const data = await res.json();
  
        if (res.ok) {
          feedbackList.innerHTML = ""; // Clear existing list
  
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
  
    //  Fetch feedback when page loads
    getFeedback();
  });
  