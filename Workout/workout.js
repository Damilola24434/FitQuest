// Configuration
const CONFIG = {
  API_KEY: "cc571f4ee2msh483e94de6e08a2bp1f7335jsnfc6dcf4027be",
  API_HOST: "exercisedb.p.rapidapi.com",
  RATE_LIMIT_MS: 1000, // 1 second between requests
  MAX_RETRIES: 3,
  MAX_CONCURRENT_REQUESTS: 3,
  DEFAULT_CATEGORY: "back",
  EXCLUDED_EXERCISES: ["barbell pullover to press"],
};

// State management
const state = {
  exercisesCache: {},
  currentCategory: CONFIG.DEFAULT_CATEGORY,
  searchTimeout: null,
  lastRequestTime: 0,
  pendingRequests: 0,
};

// DOM Elements
const dom = {
  container: null,
  searchInput: null,
  clearBtn: null,
  navbarContainer: null,
};

// Initialize the application
function init() {
  cacheDOM();
  setupEventListeners();
  loadNavbar()
    .then(() => fetchExercises(state.currentCategory))
    .catch((error) => {
      console.error("Initialization error:", error);
      showError(dom.container, "Failed to initialize application");
    });
}

// Cache DOM elements
function cacheDOM() {
  dom.container = document.getElementById("exerciseContainer");
  dom.searchInput = document.getElementById("searchInput");
  dom.clearBtn = document.querySelector(".clear-search");
  dom.navbarContainer = document.getElementById("navbar-container");
}

// Setup event listeners
function setupEventListeners() {
  if (dom.searchInput) {
    dom.searchInput.addEventListener("input", handleSearchInput);
  }
  if (dom.clearBtn) {
    dom.clearBtn.addEventListener("click", clearSearch);
  }

  // Scroll to top button
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", scrollToTop);
    window.addEventListener("scroll", () => {
      scrollToTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
  }
}

// Load navbar
async function loadNavbar() {
  try {
    const response = await fetch("../Navbar/navbar.html");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const html = await response.text();
    dom.navbarContainer.innerHTML = html;

    // Load navbar scripts
    const script = document.createElement("script");
    script.src = "../Navbar/navbar.js";
    document.body.appendChild(script);
  } catch (error) {
    console.error("Failed to load navbar:", error);
    dom.navbarContainer.innerHTML = `<div class="error">Navigation failed to load</div>`;
    throw error;
  }
}

// Rate-limited fetch
async function rateLimitedFetch(url, options) {
  const now = Date.now();
  const elapsed = now - state.lastRequestTime;
  const delay = Math.max(0, CONFIG.RATE_LIMIT_MS - elapsed);

  if (delay > 0 && state.pendingRequests >= CONFIG.MAX_CONCURRENT_REQUESTS) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  state.pendingRequests++;
  state.lastRequestTime = now;

  try {
    const response = await fetch(url, options);

    if (response.headers.has("X-RateLimit-Remaining")) {
      const remaining = parseInt(response.headers.get("X-RateLimit-Remaining"));
      if (remaining < 5) console.warn(`Low rate limit remaining: ${remaining}`);
    }

    return response;
  } finally {
    state.pendingRequests--;
  }
}

// Fetch with retry logic
async function fetchWithRetry(url, options, retries = CONFIG.MAX_RETRIES) {
  try {
    return await rateLimitedFetch(url, options);
  } catch (error) {
    if (retries <= 0) throw error;

    const delay = Math.pow(2, CONFIG.MAX_RETRIES - retries) * 1000;
    console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    return fetchWithRetry(url, options, retries - 1);
  }
}

// Main exercise fetching function
async function fetchExercises(bodyPart) {
  state.currentCategory = bodyPart;
  showLoading(dom.container, `Loading ${bodyPart} exercises...`);

  try {
    const response = await fetchWithRetry(
      `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=10`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": CONFIG.API_KEY,
          "X-RapidAPI-Host": CONFIG.API_HOST,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const exercises = await response.json();
    const filteredExercises = filterExercises(exercises);

    displayExercises(filteredExercises, bodyPart);
    cacheExercises(bodyPart, filteredExercises);
  } catch (error) {
    console.error(`Failed to load ${bodyPart}:`, error);

    if (state.exercisesCache[bodyPart]) {
      showWarning(
        dom.container,
        `Using cached data (${bodyPart})`,
        error.message
      );
      displayExercises(state.exercisesCache[bodyPart], bodyPart);
    } else {
      showError(
        dom.container,
        `Error loading ${bodyPart} exercises: ${error.message}`,
        true
      );
    }
  }
}

// Filter excluded exercises
function filterExercises(exercises) {
  return exercises.filter(
    (exercise) =>
      !CONFIG.EXCLUDED_EXERCISES.some((excluded) =>
        exercise.name.toLowerCase().includes(excluded.toLowerCase())
      )
  );
}

// Cache exercises
function cacheExercises(category, exercises) {
  state.exercisesCache[category] = exercises;
}

// Display exercises
function displayExercises(exercises, category) {
  clearContainer(category);

  if (exercises.length === 0) {
    showError(dom.container, "No exercises found");
    return;
  }

  addCategoryTitle(category, exercises.length);

  const grid = document.createElement("div");
  grid.className = "exercise-grid";

  exercises.forEach((exercise) => {
    grid.appendChild(createExerciseCard(exercise, category));
  });

  dom.container.appendChild(grid);
}

// Create exercise card
function createExerciseCard(exercise, category) {
  const card = document.createElement("div");
  card.className = "exercise-card";

  card.innerHTML = `
    <div class="gif-container">
      <img src="${exercise.gifUrl}" alt="${exercise.name}" loading="lazy">
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
            exercise.secondaryMuscles?.length > 0
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
            ${(exercise.instructions || ["No instructions available"])
              .map((step) => `<li>${step}</li>`)
              .join("")}
          </ol>
        </div>
      </div>
    </div>
  `;

  setupCardInteractions(card);
  return card;
}

// Handle search input
function handleSearchInput() {
  const searchTerm = dom.searchInput.value.trim().toLowerCase();
  dom.clearBtn.style.display = searchTerm ? "block" : "none";

  clearTimeout(state.searchTimeout);
  state.searchTimeout = setTimeout(() => {
    if (searchTerm.length >= 2) {
      searchExercises(searchTerm);
    } else if (searchTerm.length === 0) {
      fetchExercises(state.currentCategory);
    }
  }, 300);
}

// Perform search
async function searchExercises(searchTerm) {
  showLoading(dom.container, "Searching exercises...");

  try {
    // First try cached data
    const cachedResults = searchInCache(searchTerm);
    if (cachedResults.length > 0) {
      showSearchResults(cachedResults);
      return;
    }

    // If no cached results, fetch all
    await fetchAllExercises();
    const freshResults = searchInCache(searchTerm);

    if (freshResults.length > 0) {
      showSearchResults(freshResults);
    } else {
      showError(dom.container, `No exercises found matching "${searchTerm}"`);
    }
  } catch (error) {
    showError(dom.container, `Search error: ${error.message}`);
  }
}

// Search in cache
function searchInCache(searchTerm) {
  const results = [];
  Object.entries(state.exercisesCache).forEach(([category, exercises]) => {
    exercises.forEach((exercise) => {
      if (exercise.name.toLowerCase().includes(searchTerm)) {
        results.push({ ...exercise, originalCategory: category });
      }
    });
  });
  return results;
}

// Show search results
function showSearchResults(results) {
  dom.container.innerHTML = `<h2 class="category-title">Search Results (${results.length})</h2>`;
  const grid = document.createElement("div");
  grid.className = "exercise-grid";

  results.forEach((exercise) => {
    grid.appendChild(createExerciseCard(exercise, "search"));
  });

  dom.container.appendChild(grid);
}

// Clear search
function clearSearch() {
  dom.searchInput.value = "";
  dom.clearBtn.style.display = "none";
  fetchExercises(state.currentCategory);
}

// Fetch all exercises
async function fetchAllExercises() {
  if (Object.keys(state.exercisesCache).length === allCategories.length) return;

  showLoading(dom.container, "Loading all exercises...");

  try {
    const promises = allCategories.map((category) =>
      fetchExercisesByCategory(category)
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Failed to load all exercises:", error);
    throw error;
  }
}

// Fetch exercises by category
async function fetchExercisesByCategory(category) {
  if (state.exercisesCache[category]) return;

  try {
    const response = await fetchWithRetry(
      `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${category}?limit=10`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": CONFIG.API_KEY,
          "X-RapidAPI-Host": CONFIG.API_HOST,
        },
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch ${category}`);

    const exercises = await response.json();
    state.exercisesCache[category] = filterExercises(exercises);
  } catch (error) {
    console.error(`Failed to load ${category}:`, error);
    throw error;
  }
}

// Helper functions
function clearContainer(exceptForSearch = false) {
  if (!exceptForSearch || !dom.searchInput.value) {
    dom.container.innerHTML = "";
  }
}

function addCategoryTitle(category, count) {
  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = `${
    category.charAt(0).toUpperCase() + category.slice(1)
  } Exercises (${count})`;
  dom.container.appendChild(title);
}

function setupCardInteractions(card) {
  const details = card.querySelector(".exercise-details");
  const watermark = card.querySelector(".watermark-cover");

  card.addEventListener("click", (e) => {
    if (e.target !== watermark) toggleDetails(details);
  });

  watermark.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDetails(details);
  });
}

function toggleDetails(detailsElement) {
  document.querySelectorAll(".exercise-details.expanded").forEach((d) => {
    if (d !== detailsElement) d.classList.remove("expanded");
  });
  detailsElement.classList.toggle("expanded");
}

function showLoading(container, message) {
  container.innerHTML = `<div class="loading">${message}</div>`;
}

function showError(container, message, showSolutions = false) {
  container.innerHTML = `
    <div class="error">
      ${message}
      ${
        showSolutions
          ? `
        <div class="error-solutions">
          <strong>Try:</strong>
          <ol>
            <li>Refresh the page</li>
            <li>Check your <a href="https://rapidapi.com/developer/dashboard" target="_blank">RapidAPI account</a></li>
            <li>Try a different exercise category</li>
          </ol>
        </div>
      `
          : ""
      }
    </div>
  `;
}

function showWarning(container, message, subMessage) {
  container.innerHTML = `
    <div class="warning">
      ${message}<br>
      <small>${subMessage}</small>
    </div>
  `;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
