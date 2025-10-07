// Interactive Nutrition Calculator and Visualizer
class InteractiveNutritionPlanner {
    constructor() {
        this.nutritionDatabase = this.initializeNutritionDB();
        this.dailyTargets = this.calculateDailyTargets();
        this.currentIntake = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
        };
        this.mealPlan = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };
        this.charts = {};
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupEventListeners();
        this.createNutritionWheel();
        this.updateAllDisplays();
    }

    initializeNutritionDB() {
        // Comprehensive nutrition database with common foods
        return {
            fruits: {
                apple: { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, sugar: 19, sodium: 2 },
                banana: { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3, sugar: 14, sodium: 1 },
                orange: { name: 'Orange (1 medium)', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3, sugar: 12, sodium: 0 },
                strawberries: { name: 'Strawberries (1 cup)', calories: 49, protein: 1, carbs: 12, fat: 0.5, fiber: 3, sugar: 7, sodium: 1 }
            },
            vegetables: {
                broccoli: { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 0.6, fiber: 5, sugar: 2, sodium: 64 },
                spinach: { name: 'Spinach (1 cup)', calories: 7, protein: 0.9, carbs: 1, fat: 0.1, fiber: 0.7, sugar: 0.1, sodium: 24 },
                carrots: { name: 'Carrots (1 cup)', calories: 52, protein: 1.2, carbs: 12, fat: 0.3, fiber: 4, sugar: 6, sodium: 88 },
                tomato: { name: 'Tomato (1 medium)', calories: 22, protein: 1, carbs: 5, fat: 0.2, fiber: 1.5, sugar: 3, sodium: 6 }
            },
            proteins: {
                chicken_breast: { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
                salmon: { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 12, fiber: 0, sugar: 0, sodium: 59 },
                eggs: { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fat: 10, fiber: 0, sugar: 1, sodium: 140 },
                tofu: { name: 'Tofu (100g)', calories: 76, protein: 8, carbs: 2, fat: 5, fiber: 0.4, sugar: 0.6, sodium: 7 }
            },
            grains: {
                brown_rice: { name: 'Brown Rice (1 cup cooked)', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 4, sugar: 0.7, sodium: 10 },
                quinoa: { name: 'Quinoa (1 cup cooked)', calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, sugar: 1.6, sodium: 13 },
                oatmeal: { name: 'Oatmeal (1 cup cooked)', calories: 154, protein: 6, carbs: 28, fat: 3, fiber: 4, sugar: 1, sodium: 115 },
                whole_wheat_bread: { name: 'Whole Wheat Bread (2 slices)', calories: 138, protein: 8, carbs: 23, fat: 2.5, fiber: 6, sugar: 2, sodium: 238 }
            },
            dairy: {
                greek_yogurt: { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 23, carbs: 9, fat: 0, fiber: 0, sugar: 9, sodium: 65 },
                milk: { name: 'Milk (1 cup)', calories: 146, protein: 8, carbs: 11, fat: 8, fiber: 0, sugar: 12, sodium: 98 },
                cheese: { name: 'Cheddar Cheese (1 oz)', calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, sugar: 0.4, sodium: 174 }
            }
        };
    }

    calculateDailyTargets() {
        // Get user data from assessment if available
        const assessmentData = localStorage.getItem('wellnessAssessment');
        let targets = {
            calories: 2000,
            protein: 150,    // grams
            carbs: 250,      // grams
            fat: 67,         // grams
            fiber: 25,       // grams
            sugar: 50,       // grams (max)
            sodium: 2300     // mg (max)
        };

        if (assessmentData) {
            try {
                const data = JSON.parse(assessmentData);
                const formData = data.formData;
                
                if (formData.weight && formData.height && formData.age && formData.gender) {
                    const calculator = new HealthCalculator();
                    const bmr = calculator.calculateBMR(
                        parseFloat(formData.weight),
                        parseFloat(formData.height),
                        parseInt(formData.age),
                        formData.gender
                    );
                    const tdee = calculator.calculateTDEE(bmr, formData.activityLevel);
                    
                    if (tdee) {
                        targets.calories = tdee;
                        targets.protein = Math.round((tdee * 0.25) / 4); // 25% of calories from protein
                        targets.carbs = Math.round((tdee * 0.45) / 4);   // 45% of calories from carbs
                        targets.fat = Math.round((tdee * 0.30) / 9);     // 30% of calories from fat
                    }
                }
            } catch (error) {
                console.error('Error calculating personalized targets:', error);
            }
        }

        return targets;
    }

    setupEventListeners() {
        // Food search and add functionality
        const searchInput = document.getElementById('foodSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchFoods(e.target.value));
        }

        // Meal type selection
        const mealButtons = document.querySelectorAll('.meal-btn');
        mealButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMealType(e.target.dataset.meal));
        });
    }

    searchFoods(query) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer || !query || query.length < 2) {
            if (resultsContainer) resultsContainer.innerHTML = '';
            return;
        }

        const results = [];
        Object.values(this.nutritionDatabase).forEach(category => {
            Object.entries(category).forEach(([key, food]) => {
                if (food.name.toLowerCase().includes(query.toLowerCase())) {
                    results.push({ key, ...food });
                }
            });
        });

        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="text-muted p-3">No foods found</div>';
            return;
        }

        container.innerHTML = results.slice(0, 10).map(food => `
            <div class="food-result-item" onclick="nutritionPlanner.addFood('${food.key}', '${this.selectedMeal || 'breakfast'}')">
                <div class="food-name">${food.name}</div>
                <div class="food-calories">${food.calories} cal</div>
                <div class="food-macros">
                    P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g
                </div>
            </div>
        `).join('');
    }

    selectMealType(mealType) {
        this.selectedMeal = mealType;
        
        // Update UI to show selected meal
        document.querySelectorAll('.meal-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-meal="${mealType}"]`).classList.add('active');
        
        this.displayMealPlan(mealType);
    }

    addFood(foodKey, mealType) {
        // Find the food in the database
        let food = null;
        Object.values(this.nutritionDatabase).forEach(category => {
            if (category[foodKey]) {
                food = { ...category[foodKey] };
            }
        });

        if (!food) return;

        // Add to meal plan
        this.mealPlan[mealType].push({
            id: Date.now(),
            ...food
        });

        // Update current intake
        this.updateCurrentIntake();
        
        // Refresh displays
        this.updateAllDisplays();
        this.displayMealPlan(mealType);
        
        // Clear search
        const searchInput = document.getElementById('foodSearch');
        if (searchInput) {
            searchInput.value = '';
            document.getElementById('searchResults').innerHTML = '';
        }

        // Save to localStorage
        this.saveData();
    }

    removeFood(mealType, foodId) {
        this.mealPlan[mealType] = this.mealPlan[mealType].filter(food => food.id !== foodId);
        this.updateCurrentIntake();
        this.updateAllDisplays();
        this.displayMealPlan(mealType);
        this.saveData();
    }

    updateCurrentIntake() {
        // Reset current intake
        Object.keys(this.currentIntake).forEach(key => {
            this.currentIntake[key] = 0;
        });

        // Sum up all foods from all meals
        Object.values(this.mealPlan).forEach(meal => {
            meal.forEach(food => {
                this.currentIntake.calories += food.calories;
                this.currentIntake.protein += food.protein;
                this.currentIntake.carbs += food.carbs;
                this.currentIntake.fat += food.fat;
                this.currentIntake.fiber += food.fiber || 0;
                this.currentIntake.sugar += food.sugar || 0;
                this.currentIntake.sodium += food.sodium || 0;
            });
        });
    }

    updateAllDisplays() {
        // Update quick stats
        this.updateQuickStats();
        
        // Update nutrition wheel
        this.updateNutritionWheel();
        
        // Update progress bars
        this.updateProgressBars();
        
        // Update daily score
        this.updateDailyScore();
    }

    updateQuickStats() {
        const elements = {
            totalCalories: Math.round(this.currentIntake.calories),
            totalProtein: Math.round(this.currentIntake.protein),
            totalCarbs: Math.round(this.currentIntake.carbs),
            totalFat: Math.round(this.currentIntake.fat)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    createNutritionWheel() {
        const ctx = document.getElementById('nutritionWheel');
        if (!ctx) return;

        this.charts.wheel = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbohydrates', 'Fat'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#28a745',
                        '#ffc107', 
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateNutritionWheel() {
        if (!this.charts.wheel) return;

        const proteinCals = this.currentIntake.protein * 4;
        const carbsCals = this.currentIntake.carbs * 4;
        const fatCals = this.currentIntake.fat * 9;
        const total = proteinCals + carbsCals + fatCals;

        if (total === 0) {
            this.charts.wheel.data.datasets[0].data = [0, 0, 0];
        } else {
            this.charts.wheel.data.datasets[0].data = [
                Math.round((proteinCals / total) * 100),
                Math.round((carbsCals / total) * 100),
                Math.round((fatCals / total) * 100)
            ];
        }

        this.charts.wheel.update();
    }

    updateProgressBars() {
        const nutrients = [
            { key: 'calories', target: this.dailyTargets.calories, suffix: '' },
            { key: 'protein', target: this.dailyTargets.protein, suffix: 'g' },
            { key: 'carbs', target: this.dailyTargets.carbs, suffix: 'g' },
            { key: 'fat', target: this.dailyTargets.fat, suffix: 'g' },
            { key: 'fiber', target: this.dailyTargets.fiber, suffix: 'g' }
        ];

        nutrients.forEach(nutrient => {
            const progressBar = document.getElementById(`${nutrient.key}Progress`);
            const progressText = document.getElementById(`${nutrient.key}Text`);
            
            if (progressBar && progressText) {
                const current = Math.round(this.currentIntake[nutrient.key] || 0);
                const percentage = Math.min((current / nutrient.target) * 100, 100);
                
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute('aria-valuenow', percentage);
                progressText.textContent = `${current}${nutrient.suffix} / ${nutrient.target}${nutrient.suffix}`;
                
                // Color coding
                if (percentage >= 80) {
                    progressBar.className = 'progress-bar bg-success';
                } else if (percentage >= 50) {
                    progressBar.className = 'progress-bar bg-warning';
                } else {
                    progressBar.className = 'progress-bar bg-danger';
                }
            }
        });
    }

    updateDailyScore() {
        const element = document.getElementById('dailyScore');
        if (!element) return;

        // Calculate score based on meeting nutritional targets
        let score = 0;
        const maxScore = 100;
        
        const targets = [
            { current: this.currentIntake.calories, target: this.dailyTargets.calories, weight: 30 },
            { current: this.currentIntake.protein, target: this.dailyTargets.protein, weight: 25 },
            { current: this.currentIntake.carbs, target: this.dailyTargets.carbs, weight: 20 },
            { current: this.currentIntake.fat, target: this.dailyTargets.fat, weight: 15 },
            { current: this.currentIntake.fiber, target: this.dailyTargets.fiber, weight: 10 }
        ];

        targets.forEach(item => {
            const ratio = Math.min(item.current / item.target, 1);
            score += ratio * (item.weight / 100) * maxScore;
        });

        element.textContent = Math.round(score);
    }

    displayMealPlan(mealType) {
        const container = document.getElementById(`${mealType}Foods`);
        if (!container) return;

        const foods = this.mealPlan[mealType];
        
        if (foods.length === 0) {
            container.innerHTML = '<div class="text-muted p-3">No foods added yet</div>';
            return;
        }

        container.innerHTML = foods.map(food => `
            <div class="meal-food-item">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div class="food-details">${food.calories} cal | P: ${food.protein}g C: ${food.carbs}g F: ${food.fat}g</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="nutritionPlanner.removeFood('${mealType}', ${food.id})">
                    ×
                </button>
            </div>
        `).join('');
    }

    saveData() {
        const data = {
            mealPlan: this.mealPlan,
            currentIntake: this.currentIntake,
            dailyTargets: this.dailyTargets,
            date: new Date().toDateString()
        };
        
        localStorage.setItem('nutritionPlan', JSON.stringify(data));
    }

    loadSavedData() {
        const saved = localStorage.getItem('nutritionPlan');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                // Only load if it's from today
                if (data.date === new Date().toDateString()) {
                    this.mealPlan = data.mealPlan || this.mealPlan;
                    this.currentIntake = data.currentIntake || this.currentIntake;
                    this.dailyTargets = data.dailyTargets || this.dailyTargets;
                }
            } catch (error) {
                console.error('Error loading nutrition data:', error);
            }
        }
    }

    clearDay() {
        if (confirm('Clear all foods for today? This cannot be undone.')) {
            this.mealPlan = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: []
            };
            this.currentIntake = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0
            };
            
            this.updateAllDisplays();
            this.saveData();
            
            // Clear all meal displays
            ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(meal => {
                this.displayMealPlan(meal);
            });
        }
    }
}

// Initialize nutrition planner
let nutritionPlanner;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('nutritionWheel')) {
        nutritionPlanner = new InteractiveNutritionPlanner();
        // Set default meal selection
        nutritionPlanner.selectMealType('breakfast');
    }
});

// Global functions for UI
function clearDay() {
    if (nutritionPlanner) {
        nutritionPlanner.clearDay();
    }
}
