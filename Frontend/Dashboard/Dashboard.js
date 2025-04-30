// Track progress
// Stores the user's daily fitness goals (target values)
let dailyGoals = {
  workouts: 0,    // Target number of workouts
  calories: 0     // Target calories to burn
};

// Tracks today's progress (actual values)
let todayProgress = {
  workouts: 0,    // Completed workouts count
  calories: 0     // Calories burned so far
};

// DOM Elements - Cache frequently accessed elements
const setGoalsBtn = document.getElementById('setGoalsBtn');          // "Start Tracking" button
const addWorkoutBtn = document.getElementById('addWorkoutBtn');      // "Add Workout" button
const addCaloriesBtn = document.getElementById('addCaloriesBtn');    // "Add Calories" button
const progressDisplay = document.querySelector('.progress-tracker'); // Progress tracker section
const caloriesCard = document.querySelector('.card:nth-child(2)');   // Calories card element

// Set daily goals when "Start Tracking" button is clicked
setGoalsBtn.addEventListener('click', function(e) {
  e.preventDefault(); // Prevent form submission/page refresh
  
  // Get user input values
  const workoutGoal = parseInt(document.getElementById('workoutGoal').value);
  const calorieGoal = parseInt(document.getElementById('calorieGoal').value);
  
  // Validate inputs
  if (workoutGoal && calorieGoal) {
    // Store goals
    dailyGoals.workouts = workoutGoal;
    dailyGoals.calories = calorieGoal;
    
    // Update displayed goal values
    document.getElementById('workoutsGoal').textContent = workoutGoal;
    document.getElementById('caloriesGoal').textContent = calorieGoal;
    
    // Show the progress tracking section
    progressDisplay.style.display = 'block';
    
    // Reset previous progress (if any)
    todayProgress = { workouts: 0, calories: 0 };
    updateProgress(); // Update the UI
  } else {
    // Show error if inputs are invalid
    alert('Please enter valid goals for both fields');
  }
});

// Add workout when "Add Workout" button is clicked
addWorkoutBtn.addEventListener('click', function() {
  todayProgress.workouts++; // Increment workout count
  updateProgress();         // Update progress bars and counters
  checkCompletion();        // Check if goals are completed
});

// Add calories when "Add Calories" button is clicked
addCaloriesBtn.addEventListener('click', function() {
  const caloriesInput = document.getElementById('addCalories');
  const calories = parseInt(caloriesInput.value);
  
  // Validate input
  if (calories && calories > 0) {
    todayProgress.calories += calories; // Add to total calories
    caloriesInput.value = '';           // Clear input field
    updateProgress();                   // Update progress bars
    checkCompletion();                  // Check goal completion
  } else {
    // Show error for invalid input
    alert('Please enter a positive number for calories burned');
    caloriesInput.focus(); // Return focus to input field
  }
});

// Updates progress bars and counters
function updateProgress() {
  // Calculate workout progress percentage (capped at 100%)
  const workoutPercent = Math.min(100, (todayProgress.workouts / dailyGoals.workouts) * 100);
  
  // Update workout progress bar width
  document.getElementById('workoutProgress').style.width = `${workoutPercent}%`;
  
  // Update workout counter text (shows current/target)
  document.getElementById('workoutsCount').textContent = 
    `${todayProgress.workouts}/${dailyGoals.workouts}` +
    // Add "+X" if exceeded goal
    (todayProgress.workouts > dailyGoals.workouts ? ` (+${todayProgress.workouts - dailyGoals.workouts})` : '');

  // Calculate calorie progress percentage (capped at 100%)
  const caloriePercent = Math.min(100, (todayProgress.calories / dailyGoals.calories) * 100);
  
  // Update calorie progress bar width
  document.getElementById('calorieProgress').style.width = `${caloriePercent}%`;
  
  // Update calorie counter text (shows current/target)
  document.getElementById('caloriesCount').textContent = 
    `${todayProgress.calories}/${dailyGoals.calories}` +
    // Add "+X" if exceeded goal
    (todayProgress.calories > dailyGoals.calories ? ` (+${todayProgress.calories - dailyGoals.calories})` : '');
}

// Checks if goals are completed and updates result message
function checkCompletion() {
  const resultMessage = document.getElementById('resultMessage');
  let message = "";
  
  // Calculate how much goals were exceeded (if any)
  const exceededWorkouts = todayProgress.workouts - dailyGoals.workouts;
  const exceededCalories = todayProgress.calories - dailyGoals.calories;

  // Check if both goals are completed
  if (todayProgress.workouts >= dailyGoals.workouts && todayProgress.calories >= dailyGoals.calories) {
    message = "🎉 All goals completed!";
    
    // Check if goals were exceeded
    if (exceededWorkouts > 0 || exceededCalories > 0) {
      message += " You exceeded your goals by:";
      if (exceededWorkouts > 0) {
        message += ` ${exceededWorkouts} workout${exceededWorkouts > 1 ? 's' : ''}`;
      }
      if (exceededCalories > 0) {
        message += `${exceededWorkouts > 0 ? ' and' : ''} ${exceededCalories} calories`;
      }
      message += "!";
    } else {
      message += " Perfect achievement!";
    }

    // Apply success styling
    resultMessage.className = "result-message success";
  } else {
    // Calculate remaining goals if not completed
    const workoutsLeft = dailyGoals.workouts - todayProgress.workouts;
    const caloriesLeft = dailyGoals.calories - todayProgress.calories;

    // Create appropriate encouragement message
    if (workoutsLeft > 0 && caloriesLeft > 0) {
      message = `You're doing great! 💪 You need ${workoutsLeft} more workout${workoutsLeft > 1 ? 's' : ''} and ${caloriesLeft} more calories burned to hit today's goals.`;
    } else if (workoutsLeft > 0) {
      message = `You're almost there! Just ${workoutsLeft} more workout${workoutsLeft > 1 ? 's' : ''} to go! 🏋️‍♀️`;
    } else if (caloriesLeft > 0) {
      message = `🔥 Almost there! Burn ${caloriesLeft} more calories to reach your target.`;
    }

    // Apply default styling
    resultMessage.className = "result-message";
  }

  // Update the message text
  resultMessage.textContent = message;
}

// Calories popup functionality - shows when clicking calories image
document.getElementById('caloriesImage').addEventListener('click', function() {
  const popup = document.getElementById('caloriesPopup');
  const caloriesText = document.getElementById('caloriesText');
  
  // Update popup text with current calories
  caloriesText.textContent = `You've burned ${todayProgress.calories} calories today! 🔥`;
  
  // Show popup
  popup.style.display = 'block';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
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
