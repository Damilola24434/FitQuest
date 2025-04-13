// Meals organized by date
let mealsByDate = {};  // creating a variable 
let currentDate = new Date().toISOString().slice(0, 10); //the date is automatically set to today

const byId = id => document.getElementById(id); //shortcut to element ID

byId('selectedDate').value = currentDate; // Set today's date

// Listen for date changes
byId('selectedDate').addEventListener('change', (e) => {
  currentDate = e.target.value;
  loadMealsForDate();
});

// Load meals for the selected date
function loadMealsForDate() {
  if (!mealsByDate[currentDate]) {
    mealsByDate[currentDate] = { breakfast: [], lunch: [], dinner: [] };
  }
  displayAllMeals();
  refreshTotals(); 
}

// Add a meal
function addMealButton(listElement, mealArrayName) {
  const form = document.createElement('form');
  form.className = 'add-form';
  form.innerHTML = `
    <input type="text" name="name" placeholder="Meal Name" required>
    <input type="number" name="kcal" placeholder="Calories (kcal)">
    <input type="number" name="protein" placeholder="Protein (g)">
    <input type="number" name="water" placeholder="Water (oz)">
    <button type="submit">Save</button>
  `;

  form.onsubmit = (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const kcal = form.kcal.value ? Number(form.kcal.value) : 0;
    const protein = form.protein.value ? Number(form.protein.value) : 0;
    const water = form.water.value ? Number(form.water.value) : 0;

    if (!name) return;  // Meal name is required

    mealsByDate[currentDate][mealArrayName].push({ name, kcal, protein, water });
    saveMeals();
    displayMeals(listElement, mealsByDate[currentDate][mealArrayName], mealArrayName);
    refreshTotals(); //  Refresh totals after adding a meal
  };

  listElement.appendChild(form);
}

//This is the func allows the meals to be added...bookmarked
function displayMeals(listElement, mealArray, mealArrayName) {
  listElement.innerHTML = mealArray.map(meal => `
    <div>• ${meal.name}</div>
  `).join('');

  const plusBtn = document.createElement('button');
  plusBtn.textContent = '+';
  plusBtn.className = 'plus-button';
  plusBtn.onclick = () => addMealButton(listElement, mealArrayName);

  listElement.appendChild(plusBtn);
}

// display all meals
function displayAllMeals() {
  displayMeals(byId('breakfastList'), mealsByDate[currentDate].breakfast, 'breakfast');
  displayMeals(byId('lunchList'), mealsByDate[currentDate].lunch, 'lunch');
  displayMeals(byId('dinnerList'), mealsByDate[currentDate].dinner, 'dinner');
}

// Save meals to localStorage
function saveMeals() {
  localStorage.setItem('mealPlannerData', JSON.stringify(mealsByDate));
}

// Load meals from localStorage
function loadSavedMeals() {
  const saved = localStorage.getItem('mealPlannerData');
  if (saved) {
    mealsByDate = JSON.parse(saved);
  }
  loadMealsForDate();
}

// Calculate totals for each
function calculateTotals() {
  const meals = [
    ...mealsByDate[currentDate].breakfast,
    ...mealsByDate[currentDate].lunch,
    ...mealsByDate[currentDate].dinner
  ];

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.kcal || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalWater = meals.reduce((sum, meal) => sum + (meal.water || 0), 0);

  return { totalCalories, totalProtein, totalWater };
}

// This is what refreshes totals under icons
function refreshTotals() {
  const { totalCalories, totalProtein, totalWater } = calculateTotals();
  byId('proteinResult').textContent = `Protein: ${totalProtein} g`;
  byId('caloricResult').textContent = `Calories: ${totalCalories} kcal`;
  byId('waterResult').textContent = `Water: ${totalWater} oz`;
}

// Setup icon clicks
function setupIconClicks() {
  byId('proteinIcon').addEventListener('click', () => {      //listens for a click on the protein icon picture
    const { totalProtein } = calculateTotals();
    byId('proteinResult').textContent = `Protein: ${totalProtein} g`;
  });

  byId('caloricIcon').addEventListener('click', () => {     //listens for a click on the calorie icon picture
    const { totalCalories } = calculateTotals();
    byId('caloricResult').textContent = `Calories: ${totalCalories} kcal`;
  });

  byId('waterIcon').addEventListener('click', () => {    //listens for a click on the water icon picture
    const { totalWater } = calculateTotals();
    byId('waterResult').textContent = `Water: ${totalWater} oz`;
  });
}


setupIconClicks();
loadSavedMeals();
