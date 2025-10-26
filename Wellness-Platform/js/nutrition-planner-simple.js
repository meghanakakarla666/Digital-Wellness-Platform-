class SimpleNutritionPlanner {
    constructor() {
        this.calculator = new NutritionCalculator();
        this.meals = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };
        this.goals = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fat: 65
        };
        this.init();
    }

    init() {
        // Set up goals based on user data
        this.loadUserData();
        this.setupGoals();
        this.loadSavedMeals();
        this.updateAllDisplays();
        this.createProgressChart();
    }

    loadUserData() {
        const assessmentData = localStorage.getItem('wellnessAssessment');
        if (assessmentData) {
            try {
                const assessment = JSON.parse(assessmentData);
                this.userData = assessment.formData;
                this.goals = this.calculator.calculatePersonalizedGoals(this.userData);
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        }
    }

    setupGoals() {
        // Update goal displays
        document.getElementById('calorieGoal').textContent = Math.round(this.goals.calories);
        document.getElementById('proteinGoal').textContent = Math.round(this.goals.protein);
        document.getElementById('carbGoal').textContent = Math.round(this.goals.carbs);
        document.getElementById('fatGoal').textContent = Math.round(this.goals.fat);
    }

    loadSavedMeals() {
        const savedMeals = localStorage.getItem('simpleMealPlan');
        if (savedMeals) {
            try {
                this.meals = JSON.parse(savedMeals);
            } catch (e) {
                console.error('Error loading meals:', e);
            }
        }
    }

    saveMeals() {
        localStorage.setItem('simpleMealPlan', JSON.stringify(this.meals));
    }

    addFoodToMeal(meal, foodName, calories, protein = 0, carbs = 0, fat = 0) {
        const food = {
            name: foodName,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            id: Date.now() + Math.random()
        };
        
        this.meals[meal].push(food);
        this.updateMealDisplay(meal);
        this.updateStats();
        this.saveMeals();
    }

    removeFoodFromMeal(meal, foodId) {
        this.meals[meal] = this.meals[meal].filter(food => food.id !== foodId);
        this.updateMealDisplay(meal);
        this.updateStats();
        this.saveMeals();
    }

    updateMealDisplay(meal) {
        const mealContainer = document.getElementById(`${meal}-foods`);
        const mealCard = document.querySelector(`[data-meal="${meal}"]`);
        const caloriesSpan = mealCard.querySelector('.meal-calories');
        
        const foods = this.meals[meal];
        const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
        
        caloriesSpan.textContent = `${Math.round(totalCalories)} cal`;
        
        if (foods.length === 0) {
            mealContainer.innerHTML = '<div class="empty-meal">Tap + to add food</div>';
        } else {
            mealContainer.innerHTML = foods.map(food => `
                <span class="food-tag" onclick="simplePlanner.removeFoodFromMeal('${meal}', ${food.id})">
                    ${food.name} (${food.calories})
                    <span style="margin-left: 5px; cursor: pointer;">×</span>
                </span>
            `).join('');
        }
    }

    updateStats() {
        const totals = this.calculateTotals();
        
        // Update stat cards
        document.getElementById('totalCalories').textContent = Math.round(totals.calories);
        document.getElementById('totalProtein').textContent = Math.round(totals.protein);
        document.getElementById('totalCarbs').textContent = Math.round(totals.carbs);
        document.getElementById('totalFat').textContent = Math.round(totals.fat);
        
        // Update daily score (simple calculation based on goal achievement)
        const score = this.calculateDailyScore(totals);
        document.getElementById('dailyScore').textContent = score;
        
        // Update progress chart
        this.updateProgressChart(totals);
    }

    calculateTotals() {
        const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        Object.values(this.meals).forEach(mealFoods => {
            mealFoods.forEach(food => {
                totals.calories += food.calories || 0;
                totals.protein += food.protein || 0;
                totals.carbs += food.carbs || 0;
                totals.fat += food.fat || 0;
            });
        });
        
        return totals;
    }

    calculateDailyScore(totals) {
        const calorieScore = Math.min(100, (totals.calories / this.goals.calories) * 100);
        const proteinScore = Math.min(100, (totals.protein / this.goals.protein) * 100);
        const avgScore = (calorieScore + proteinScore) / 2;
        return Math.round(avgScore);
    }

    createProgressChart() {
        const ctx = document.getElementById('nutritionProgress');
        if (!ctx) return;
        
        this.progressChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Calories', 'Protein', 'Carbs', 'Fats'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { 
                            padding: 10, 
                            usePointStyle: true,
                            font: { size: 11 }
                        }
                    }
                },
                cutout: '65%',
                layout: {
                    padding: 5
                }
            }
        });
    }

    updateProgressChart(totals) {
        if (!this.progressChart) return;
        
        const percentages = [
            Math.min(100, (totals.calories / this.goals.calories) * 100),
            Math.min(100, (totals.protein / this.goals.protein) * 100),
            Math.min(100, (totals.carbs / this.goals.carbs) * 100),
            Math.min(100, (totals.fat / this.goals.fat) * 100)
        ];
        
        this.progressChart.data.datasets[0].data = percentages;
        this.progressChart.update();
    }

    updateAllDisplays() {
        Object.keys(this.meals).forEach(meal => {
            this.updateMealDisplay(meal);
        });
        this.updateStats();
    }

    openFoodSelector(meal) {
        // Create a simple modal with common foods
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Food to ${meal.charAt(0).toUpperCase() + meal.slice(1)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-2">
                            ${this.getCommonFoods().map(food => `
                                <div class="col-6">
                                    <button class="btn btn-outline-primary w-100 mb-2" 
                                            onclick="simplePlanner.quickAddFood('${meal}', '${food.name}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fat}); document.querySelector('.modal.show .btn-close').click();">
                                        ${food.emoji} ${food.name}<br>
                                        <small>${food.calories} cal</small>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Clean up modal after hiding
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    getCommonFoods() {
        return [
            { name: 'Apple', emoji: '🍎', calories: 80, protein: 0, carbs: 21, fat: 0 },
            { name: 'Banana', emoji: '🍌', calories: 105, protein: 1, carbs: 27, fat: 0 },
            { name: 'Chicken Breast', emoji: '🍗', calories: 185, protein: 35, carbs: 0, fat: 4 },
            { name: 'Brown Rice', emoji: '🍚', calories: 110, protein: 3, carbs: 23, fat: 1 },
            { name: 'Broccoli', emoji: '🥦', calories: 55, protein: 4, carbs: 11, fat: 1 },
            { name: 'Salmon', emoji: '🐟', calories: 206, protein: 22, carbs: 0, fat: 12 },
            { name: 'Eggs', emoji: '🥚', calories: 155, protein: 13, carbs: 1, fat: 11 },
            { name: 'Oatmeal', emoji: '🥣', calories: 150, protein: 5, carbs: 27, fat: 3 },
            { name: 'Greek Yogurt', emoji: '🥛', calories: 130, protein: 20, carbs: 9, fat: 0 },
            { name: 'Avocado', emoji: '🥑', calories: 160, protein: 2, carbs: 9, fat: 15 },
            { name: 'Sweet Potato', emoji: '🍠', calories: 112, protein: 2, carbs: 26, fat: 0 },
            { name: 'Almonds', emoji: '🥜', calories: 164, protein: 6, carbs: 6, fat: 14 }
        ];
    }

    quickAddFood(meal, name, calories, protein, carbs, fat) {
        this.addFoodToMeal(meal, name, calories, protein, carbs, fat);
        this.showToast(`Added ${name} to ${meal}!`);
    }

    generateSmartMealPlan() {
        // Clear all meals
        this.meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
        
        // Add balanced foods to each meal
        const mealPlans = {
            breakfast: [
                { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3 },
                { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
                { name: 'Greek Yogurt', calories: 130, protein: 20, carbs: 9, fat: 0 }
            ],
            lunch: [
                { name: 'Chicken Breast', calories: 185, protein: 35, carbs: 0, fat: 4 },
                { name: 'Brown Rice', calories: 110, protein: 3, carbs: 23, fat: 1 },
                { name: 'Broccoli', calories: 55, protein: 4, carbs: 11, fat: 1 }
            ],
            dinner: [
                { name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 12 },
                { name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0 },
                { name: 'Mixed Vegetables', calories: 40, protein: 2, carbs: 8, fat: 0 }
            ],
            snacks: [
                { name: 'Apple', calories: 80, protein: 0, carbs: 21, fat: 0 },
                { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14 }
            ]
        };
        
        Object.keys(mealPlans).forEach(meal => {
            mealPlans[meal].forEach(food => {
                this.addFoodToMeal(meal, food.name, food.calories, food.protein, food.carbs, food.fat);
            });
        });
        
        this.showToast('Smart meal plan generated!');
    }

    clearAllMeals() {
        this.meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
        this.updateAllDisplays();
        this.saveMeals();
        this.showToast('All meals cleared!');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 3000);
    }
}

// Global functions for the interface
function openFoodSelector(meal) {
    simplePlanner.openFoodSelector(meal);
}

function generateSmartMealPlan() {
    simplePlanner.generateSmartMealPlan();
}

function clearAllMeals() {
    simplePlanner.clearAllMeals();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.simplePlanner = new SimpleNutritionPlanner();
});
