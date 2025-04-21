// Load navbar
fetch('../Navbar/navbar.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar-container').innerHTML = html;
        // Load navbar.js after the navbar HTML is inserted
        const script = document.createElement('script');
        script.src = '../Navbar/navbar.js';
        document.body.appendChild(script);
    });

// Exercise Database Variables
const allCategories = [
    'back', 'cardio', 'chest', 'lower arms', 
    'lower legs', 'neck', 'shoulders', 
    'upper arms', 'upper legs', 'waist'
];

const excludedExercises = [
    "barbell pullover to press",
];

// Cache settings
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
let allExercisesCache = {};
let currentCategory = 'back';
let searchTimeout = null;
let lastClickedCard = null;

// Cache functions
function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) return null;
    
    return data;
}

function setCachedData(key, data) {
    const cacheEntry = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
}

// Daily Workout Functions
function getDailySeed() {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    document.getElementById('daily-date').textContent = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        const char = dateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

async function loadDailyExercise() {
    const container = document.getElementById('daily-exercise-container');
    const seed = getDailySeed();
    
    try {
        // Check cache first
        const cached = getCachedData('allExercises');
        if (cached) {
            allExercisesCache = cached;
            selectAndDisplayDailyExercise();
            return;
        }

        // Fetch all categories if not cached
        if (Object.keys(allExercisesCache).length === 0) {
            await fetchAllExercises(true); // Silent fetch for daily exercise
        }
        
        selectAndDisplayDailyExercise();
    } catch (error) {
        container.innerHTML = `
            <div class="error-daily">
                Failed to load today's exercise. ${error.message}
            </div>
        `;
        console.error("Error loading daily exercise:", error);
    }
    
    function selectAndDisplayDailyExercise() {
        const allExercises = Object.values(allExercisesCache).flat();
        if (allExercises.length === 0) throw new Error("No exercises available");
        
        const dailyIndex = Math.abs(seed) % allExercises.length;
        const dailyExercise = allExercises[dailyIndex];
        displayDailyExercise(dailyExercise);
    }
}

function displayDailyExercise(exercise) {
    const container = document.getElementById('daily-exercise-container');
    
    const formattedInstructions = exercise.instructions?.length > 0 
        ? exercise.instructions.map(step => `<li>${step}</li>`).join('')
        : '<li>No instructions available</li>';
    
    container.innerHTML = `
        <div class="daily-exercise">
            <div class="daily-exercise-header">
                <h3 class="daily-exercise-name">${exercise.name}</h3>
                <span class="daily-exercise-category">${exercise.bodyPart || exercise.target}</span>
            </div>
            <div class="daily-exercise-content">
                <img src="${exercise.gifUrl}" alt="${exercise.name}" class="daily-exercise-gif" loading="lazy">
                <div class="daily-exercise-details">
                    <div class="daily-exercise-info">
                        <i class="fas fa-dumbbell"></i>
                        <span><strong>Equipment:</strong> ${exercise.equipment || 'None'}</span>
                    </div>
                    <div class="daily-exercise-info">
                        <i class="fas fa-bullseye"></i>
                        <span><strong>Target:</strong> ${exercise.target}</span>
                    </div>
                    ${exercise.secondaryMuscles?.length > 0 
                        ? `<div class="daily-exercise-info">
                            <i class="fas fa-muscle"></i>
                            <span><strong>Secondary Muscles:</strong> ${exercise.secondaryMuscles.join(', ')}</span>
                           </div>`
                        : ''}
                    <div class="daily-exercise-instructions">
                        <h4><i class="fas fa-list-ol"></i> Instructions:</h4>
                        <ol>${formattedInstructions}</ol>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Exercise Database Functions
function handleSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.querySelector('.clear-search');
    
    clearBtn.style.display = searchInput.value ? 'block' : 'none';
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (searchInput.value.length >= 2) {
            searchExercises();
        } else if (searchInput.value.length === 0) {
            fetchExercises(currentCategory);
        }
    }, 500);
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    document.querySelector('.clear-search').style.display = 'none';
    fetchExercises(currentCategory);
}

async function searchExercises() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('exerciseContainer');
    
    if (searchTerm.length < 2) return;
    
    try {
        container.innerHTML = '<div class="loading">Searching exercises...</div>';
        
        // Check cache first
        const cached = getCachedData('allExercises');
        if (cached) {
            allExercisesCache = cached;
            performSearch();
            return;
        }

        // Fetch all if not cached
        if (Object.keys(allExercisesCache).length === 0) {
            await fetchAllExercises(true);
        }
        
        performSearch();
    } catch (error) {
        container.innerHTML = `<div class="error">Error during search: ${error.message}</div>`;
    }
    
    function performSearch() {
        const searchResults = [];
        Object.entries(allExercisesCache).forEach(([category, exercises]) => {
            exercises.forEach(exercise => {
                if (exercise.name.toLowerCase().includes(searchTerm)) {
                    searchResults.push({
                        ...exercise,
                        originalCategory: category
                    });
                }
            });
        });
        
        if (searchResults.length > 0) {
            container.innerHTML = `<h2 class="category-title">Search Results (${searchResults.length})</h2>`;
            displayExercises(searchResults, 'search');
        } else {
            container.innerHTML = `<div class="error">No exercises found matching "${searchTerm}"</div>`;
        }
    }
}

async function fetchExercises(bodyPart, silent = false) {
    currentCategory = bodyPart;
    const container = document.getElementById('exerciseContainer');
    if (!silent) container.innerHTML = `<div class="loading">Loading ${bodyPart} exercises...</div>`;
    
    // Check cache first
    const cached = getCachedData(`exercises_${bodyPart}`);
    if (cached) {
        if (!silent) displayExercises(cached, bodyPart);
        allExercisesCache[bodyPart] = cached;
        return cached;
    }
    
    try {
        const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}?limit=50`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'e9554985a2mshf6b1b46e256ac15p1d5ea8jsna119aab43782',
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        
        if (!response.ok) throw new Error(`Failed to fetch ${bodyPart} exercises: ${response.status}`);
        
        let exercises = await response.json();
        exercises = exercises.filter(exercise => 
            !excludedExercises.some(excluded => exercise.name.toLowerCase().includes(excluded.toLowerCase()))
        );

        // Cache the results
        setCachedData(`exercises_${bodyPart}`, exercises);
        allExercisesCache[bodyPart] = exercises;
        
        if (!silent) displayExercises(exercises, bodyPart);
        return exercises;
    } catch (error) {
        if (!silent) {
            container.innerHTML = `
                <div class="error">
                    Error loading ${bodyPart} exercises: ${error.message}<br><br>
                    <strong>Possible solutions:</strong>
                    <ol>
                        <li>Check your <a href="https://rapidapi.com/developer/dashboard" target="_blank">RapidAPI subscription</a></li>
                        <li>Refresh the page and try again</li>
                        <li>Try a different category</li>
                    </ol>
                </div>`;
        }
        throw error;
    }
}

async function fetchAllExercises(silent = false) {
    const container = document.getElementById('exerciseContainer');
    if (!silent) container.innerHTML = '<div class="loading">Loading all exercises...</div>';
    
    // Check cache first
    const cached = getCachedData('allExercises');
    if (cached) {
        allExercisesCache = cached;
        if (!silent) {
            container.innerHTML = '';
            Object.entries(cached).forEach(([category, exercises]) => {
                displayExercises(exercises, category);
            });
        }
        return cached;
    }
    
    try {
        const results = await Promise.all(allCategories.map(category => 
            fetchExercises(category, true).catch(() => ({ category, exercises: [] }))
        ));
        
        const successfulResults = results.filter(result => result?.length > 0);
        const newCache = {};
        
        successfulResults.forEach(exercises => {
            if (exercises.length > 0) {
                const category = exercises[0].bodyPart.toLowerCase();
                newCache[category] = exercises;
            }
        });
        
        // Cache all exercises
        setCachedData('allExercises', newCache);
        allExercisesCache = newCache;
        
        if (!silent) {
            container.innerHTML = '';
            Object.entries(newCache).forEach(([category, exercises]) => {
                displayExercises(exercises, category);
            });
        }
        
        return newCache;
    } catch (error) {
        if (!silent) {
            container.innerHTML = `
                <div class="error">
                    Error loading all exercises: ${error.message}<br><br>
                    Try selecting individual categories instead
                </div>`;
        }
        throw error;
    }
}

function displayExercises(exercises, category) {
    const container = document.getElementById('exerciseContainer');
    const searchInput = document.getElementById('searchInput');
    
    if (category !== 'search' && searchInput.value.length >= 2) return;
    
    if (category !== 'search' && container.querySelector('.category-title')) {
        container.innerHTML = '';
    }
    
    if (category !== 'search') {
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Exercises (${exercises.length})`;
        container.appendChild(categoryTitle);
    }
    
    const grid = document.createElement('div');
    grid.className = 'exercise-grid';
    
    exercises.forEach(exercise => {
        const card = document.createElement('div');
        card.className = 'exercise-card';
        
        const formattedInstructions = exercise.instructions?.length > 0 
            ? exercise.instructions.map(step => `<li>${step}</li>`).join('')
            : '<li>No instructions available</li>';
        
        card.innerHTML = `
            <div class="gif-container">
                <img src="${exercise.gifUrl}" alt="${exercise.name}" loading="lazy">
                <div class="gif-overlay"></div>
                <div class="watermark-cover">${exercise.name}</div>
            </div>
            <div class="exercise-content">
                <div class="exercise-details">
                    <div class="exercise-details-content">
                        <div class="exercise-info"><strong>Equipment:</strong> ${exercise.equipment || 'None'}</div>
                        <div class="exercise-info"><strong>Target:</strong> ${exercise.target}</div>
                        ${exercise.secondaryMuscles?.length > 0 
                            ? `<div class="exercise-info"><strong>Secondary Muscles:</strong> ${exercise.secondaryMuscles.join(', ')}</div>`
                            : ''}
                        ${category === 'search' 
                            ? `<div class="exercise-info"><strong>Category:</strong> ${exercise.originalCategory || category}</div>`
                            : ''}
                        <div class="exercise-info"><strong>Instructions:</strong></div>
                        <ol class="instructions-list">
                            ${formattedInstructions}
                        </ol>
                    </div>
                </div>
            </div>
        `;
        
        const watermarkCover = card.querySelector('.watermark-cover');
        const exerciseDetails = card.querySelector('.exercise-details');
        
        card.addEventListener('click', function(e) {
            if (e.target === watermarkCover) return;
            
            document.querySelectorAll('.exercise-details.expanded').forEach(details => {
                if (details !== exerciseDetails) details.classList.remove('expanded');
            });
            
            exerciseDetails.classList.toggle('expanded');
        });
        
        watermarkCover.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.exercise-details.expanded').forEach(details => {
                if (details !== exerciseDetails) details.classList.remove('expanded');
            });
            exerciseDetails.classList.toggle('expanded');
        });
        
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
}

// Initialize
window.onload = function() {
    fetchExercises('back');
    loadDailyExercise();
    
    // Update daily exercise at midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;
    
    setTimeout(() => {
        loadDailyExercise();
        setInterval(loadDailyExercise, 86400000);
    }, msUntilMidnight);
};

// Get the button
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// Show the button when scrolling down
window.onscroll = function () {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

// Scroll to top when clicked
scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
