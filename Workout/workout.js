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

// These are all the exercise categories we'll be working with
const allCategories = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
];

// Some exercises just don't play nice - we'll exclude these
const excludedExercises = ["barbell pullover to press"];

// Cache for all exercises so we don't keep hitting the API
let allExercisesCache = {};
let currentCategory = "back"; // Start with back exercises by default
let searchTimeout = null; // For debouncing our search
let lastClickedCard = null; // Track which card was last clicked

// Handle when someone types in the search box
function handleSearchInput() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.querySelector(".clear-search");

  // Show/hide the clear button based on whether there's text
  clearBtn.style.display = searchInput.value ? "block" : "none";

  // Wait a bit before searching to avoid too many requests
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchExercises();
  }, 300); // 300ms delay
}

// Clear out the search and show the current category again
function clearSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  document.querySelector(".clear-search").style.display = "none";
  fetchExercises(currentCategory); // Go back to showing the current category
}

// Actually perform the exercise search
async function searchExercises() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const container = document.getElementById("exerciseContainer");

  // Don't search for very short terms
  if (searchTerm.length < 2) {
    if (searchTerm.length === 0) {
      fetchExercises(currentCategory);
    }
    return;
  }

  try {
    container.innerHTML = '<div class="loading">Searching exercises...</div>';

    // If we haven't loaded exercises yet, load them all
    if (Object.keys(allExercisesCache).length === 0) {
      const promises = allCategories.map((category) =>
        fetch(
          `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${category}?limit=50`,
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key":
                " ba6fe04c2dmsh14c528abbc864c4p113585jsnb66b4e94a12f",
              "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
            },
          }
        ).then((response) => {
          if (!response.ok) throw new Error(`Failed to fetch ${category}`);
          return response.json().then((exercises) => ({
            category,
            exercises: exercises.filter(
              (exercise) =>
                !excludedExercises.some((excluded) =>
                  exercise.name.toLowerCase().includes(excluded.toLowerCase())
                )
            ),
          }));
        })
      );

      const results = await Promise.all(promises);
      results.forEach((group) => {
        allExercisesCache[group.category] = group.exercises;
      });
    }

    // Search through all exercises for matches
    const searchResults = [];
    Object.entries(allExercisesCache).forEach(([category, exercises]) => {
      exercises.forEach((exercise) => {
        if (exercise.name.toLowerCase().includes(searchTerm)) {
          searchResults.push({
            ...exercise,
            originalCategory: category,
          });
        }
      });
    });

    // Show results if we found any
    if (searchResults.length > 0) {
      container.innerHTML = `<h2 class="category-title">Search Results (${searchResults.length})</h2>`;
      displayExercises(searchResults, "search");
    } else {
      container.innerHTML = `<div class="error">
        No exercises found matching "${searchTerm}"
      </div>`;
    }
  } catch (error) {
    container.innerHTML = `<div class="error">
      Error during search: ${error.message}
    </div>`;
  }
}

// Fetch exercises for a specific body part
async function fetchExercises(bodyPart) {
  currentCategory = bodyPart;
  const container = document.getElementById("exerciseContainer");
  container.innerHTML =
    '<div class="loading">Loading ' + bodyPart + " exercises...</div>";

  try {
    const response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=50`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key":
            " ba6fe04c2dmsh14c528abbc864c4p113585jsnb66b4e94a12f",
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    if (!response.ok)
      throw new Error(
        `Failed to fetch ${bodyPart} exercises: ${response.status}`
      );

    let exercises = await response.json();

    // Filter out any excluded exercises
    exercises = exercises.filter(
      (exercise) =>
        !excludedExercises.some((excluded) =>
          exercise.name.toLowerCase().includes(excluded.toLowerCase())
        )
    );

    // Display what we found
    displayExercises(exercises, bodyPart);
  } catch (error) {
    // Show a helpful error message with solutions
    container.innerHTML = `<div class="error">
      Error loading ${bodyPart} exercises: ${error.message}<br><br>
      <strong>Possible solutions:</strong>
      <ol>
        <li>Check your <a href="https://rapidapi.com/developer/dashboard" target="_blank">RapidAPI subscription</a></li>
        <li>Refresh the page and try again</li>
        <li>Try a different category</li>
      </ol>
    </div>`;
  }
}

// Fetch all exercises at once - used for search and daily workout
async function fetchAllExercises() {
  const container = document.getElementById("exerciseContainer");
  container.innerHTML =
    '<div class="loading">Loading all exercises... This may take a moment</div>';

  try {
    let allExercises = [];

    // Fetch each category in parallel
    const promises = allCategories.map((category) =>
      fetch(
        `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${category}?limit=30`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key":
              " ba6fe04c2dmsh14c528abbc864c4p113585jsnb66b4e94a12f",
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
          },
        }
      ).then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch ${category}`);
        return response.json().then((exercises) => ({
          category,
          exercises: exercises.filter(
            (exercise) =>
              !excludedExercises.some((excluded) =>
                exercise.name.toLowerCase().includes(excluded.toLowerCase())
              )
          ),
        }));
      })
    );

    const results = await Promise.all(promises);
    allExercises = results.filter((result) => result.exercises.length > 0);

    container.innerHTML = "";
    // Display each category's exercises
    allExercises.forEach((group) => {
      displayExercises(group.exercises, group.category);
    });

    // Cache all the exercises for later
    allExercises.forEach((group) => {
      allExercisesCache[group.category] = group.exercises;
    });
  } catch (error) {
    container.innerHTML = `<div class="error">
      Error loading all exercises: ${error.message}<br><br>
      Try selecting individual categories instead
    </div>`;
  }
}

// Display exercises in a nice grid layout
function displayExercises(exercises, category) {
  const container = document.getElementById("exerciseContainer");
  const searchInput = document.getElementById("searchInput");

  // If we're not doing a search and there's a search term, bail out
  if (category !== "search" && searchInput.value.length >= 2) {
    return;
  }

  // Clear out any existing category titles if we're not searching
  if (category !== "search" && container.querySelector(".category-title")) {
    container.innerHTML = "";
  }

  // Add a title for this category
  if (category !== "search") {
    const categoryTitle = document.createElement("h2");
    categoryTitle.className = "category-title";
    categoryTitle.textContent = `${
      category.charAt(0).toUpperCase() + category.slice(1)
    } Exercises (${exercises.length})`;
    container.appendChild(categoryTitle);
  }

  // Create the grid container
  const grid = document.createElement("div");
  grid.className = "exercise-grid";

  // Add each exercise as a card
  exercises.forEach((exercise) => {
    const card = document.createElement("div");
    card.className = "exercise-card";

    // Format instructions if available
    const formattedInstructions =
      exercise.instructions && exercise.instructions.length > 0
        ? exercise.instructions
            .map((step, index) => `<li>${step}</li>`)
            .join("")
        : "<li>No instructions available</li>";

    // Build the card HTML
    card.innerHTML = `
      <div class="gif-container">
        <img src="${exercise.gifUrl}" alt="${exercise.name}" loading="lazy">
        <div class="gif-overlay"></div>
        <div class="watermark-cover">${exercise.name}</div>
      </div>
      <div class="exercise-content">
        <div class="exercise-details">
          <div class="exercise-details-content">
            <div class="exercise-info"><strong>Equipment:</strong> ${
              exercise.equipment || "None"
            }</div>
            <div class="exercise-info"><strong>Target:</strong> ${
              exercise.target
            }</div>
            ${
              exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0
                ? `<div class="exercise-info"><strong>Secondary Muscles:</strong> ${exercise.secondaryMuscles.join(
                    ", "
                  )}</div>`
                : ""
            }
            ${
              category === "search"
                ? `<div class="exercise-info"><strong>Category:</strong> ${
                    exercise.originalCategory || category
                  }</div>`
                : ""
            }
            <div class="exercise-info"><strong>Instructions:</strong></div>
            <ol class="instructions-list">
                ${formattedInstructions}
            </ol>
          </div>
        </div>
      </div>
    `;

    const watermarkCover = card.querySelector(".watermark-cover");
    const exerciseDetails = card.querySelector(".exercise-details");

    // Click handler for the card
    card.addEventListener("click", function (e) {
      // Don't interfere with watermark clicks
      if (e.target === watermarkCover) return;

      // Close any other open details
      document
        .querySelectorAll(".exercise-details.expanded")
        .forEach((details) => {
          if (details !== exerciseDetails) {
            details.classList.remove("expanded");
          }
        });

      // Toggle this one
      exerciseDetails.classList.toggle("expanded");
    });

    // Special click handler for the watermark
    watermarkCover.addEventListener("click", function (e) {
      e.stopPropagation(); // Don't let the card click handler fire

      // Close others
      document
        .querySelectorAll(".exercise-details.expanded")
        .forEach((details) => {
          if (details !== exerciseDetails) {
            details.classList.remove("expanded");
          }
        });

      // Toggle this one
      exerciseDetails.classList.toggle("expanded");
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// When the page loads, do these things
window.onload = function () {
  // Start with back exercises
  fetchExercises("back");

  // Load today's special workout
  loadDailyExercise();

  // Set up a timer to refresh the daily workout at midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight - now;

  setTimeout(() => {
    loadDailyExercise();
    // Then keep refreshing every 24 hours
    setInterval(loadDailyExercise, 86400000);
  }, msUntilMidnight);
};
