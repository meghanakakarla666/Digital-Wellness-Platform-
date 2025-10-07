class NutritionCalculator {
    constructor() {
        this.foodDatabase = {
            // Fruits
            'apple': { calories: 80, protein: 0.4, carbs: 21, fat: 0.3, fiber: 4.0, category: 'fruit' },
            'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, category: 'fruit' },
            'orange': { calories: 65, protein: 1.3, carbs: 16, fat: 0.2, fiber: 3.4, category: 'fruit' },
            'strawberries': { calories: 45, protein: 1.0, carbs: 11, fat: 0.4, fiber: 2.9, category: 'fruit' },
            'grapes': { calories: 85, protein: 0.9, carbs: 22, fat: 0.2, fiber: 1.1, category: 'fruit' },
            
            // Vegetables
            'broccoli': { calories: 55, protein: 4.6, carbs: 11, fat: 0.6, fiber: 5.2, category: 'vegetable' },
            'carrots': { calories: 50, protein: 1.0, carbs: 12, fat: 0.2, fiber: 3.4, category: 'vegetable' },
            'spinach': { calories: 20, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, category: 'vegetable' },
            'bell-pepper': { calories: 25, protein: 1.0, carbs: 6, fat: 0.2, fiber: 2.0, category: 'vegetable' },
            'tomato': { calories: 20, protein: 1.0, carbs: 4.3, fat: 0.2, fiber: 1.2, category: 'vegetable' },
            
            // Proteins
            'chicken-breast': { calories: 185, protein: 35, carbs: 0, fat: 4.0, fiber: 0, category: 'protein' },
            'salmon': { calories: 206, protein: 28, carbs: 0, fat: 9.0, fiber: 0, category: 'protein' },
            'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, category: 'protein' },
            'greek-yogurt': { calories: 130, protein: 15, carbs: 9, fat: 5.0, fiber: 0, category: 'protein' },
            'tofu': { calories: 94, protein: 10, carbs: 3, fat: 6.0, fiber: 2.0, category: 'protein' },
            
            // Grains
            'brown-rice': { calories: 110, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, category: 'grain' },
            'quinoa': { calories: 160, protein: 6.0, carbs: 29, fat: 2.5, fiber: 3.0, category: 'grain' },
            'oatmeal': { calories: 150, protein: 5.0, carbs: 27, fat: 3.0, fiber: 4.0, category: 'grain' },
            'whole-wheat-bread': { calories: 80, protein: 4.0, carbs: 14, fat: 1.0, fiber: 2.0, category: 'grain' },
            'pasta': { calories: 220, protein: 8.0, carbs: 44, fat: 1.0, fiber: 3.0, category: 'grain' },
            
            // Nuts & Seeds
            'almonds': { calories: 160, protein: 6.0, carbs: 6, fat: 14, fiber: 3.5, category: 'nuts' },
            'walnuts': { calories: 185, protein: 4.0, carbs: 4, fat: 18, fiber: 2.0, category: 'nuts' },
            'chia-seeds': { calories: 140, protein: 5.0, carbs: 12, fat: 9, fiber: 10, category: 'seeds' },
            
            // Dairy
            'milk': { calories: 150, protein: 8.0, carbs: 12, fat: 8.0, fiber: 0, category: 'dairy' },
            'cheese': { calories: 115, protein: 7.0, carbs: 1, fat: 9.0, fiber: 0, category: 'dairy' },
            
            // Snacks
            'dark-chocolate': { calories: 155, protein: 2.0, carbs: 13, fat: 12, fiber: 3.0, category: 'snack' }
        };

        this.dailyGoals = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fat: 65,
            fiber: 25
        };

        this.recommendedRanges = {
            calories: { min: 1800, max: 2200 },
            protein: { min: 120, max: 180 },
            carbs: { min: 200, max: 300 },
            fat: { min: 50, max: 80 },
            fiber: { min: 20, max: 35 }
        };
    }

    // Calculate daily nutrition goals based on user data
    calculatePersonalizedGoals(userdata) {
        if (!userdata) return this.dailyGoals;

        const weight = parseFloat(userdata.weight) || 70;
        const height = parseFloat(userdata.height) || 170;
        const age = parseInt(userdata.age) || 30;
        const gender = userdata.gender || 'male';
        const activityLevel = userdata.activityLevel || 'moderate';

        // Calculate BMR
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Apply activity multiplier
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            very: 1.725
        };

        const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

        // Calculate macronutrient goals
        const calories = Math.round(tdee);
        const protein = Math.round(weight * 2.2); // 2.2g per kg body weight
        const fat = Math.round(calories * 0.25 / 9); // 25% of calories from fat
        const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs
        const fiber = Math.round(calories / 1000 * 14); // 14g per 1000 calories

        return {
            calories,
            protein,
            carbs,
            fat,
            fiber
        };
    }

    // Get food information
    getFoodInfo(foodId) {
        return this.foodDatabase[foodId] || null;
    }

    // Search foods by name
    searchFoods(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const [id, food] of Object.entries(this.foodDatabase)) {
            const displayName = this.formatFoodName(id);
            if (displayName.toLowerCase().includes(searchTerm)) {
                results.push({
                    id,
                    name: displayName,
                    ...food
                });
            }
        }

        return results.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Format food name for display
    formatFoodName(foodId) {
        return foodId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Calculate total nutrition for a meal or day
    calculateTotalNutrition(foods) {
        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
        };

        foods.forEach(food => {
            const foodInfo = this.getFoodInfo(food.id);
            if (foodInfo) {
                const multiplier = (food.quantity || 1) * (food.servingSize || 1);
                totals.calories += foodInfo.calories * multiplier;
                totals.protein += foodInfo.protein * multiplier;
                totals.carbs += foodInfo.carbs * multiplier;
                totals.fat += foodInfo.fat * multiplier;
                totals.fiber += foodInfo.fiber * multiplier;
            }
        });

        // Round to 1 decimal place
        Object.keys(totals).forEach(key => {
            totals[key] = Math.round(totals[key] * 10) / 10;
        });

        return totals;
    }

    // Analyze nutrition and provide recommendations
    analyzeNutrition(currentNutrition, goals) {
        const analysis = {
            alerts: [],
            recommendations: [],
            scores: {}
        };

        // Calculate percentage of goals met
        Object.keys(goals).forEach(nutrient => {
            const current = currentNutrition[nutrient] || 0;
            const goal = goals[nutrient];
            const percentage = (current / goal) * 100;
            analysis.scores[nutrient] = Math.round(percentage);

            // Generate alerts based on ranges
            if (percentage < 70) {
                analysis.alerts.push({
                    type: 'deficiency',
                    nutrient,
                    message: `Low ${nutrient}: ${current}/${goal} (${Math.round(percentage)}%)`
                });
            } else if (percentage > 130) {
                analysis.alerts.push({
                    type: 'excess',
                    nutrient,
                    message: `High ${nutrient}: ${current}/${goal} (${Math.round(percentage)}%)`
                });
            } else if (percentage >= 90 && percentage <= 110) {
                analysis.alerts.push({
                    type: 'good',
                    nutrient,
                    message: `Great ${nutrient} balance: ${current}/${goal}`
                });
            }
        });

        // Generate specific recommendations
        if (analysis.scores.protein < 80) {
            analysis.recommendations.push({
                icon: '🍗',
                title: 'Increase Protein',
                description: 'Add lean meats, fish, eggs, or legumes to meet your protein goals.'
            });
        }

        if (analysis.scores.fiber < 70) {
            analysis.recommendations.push({
                icon: '🥗',
                title: 'More Fiber',
                description: 'Include more fruits, vegetables, and whole grains for better digestion.'
            });
        }

        if (analysis.scores.calories > 120) {
            analysis.recommendations.push({
                icon: '⚖️',
                title: 'Moderate Portions',
                description: 'Consider smaller portions or lower-calorie alternatives.'
            });
        }

        return analysis;
    }

    // Generate meal suggestions based on nutritional needs
    generateMealSuggestions(targetNutrition, mealType = 'any') {
        const suggestions = [];
        const targetCalories = targetNutrition.calories || 500;

        // Define meal combinations
        const mealCombinations = {
            breakfast: [
                ['oatmeal', 'banana', 'almonds'],
                ['eggs', 'whole-wheat-bread', 'orange'],
                ['greek-yogurt', 'strawberries', 'chia-seeds']
            ],
            lunch: [
                ['chicken-breast', 'brown-rice', 'broccoli'],
                ['salmon', 'quinoa', 'spinach'],
                ['tofu', 'pasta', 'bell-pepper']
            ],
            dinner: [
                ['chicken-breast', 'quinoa', 'carrots'],
                ['salmon', 'brown-rice', 'spinach'],
                ['eggs', 'pasta', 'tomato']
            ],
            snack: [
                ['apple', 'almonds'],
                ['greek-yogurt', 'strawberries'],
                ['dark-chocolate', 'walnuts']
            ]
        };

        const combinations = mealCombinations[mealType] || [
            ...mealCombinations.breakfast,
            ...mealCombinations.lunch,
            ...mealCombinations.dinner
        ];

        combinations.forEach(combo => {
            const foods = combo.map(id => ({ id, quantity: 1, servingSize: 1 }));
            const nutrition = this.calculateTotalNutrition(foods);
            
            if (Math.abs(nutrition.calories - targetCalories) < targetCalories * 0.3) {
                suggestions.push({
                    foods: combo.map(id => this.formatFoodName(id)),
                    nutrition,
                    score: this.calculateMealScore(nutrition, targetNutrition)
                });
            }
        });

        return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    // Calculate meal quality score
    calculateMealScore(mealNutrition, targetNutrition) {
        let score = 100;

        Object.keys(targetNutrition).forEach(nutrient => {
            const target = targetNutrition[nutrient];
            const actual = mealNutrition[nutrient];
            const difference = Math.abs(actual - target) / target;
            score -= difference * 20; // Penalize deviations
        });

        return Math.max(0, score);
    }

    // Get nutrition breakdown for visualization
    getNutritionBreakdown(currentNutrition) {
        const total = currentNutrition.protein + currentNutrition.carbs + currentNutrition.fat;
        
        if (total === 0) {
            return {
                protein: 33.33,
                carbs: 33.33,
                fat: 33.33
            };
        }

        return {
            protein: (currentNutrition.protein / total) * 100,
            carbs: (currentNutrition.carbs / total) * 100,
            fat: (currentNutrition.fat / total) * 100
        };
    }

    // Get all foods by category
    getFoodsByCategory() {
        const categories = {};
        
        Object.entries(this.foodDatabase).forEach(([id, food]) => {
            if (!categories[food.category]) {
                categories[food.category] = [];
            }
            categories[food.category].push({
                id,
                name: this.formatFoodName(id),
                ...food
            });
        });

        return categories;
    }
}

// Export for use in other modules
window.NutritionCalculator = NutritionCalculator;
