// First things first - let's load up that navbar from our components
fetch("../Navbar/navbar.html")
  .then((response) => response.text())
  .then((html) => {
    // Pop the navbar HTML into our container
    document.getElementById("navbar-container").innerHTML = html;

    // Now that the HTML is loaded, let's grab the navbar JS too
    const script = document.createElement("script");
    script.src = "../Navbar/navbar.js";
    document.body.appendChild(script);
  });
  
// Track progress
let dailyGoals = {
  workouts: 0,
  calories: 0
};

let todayProgress = {
  workouts: 0,
  calories: 0
};

// DOM Elements
const setGoalsBtn = document.getElementById('setGoalsBtn');
const addWorkoutBtn = document.getElementById('addWorkoutBtn');
const addCaloriesBtn = document.getElementById('addCaloriesBtn');
const progressDisplay = document.querySelector('.progress-display');

// Set daily goals
setGoalsBtn.addEventListener('click', function() {
  const workoutGoal = parseInt(document.getElementById('workoutGoal').value);
  const calorieGoal = parseInt(document.getElementById('calorieGoal').value);
  
  if (workoutGoal && calorieGoal) {
    dailyGoals.workouts = workoutGoal;
    dailyGoals.calories = calorieGoal;
    
    // Update display
    document.getElementById('workoutsGoal').textContent = workoutGoal;
    document.getElementById('caloriesGoal').textContent = calorieGoal;
    
    // Show progress section
    progressDisplay.style.display = 'block';
    
    // Reset any previous progress
    todayProgress = { workouts: 0, calories: 0 };
    updateProgress();
  } else {
    alert('Please enter valid goals for both fields');
  }
});

// Add workout
addWorkoutBtn.addEventListener('click', function() {
  todayProgress.workouts++;
  updateProgress();
  checkCompletion();
});

// Add calories
addCaloriesBtn.addEventListener('click', function() {
  const calories = parseInt(document.getElementById('addCalories').value);
  if (calories && calories > 0) {
    todayProgress.calories += calories;
    document.getElementById('addCalories').value = '';
    updateProgress();
    checkCompletion();
  }
});

// Update progress display
function updateProgress() {
  // Workouts
  const workoutPercent = Math.min(100, (todayProgress.workouts / dailyGoals.workouts) * 100);
  document.getElementById('workoutProgress').style.width = `${workoutPercent}%`;
  document.getElementById('workoutsCount').textContent = `${todayProgress.workouts}/${dailyGoals.workouts}`;
  
  // Calories
  const caloriePercent = Math.min(100, (todayProgress.calories / dailyGoals.calories) * 100);
  document.getElementById('calorieProgress').style.width = `${caloriePercent}%`;
  document.getElementById('caloriesCount').textContent = `${todayProgress.calories}/${dailyGoals.calories}`;
}

// Check if all goals are completed
function checkCompletion() {
  const resultMessage = document.getElementById('resultMessage');
  let message = "";
  const exceededWorkouts = todayProgress.workouts - dailyGoals.workouts;
  const exceededCalories = todayProgress.calories - dailyGoals.calories;

  if (todayProgress.workouts >= dailyGoals.workouts && todayProgress.calories >= dailyGoals.calories) {
    message = "🎉 All goals completed!";
    
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

    resultMessage.className = "result-message success";

    // Visual indication of exceeded goals
    if (exceededWorkouts > 0) {
      document.querySelector('.workout-fill').style.backgroundColor = '#7cb342'; // Light green
    }
    if (exceededCalories > 0) {
      document.querySelector('.calorie-fill').style.backgroundColor = '#d84315'; // Deep orange
    }

  } else {
    // Give helpful insight if goals are not yet met
    const workoutsLeft = dailyGoals.workouts - todayProgress.workouts;
    const caloriesLeft = dailyGoals.calories - todayProgress.calories;

    if (workoutsLeft > 0 && caloriesLeft > 0) {
      message = `You're doing great! 💪 You need ${workoutsLeft} more workout${workoutsLeft > 1 ? 's' : ''} and ${caloriesLeft} more calories burned to hit today's goals. Keep going! 🔥`;
    } else if (workoutsLeft > 0) {
      message = `You're almost there! Just ${workoutsLeft} more workout${workoutsLeft > 1 ? 's' : ''} to go! 🏋️‍♀️`;
    } else if (caloriesLeft > 0) {
      message = `🔥 Almost there! Burn ${caloriesLeft} more calories to reach your target.`;
    }

    resultMessage.className = "result-message";
    document.querySelector('.workout-fill').style.backgroundColor = '#9CAF88';
    document.querySelector('.calorie-fill').style.backgroundColor = '#705D5C';
  }

  resultMessage.textContent = message;
}
