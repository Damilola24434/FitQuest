/**
 * FITQUEST WORKOUT MODULE
 * Main JavaScript controller for workout functionality
 * Handles exercise fetching, display, search, and daily workout features
 */

/* ================ GLOBAL CONSTANTS ================ */
// Supported muscle groups/categories from API
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

// Exercises to exclude from display (weird names or duplicates)
const excludedExercises = [
  "barbell pullover to press", // Combination movement not properly categorized
];

// Cache settings (24 hour expiration)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/* ================ GLOBAL VARIABLES ================ */
let allExercisesCache = {}; // Stores all exercises by category
let currentCategory = "back"; // Default starting category
let searchTimeout = null; // For search debouncing
let lastClickedCard = null; // Tracks last clicked exercise card

/* ================ CACHE MANAGEMENT ================ */
/**
 * Retrieves cached data from localStorage
 * @param {string} key - Cache key to retrieve
 * @returns {object|null} Cached data or null if expired/missing
 */
function getCachedData(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key); // Clean up expired cache
      return null;
    }

    return data;
  } catch (e) {
    console.warn("Cache read failed:", e);
    return null;
  }
}

/**
 * Stores data in cache with timestamp
 * @param {string} key - Cache key to store under
 * @param {object} data - Data to cache
 */
function setCachedData(key, data) {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn("Cache write failed:", e);
  }
}

/* ================ DAILY WORKOUT FEATURE ================ */
/**
 * Generates consistent daily seed based on current date
 * Also formats and displays the current date
 * @returns {number} Hash value for daily exercise selection
 */
function getDailySeed() {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  // Format and display date
  document.getElementById("daily-date").textContent = today.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Simple hash algorithm for consistent daily selection
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Loads and displays the daily featured exercise
 * Uses cache when available for better performance
 */
async function loadDailyExercise() {
  const container = document.getElementById("daily-exercise-container");
  const seed = getDailySeed();

  try {
    // Check cache first before API calls
    const cached = getCachedData("allExercises");
    if (cached) {
      allExercisesCache = cached;
      selectAndDisplayDailyExercise();
      return;
    }

    // Fetch all exercises if cache is empty
    if (Object.keys(allExercisesCache).length === 0) {
      await fetchAllExercises(true); // Silent background fetch
    }

    selectAndDisplayDailyExercise();
  } catch (error) {
    // User-friendly error display
    container.innerHTML = `
      <article class="error-daily">
        <p>Failed to load today's exercise. The server might be busy.</p>
        <p>Try refreshing the page or check back later.</p>
        <small>Technical details: ${error.message}</small>
      </article>
    `;
    console.error("Daily exercise error:", error);
  }

  /**
   * Selects and displays the daily exercise from cached data
   */
  function selectAndDisplayDailyExercise() {
    const allExercises = Object.values(allExercisesCache).flat();
    if (allExercises.length === 0) {
      throw new Error("No exercises in database");
    }

    // Deterministic selection based on daily seed
    const dailyIndex = Math.abs(seed) % allExercises.length;
    const dailyExercise = allExercises[dailyIndex];
    displayDailyExercise(dailyExercise);
  }
}

/**
 * Displays the daily exercise in the UI
 * @param {object} exercise - Exercise object to display
 */
function displayDailyExercise(exercise) {
  const container = document.getElementById("daily-exercise-container");

  // Format instructions as numbered list
  const formattedInstructions =
    exercise.instructions?.length > 0
      ? exercise.instructions.map((step) => `<li>${step}</li>`).join("")
      : "<li>No instructions available</li>";

  // Build exercise card HTML
  container.innerHTML = `
    <article class="daily-exercise">
      <header class="daily-exercise-header">
        <h3 class="daily-exercise-name">${exercise.name}</h3>
        <span class="daily-exercise-category">${
          exercise.bodyPart || exercise.target
        }</span>
      </header>
      <section class="daily-exercise-content">
        <figure>
          <img src="${exercise.gifUrl}" alt="${
    exercise.name
  }" class="daily-exercise-gif" loading="lazy">
        </figure>
        <div class="daily-exercise-details">
          <dl class="daily-exercise-info">
            <dt><i class="fas fa-dumbbell"></i> Equipment:</dt>
            <dd>${exercise.equipment || "None"}</dd>
            
            <dt><i class="fas fa-bullseye"></i> Target:</dt>
            <dd>${exercise.target}</dd>
           
          </dl>
          <section class="daily-exercise-instructions">
            <h4><i class="fas fa-list-ol"></i> Instructions:</h4>
            <ol>${formattedInstructions}</ol>
          </section>
        </div>
      </section>
    </article>
  `;
}

/* ================ SEARCH FUNCTIONALITY ================ */
/**
 * Handles search input with debouncing
 * Triggers search after 500ms of inactivity
 */
function handleSearchInput() {
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.querySelector(".clear-search");

  // Toggle clear button visibility
  clearBtn.style.display = searchInput.value ? "block" : "none";

  // Debounce search to avoid excessive requests
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (searchInput.value.length >= 2) {
      searchExercises();
    } else if (searchInput.value.length === 0) {
      fetchExercises(currentCategory); // Reset to current category
    }
  }, 500);
}

/**
 * Clears search input and resets display
 */
function clearSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  document.querySelector(".clear-search").style.display = "none";
  fetchExercises(currentCategory);
}

/**
 * Searches exercises across all categories
 * Uses cached data when available
 */
async function searchExercises() {
  const searchTerm = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  const container = document.getElementById("exerciseContainer");

  // Minimum search term length
  if (searchTerm.length < 2) return;

  try {
    container.innerHTML = '<p class="loading">Searching exercises...</p>';

    // Check cache first
    const cached = getCachedData("allExercises");
    if (cached) {
      allExercisesCache = cached;
      performSearch();
      return;
    }

    // Fetch all exercises if cache is empty
    if (Object.keys(allExercisesCache).length === 0) {
      await fetchAllExercises(true);
    }

    performSearch();
  } catch (error) {
    container.innerHTML = `
      <article class="error">
        <p>Search failed. Try checking your connection.</p>
        <details>
          <summary>Technical details</summary>
          ${error.message}
        </details>
      </article>`;
  }

  /**
   * Performs the actual search through cached exercises
   */
  function performSearch() {
    const searchResults = [];

    // Search through all categories
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

    // Display results
    if (searchResults.length > 0) {
      container.innerHTML = `<h2 class="category-title">Search Results (${searchResults.length})</h2>`;
      displayExercises(searchResults, "search");
    } else {
      container.innerHTML = `
        <article class="no-results">
          <p>No exercises found for "${searchTerm}"</p>
          <p>Try different keywords or browse categories.</p>
        </article>`;
    }
  }
}

/* ================ EXERCISE DATA FETCHING ================ */
/**
 * Fetches exercises for a specific body part
 * @param {string} bodyPart - Muscle group/category to fetch
 * @param {boolean} silent - If true, suppresses loading UI
 * @returns {Promise<Array>} Array of exercise objects
 */
async function fetchExercises(bodyPart, silent = false) {
  currentCategory = bodyPart;
  const container = document.getElementById("exerciseContainer");
  if (!silent) {
    container.innerHTML = `<p class="loading">Loading ${bodyPart} exercises...</p>`;
  }

  // Check cache first
  const cached = getCachedData(`exercises_${bodyPart}`);
  if (cached) {
    if (!silent) displayExercises(cached, bodyPart);
    allExercisesCache[bodyPart] = cached;
    return cached;
  }

  try {
    const response = await fetch(
      "https://exercise-db-fitness-workout-gym.p.rapidapi.com/list/equipment",
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "exercise-db-fitness-workout-gym.p.rapidapi.com",
          "x-rapidapi-key": "bf0f3e566emsh6d09063f944ef97p1ae6cbjsnfb6426966f16",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    let exercises = await response.json();

    // Filter out excluded exercises
    exercises = exercises.filter(
      (exercise) =>
        !excludedExercises.some((excluded) =>
          exercise.name.toLowerCase().includes(excluded.toLowerCase())
        )
    );

    // Cache results
    setCachedData(`exercises_${bodyPart}`, exercises);
    allExercisesCache[bodyPart] = exercises;

    if (!silent) displayExercises(exercises, bodyPart);
    return exercises;
  } catch (error) {
    if (!silent) {
      container.innerHTML = `
        <article class="error">
          <h3>Oops! Couldn't load ${bodyPart} exercises</h3>
          <p>${error.message}</p>
          <section class="solutions">
            <h4>Try these fixes:</h4>
            <ol>
              <li>Check your <a href="https://rapidapi.com/developer/dashboard" target="_blank">RapidAPI subscription</a></li>
              <li>Refresh the page</li>
              <li>Try a different muscle group</li>
            </ol>
          </section>
        </article>`;
    }
    console.error(`Error fetching ${bodyPart} exercises:`, error);
    throw error;
  }
}

/**
 * Fetches all exercises across all categories
 * @param {boolean} silent - If true, suppresses loading UI
 * @returns {Promise<object>} Object with exercises by category
 */
async function fetchAllExercises(silent = false) {
  const container = document.getElementById("exerciseContainer");
  if (!silent) {
    container.innerHTML = '<p class="loading">Loading all exercises...</p>';
  }

  // Check full cache
  const cached = getCachedData("allExercises");
  if (cached) {
    allExercisesCache = cached;
    if (!silent) {
      container.innerHTML = "";
      Object.entries(cached).forEach(([category, exercises]) => {
        displayExercises(exercises, category);
      });
    }
    return cached;
  }

  try {
    // Fetch all categories in parallel
    const results = await Promise.all(
      allCategories.map((category) =>
        fetchExercises(category, true).catch(() => {
          console.warn(`Failed to load ${category} exercises`);
          return [];
        })
      )
    );

    // Build complete cache
    const newCache = {};
    results.forEach((exercises) => {
      if (exercises.length > 0) {
        const category = exercises[0].bodyPart.toLowerCase();
        newCache[category] = exercises;
      }
    });

    // Cache everything
    setCachedData("allExercises", newCache);
    allExercisesCache = newCache;

    if (!silent) {
      container.innerHTML = "";
      Object.entries(newCache).forEach(([category, exercises]) => {
        displayExercises(exercises, category);
      });
    }

    return newCache;
  } catch (error) {
    if (!silent) {
      container.innerHTML = `
        <article class="error">
          <p>Failed to load all exercises. Try selecting individual categories instead.</p>
          <p>Error: ${error.message}</p>
        </article>`;
    }
    console.error("Error loading all exercises:", error);
    throw error;
  }
}

/* ================ UI DISPLAY FUNCTIONS ================ */
/**
 * Displays exercises in a grid layout
 * @param {Array} exercises - Array of exercise objects
 * @param {string} category - Current category or 'search' for search results
 */
function displayExercises(exercises, category) {
  const container = document.getElementById("exerciseContainer");
  const searchInput = document.getElementById("searchInput");

  // Don't overwrite search results with category content
  if (category !== "search" && searchInput.value.length >= 2) return;

  // Clear only if we're not doing search
  if (category !== "search" && container.querySelector(".category-title")) {
    container.innerHTML = "";
  }

  // Add category heading
  if (category !== "search") {
    const categoryTitle = document.createElement("h2");
    categoryTitle.className = "category-title";
    categoryTitle.textContent = `${
      category.charAt(0).toUpperCase() + category.slice(1)
    } Exercises (${exercises.length})`;
    container.appendChild(categoryTitle);
  }

  // Create exercise grid
  const grid = document.createElement("div");
  grid.className = "exercise-grid";

  exercises.forEach((exercise) => {
    const card = document.createElement("article");
    card.className = "exercise-card";

    // Format instructions
    const formattedInstructions =
      exercise.instructions?.length > 0
        ? exercise.instructions.map((step) => `<li>${step}</li>`).join("")
        : "<li>No instructions available</li>";

    // Build card content
    card.innerHTML = `
      <figure class="gif-container">
        <img src="${exercise.gifUrl}" alt="${exercise.name}" loading="lazy">
        <figcaption class="watermark-cover">${exercise.name}</figcaption>
      </figure>
      <section class="exercise-content">
        <div class="exercise-details">
          <div class="exercise-details-content">
            <dl>
              <dt>Equipment:</dt>
              <dd>${exercise.equipment || "None"}</dd>
              
              <dt>Target:</dt>
              <dd>${exercise.target}</dd>
              
              ${
                exercise.secondaryMuscles?.length > 0
                  ? `<dt>Secondary Muscles:</dt>
                     <dd>${exercise.secondaryMuscles.join(", ")}</dd>`
                  : ""
              }
              
              ${
                category === "search"
                  ? `<dt>Category:</dt>
                     <dd>${exercise.originalCategory || category}</dd>`
                  : ""
              }
            </dl>
            <section>
              <h3>Instructions:</h3>
              <ol class="instructions-list">
                ${formattedInstructions}
              </ol>
            </section>
          </div>
        </div>
      </section>
    `;

    // Toggle details on click
    const watermarkCover = card.querySelector(".watermark-cover");
    const exerciseDetails = card.querySelector(".exercise-details");

    card.addEventListener("click", function (e) {
      if (e.target === watermarkCover) return;

      // Close other open cards
      document
        .querySelectorAll(".exercise-details.expanded")
        .forEach((details) => {
          if (details !== exerciseDetails) details.classList.remove("expanded");
        });

      exerciseDetails.classList.toggle("expanded");
    });

    watermarkCover.addEventListener("click", function (e) {
      e.stopPropagation();
      document
        .querySelectorAll(".exercise-details.expanded")
        .forEach((details) => {
          if (details !== exerciseDetails) details.classList.remove("expanded");
        });
      exerciseDetails.classList.toggle("expanded");
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

/* ================ INITIALIZATION ================ */
/**
 * Initializes the application when page loads
 */
window.onload = function () {
  // Start with back exercises
  fetchExercises("back");

  // Load today's exercise
  loadDailyExercise();

  // Set up midnight refresh for daily exercise
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight - now;

  setTimeout(() => {
    loadDailyExercise();
    // Refresh daily at midnight
    setInterval(loadDailyExercise, 86400000);
  }, msUntilMidnight);
};

/* ================ UI INTERACTIONS ================ */
// Scroll to top button behavior
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Show/hide scroll button based on scroll position
window.onscroll = function () {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
};

// Smooth scroll to top
scrollToTopBtn.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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

// Automatically highlight current page in navbar
const currentPage = window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-link").forEach((link) => {
  const linkPage = link.getAttribute("href")?.split("/").pop();

  if (linkPage === currentPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

// Make scroll function available globally
window.scrollToWorkoutPlanner = function () {
  const plannerSection = document.getElementById("workout-planner");
  if (plannerSection) {
    plannerSection.scrollIntoView({ behavior: "smooth" });
  }
};
