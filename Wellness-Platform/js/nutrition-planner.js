class NutritionPlanner {
    constructor() {
        this.calculator = new NutritionCalculator();
        this.currentMeals = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };
        this.nutritionGoals = {};
        this.charts = {};
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserData();
            this.calculateNutritionGoals();
            this.updateNutritionGoals();
            this.updateNutritionWheel();
            this.loadSavedMeals();
            this.updateAllNutrition();
        });
    }

    loadUserData() {
        const assessmentData = localStorage.getItem('wellnessAssessment');
        if (assessmentData) {
            try {
                const assessment = JSON.parse(assessmentData);
                this.userData = assessment.formData;
            } catch (e) {
                console.error('Error loading user data:', e);
                this.userData = null;
            }
        }
    }

    calculateNutritionGoals() {
        this.nutritionGoals = this.calculator.calculatePersonalizedGoals(this.userData);
        console.log('Calculated nutrition goals:', this.nutritionGoals);
    }

    updateNutritionGoals() {
        const goalsContainer = document.getElementById('nutritionGoals');
        if (!goalsContainer) return;

        const goals = [
            { key: 'calories', icon: '🔥', label: 'Calories', unit: 'kcal' },
            { key: 'protein', icon: '🥩', label: 'Protein', unit: 'g' },
            { key: 'carbs', icon: '🍞', label: 'Carbs', unit: 'g' },
            { key: 'fat', icon: '🥑', label: 'Fat', unit: 'g' },
            { key: 'fiber', icon: '🌾', label: 'Fiber', unit: 'g' }
        ];

        goalsContainer.innerHTML = goals.map(goal => `
            <div class="col-md-4 col-lg-2">
                <div class="goal-item">
                    <div class="goal-icon">${goal.icon}</div>
                    <div class="goal-value">${this.nutritionGoals[goal.key]}</div>
                    <div class="goal-label">${goal.label} (${goal.unit})</div>
                    <div class="goal-progress">
                        <div class="goal-progress-bar" id="progress-${goal.key}" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateNutritionWheel() {
        const ctx = document.getElementById('nutritionWheel');
        if (!ctx) return;

        const currentNutrition = this.calculateTotalDayNutrition();
        const breakdown = this.calculator.getNutritionBreakdown(currentNutrition);

        if (this.charts.nutritionWheel) {
            this.charts.nutritionWheel.destroy();
        }

        this.charts.nutritionWheel = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbohydrates', 'Fat'],
                datasets: [{
                    data: [breakdown.protein, breakdown.carbs, breakdown.fat],
                    backgroundColor: [
                        '#28a745', // Green for protein
                        '#ffc107', // Yellow for carbs
                        '#17a2b8'  // Blue for fat
                    ],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const percentage = context.parsed.toFixed(1);
                                return `${label}: ${percentage}%`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    loadSavedMeals() {
        const savedMeals = localStorage.getItem('nutritionPlannerMeals');
        if (savedMeals) {
            try {
                this.currentMeals = JSON.parse(savedMeals);
                this.updateAllMealDisplays();
            } catch (e) {
                console.error('Error loading saved meals:', e);
            }
        }
    }

    saveMeals() {
        localStorage.setItem('nutritionPlannerMeals', JSON.stringify(this.currentMeals));
    }

    addFood(meal, foodId, quantity = 1) {
        const foodInfo = this.calculator.getFoodInfo(foodId);
        if (!foodInfo) return;

        const food = {
            id: foodId,
            name: this.calculator.formatFoodName(foodId),
            quantity: quantity,
            servingSize: 1,
            calories: foodInfo.calories * quantity,
            protein: foodInfo.protein * quantity,
            carbs: foodInfo.carbs * quantity,
            fat: foodInfo.fat * quantity,
            fiber: foodInfo.fiber * quantity
        };

        this.currentMeals[meal].push(food);
        this.updateMealDisplay(meal);
        this.updateAllNutrition();
        this.saveMeals();
    }

    removeFood(meal, index) {
        this.currentMeals[meal].splice(index, 1);
        this.updateMealDisplay(meal);
        this.updateAllNutrition();
        this.saveMeals();
    }

    updateMealDisplay(meal) {
        const mealCard = document.querySelector(`[data-meal="${meal}"]`);
        if (!mealCard) return;

        const mealContent = mealCard.querySelector('.meal-content');
        const caloriesSpan = mealCard.querySelector('.calories');
        
        const foods = this.currentMeals[meal];
        const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);

        caloriesSpan.textContent = `${Math.round(totalCalories)} kcal`;

        if (foods.length === 0) {
            mealContent.innerHTML = '<p class="text-muted">Click to add foods</p>';
        } else {
            mealContent.innerHTML = foods.map((food, index) => `
                <div class="food-item food-item-new">
                    <div>
                        <div class="food-name">${food.name}</div>
                        <div class="food-calories">${Math.round(food.calories)} kcal</div>
                    </div>
                    <button class="remove-food" onclick="nutritionPlanner.removeFood('${meal}', ${index})" title="Remove food">
                        ×
                    </button>
                </div>
            `).join('');
        }
    }

    updateAllMealDisplays() {
        Object.keys(this.currentMeals).forEach(meal => {
            this.updateMealDisplay(meal);
        });
    }

    calculateTotalDayNutrition() {
        const allFoods = [];
        Object.values(this.currentMeals).forEach(mealFoods => {
            allFoods.push(...mealFoods);
        });

        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };

        allFoods.forEach(food => {
            totals.calories += food.calories || 0;
            totals.protein += food.protein || 0;
            totals.carbs += food.carbs || 0;
            totals.fat += food.fat || 0;
            totals.fiber += food.fiber || 0;
        });

        // Round to 1 decimal place
        Object.keys(totals).forEach(key => {
            totals[key] = Math.round(totals[key] * 10) / 10;
        });

        return totals;
    }

    updateAllNutrition() {
        const currentNutrition = this.calculateTotalDayNutrition();
        
        // Update nutrition summary
        document.getElementById('totalCalories').textContent = Math.round(currentNutrition.calories);
        document.getElementById('totalProtein').textContent = Math.round(currentNutrition.protein);
        document.getElementById('totalCarbs').textContent = Math.round(currentNutrition.carbs);
        document.getElementById('totalFat').textContent = Math.round(currentNutrition.fat);
        document.getElementById('totalFiber').textContent = Math.round(currentNutrition.fiber);

        // Update progress bars
        Object.keys(this.nutritionGoals).forEach(nutrient => {
            const current = currentNutrition[nutrient] || 0;
            const goal = this.nutritionGoals[nutrient];
            const percentage = Math.min((current / goal) * 100, 100);
            
            const progressBar = document.getElementById(`progress-${nutrient}`);
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
        });

        // Update nutrition wheel
        this.updateNutritionWheel();

        // Update nutrition alerts
        this.updateNutritionAlerts(currentNutrition);
    }

    updateNutritionAlerts(currentNutrition) {
        const alertsContainer = document.getElementById('nutritionAlerts');
        if (!alertsContainer) return;

        const analysis = this.calculator.analyzeNutrition(currentNutrition, this.nutritionGoals);
        
        if (analysis.alerts.length === 0) {
            alertsContainer.innerHTML = '<div class="alert alert-info"><small>Add foods to see nutritional analysis</small></div>';
            return;
        }

        alertsContainer.innerHTML = analysis.alerts.map(alert => `
            <div class="nutrition-alert alert-${alert.type}">
                <span>${this.getAlertIcon(alert.type)}</span>
                <span>${alert.message}</span>
            </div>
        `).join('');
    }

    getAlertIcon(type) {
        const icons = {
            deficiency: '⚠️',
            excess: '🔴',
            good: '✅'
        };
        return icons[type] || '📊';
    }

    showFoodSearchModal(meal) {
        this.currentMealForSearch = meal;
        const modal = new bootstrap.Modal(document.getElementById('foodSearchModal'));
        modal.show();
        
        // Set up search functionality
        const searchInput = document.getElementById('foodSearch');
        const resultsContainer = document.getElementById('foodSearchResults');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                resultsContainer.innerHTML = '<p class="text-muted">Type at least 2 characters to search...</p>';
                return;
            }
            
            const results = this.calculator.searchFoods(query);
            this.displaySearchResults(results, resultsContainer);
        });
        
        // Show popular foods initially
        const popularFoods = ['chicken-breast', 'brown-rice', 'broccoli', 'salmon', 'eggs', 'banana', 'apple', 'oatmeal'];
        const popularResults = popularFoods.map(id => ({
            id,
            name: this.calculator.formatFoodName(id),
            ...this.calculator.getFoodInfo(id)
        }));
        
        this.displaySearchResults(popularResults, resultsContainer);
    }

    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<p class="text-muted">No foods found. Try a different search term.</p>';
            return;
        }

        container.innerHTML = results.map(food => `
            <div class="food-search-item" onclick="nutritionPlanner.selectFood('${food.id}')">
                <div>
                    <div class="search-food-name">${food.name}</div>
                    <div class="search-food-info">${food.calories} kcal, ${food.protein}g protein</div>
                </div>
                <button class="btn btn-sm btn-outline-primary">Add</button>
            </div>
        `).join('');
    }

    selectFood(foodId) {
        if (this.currentMealForSearch) {
            this.addFood(this.currentMealForSearch, foodId);
            bootstrap.Modal.getInstance(document.getElementById('foodSearchModal')).hide();
        }
    }

    generateMealPlan() {
        // Clear current meals
        this.currentMeals = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };

        // Calculate target calories per meal
        const dailyCalories = this.nutritionGoals.calories;
        const mealCalories = {
            breakfast: Math.round(dailyCalories * 0.25),
            lunch: Math.round(dailyCalories * 0.35),
            dinner: Math.round(dailyCalories * 0.3),
            snacks: Math.round(dailyCalories * 0.1)
        };

        // Generate suggestions for each meal
        Object.keys(mealCalories).forEach(meal => {
            const targetNutrition = {
                calories: mealCalories[meal],
                protein: Math.round(this.nutritionGoals.protein * (mealCalories[meal] / dailyCalories)),
                carbs: Math.round(this.nutritionGoals.carbs * (mealCalories[meal] / dailyCalories)),
                fat: Math.round(this.nutritionGoals.fat * (mealCalories[meal] / dailyCalories))
            };

            const suggestions = this.calculator.generateMealSuggestions(targetNutrition, meal);
            if (suggestions.length > 0) {
                // Add the best suggestion
                const bestSuggestion = suggestions[0];
                bestSuggestion.foods.forEach(foodName => {
                    const foodId = foodName.toLowerCase().replace(/\s+/g, '-');
                    if (this.calculator.getFoodInfo(foodId)) {
                        this.addFood(meal, foodId);
                    }
                });
            }
        });

        // Update displays
        this.updateAllMealDisplays();
        this.updateAllNutrition();
        
        // Show success message
        this.showNotification('Meal plan generated successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML onclick events
function addFood(meal) {
    nutritionPlanner.showFoodSearchModal(meal);
}

function quickAdd(foodId, calories) {
    // Add to snacks by default, or show modal to choose meal
    nutritionPlanner.addFood('snacks', foodId);
    nutritionPlanner.showNotification(`Added ${nutritionPlanner.calculator.formatFoodName(foodId)} to snacks!`, 'success');
}

function generateMealPlan() {
    nutritionPlanner.generateMealPlan();
}

// Initialize nutrition planner
const nutritionPlanner = new NutritionPlanner();
