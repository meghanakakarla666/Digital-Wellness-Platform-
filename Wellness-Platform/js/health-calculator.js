class HealthCalculator {
    constructor() {
        this.bmiRanges = {
            underweight: { min: 0, max: 18.4, status: 'Underweight', class: 'status-warning' },
            normal: { min: 18.5, max: 24.9, status: 'Normal', class: 'status-normal' },
            overweight: { min: 25, max: 29.9, status: 'Overweight', class: 'status-warning' },
            obese: { min: 30, max: 100, status: 'Obese', class: 'status-danger' }
        };

        this.activityMultipliers = {
            sedentary: { factor: 1.2, label: 'Sedentary', score: 1 },
            light: { factor: 1.375, label: 'Light Activity', score: 2 },
            moderate: { factor: 1.55, label: 'Moderate Activity', score: 3 },
            very: { factor: 1.725, label: 'Very Active', score: 4 }
        };
    }

    calculateBMI(weight, height) {
        if (!weight || !height) return null;
        
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return Math.round(bmi * 10) / 10;
    }

    getBMICategory(bmi) {
        if (!bmi) return null;
        
        for (const [category, range] of Object.entries(this.bmiRanges)) {
            if (bmi >= range.min && bmi <= range.max) {
                return {
                    category,
                    status: range.status,
                    class: range.class,
                    range
                };
            }
        }
        return null;
    }

    calculateBodyFat(bmi, age, gender) {
        if (!bmi || !age || !gender) return null;
        
        let bodyFat;
        if (gender === 'male') {
            bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
        } else if (gender === 'female') {
            bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
        } else {
            // Use average for other genders
            bodyFat = (1.20 * bmi) + (0.23 * age) - 10.8;
        }
        
        return Math.max(0, Math.round(bodyFat * 10) / 10);
    }

    calculateHealthScore(formData) {
        let score = 0;
        const maxScore = 100;

        // Breakfast habits (15 points)
        if (formData.breakfast === 'yes') score += 15;
        else if (formData.breakfast === 'sometimes') score += 8;

        // Self-rated health (25 points)
        if (formData.healthRating) {
            score += (parseInt(formData.healthRating) / 10) * 25;
        }

        // Activity level (20 points)
        if (formData.activityLevel) {
            const activity = this.activityMultipliers[formData.activityLevel];
            score += activity ? (activity.score / 4) * 20 : 0;
        }

        // Sleep (15 points)
        if (formData.sleepHours) {
            const sleepScore = {
                'less-than-5': 3,
                '5-6': 8,
                '7-8': 15,
                'more-than-8': 12
            };
            score += sleepScore[formData.sleepHours] || 0;
        }

        // Smoking (10 points)
        if (formData.smoking === 'never') score += 10;
        else if (formData.smoking === 'former') score += 7;

        // Nutrition habits (15 points)
        if (formData.fruitsVeggies) {
            const nutritionScore = {
                '0-1': 2,
                '2-3': 6,
                '4-5': 12,
                '6-plus': 15
            };
            score += nutritionScore[formData.fruitsVeggies] || 0;
        }

        return Math.min(maxScore, Math.round(score));
    }

    calculateRiskLevel(bmi, healthScore, age, formData) {
        let riskFactors = 0;

        // BMI risk
        const bmiCategory = this.getBMICategory(bmi);
        if (bmiCategory) {
            if (bmiCategory.category === 'obese') riskFactors += 3;
            else if (bmiCategory.category === 'overweight') riskFactors += 2;
            else if (bmiCategory.category === 'underweight') riskFactors += 1;
        }

        // Age risk
        if (age > 65) riskFactors += 2;
        else if (age > 45) riskFactors += 1;

        // Lifestyle risks
        if (formData.smoking === 'current') riskFactors += 3;
        if (formData.activityLevel === 'sedentary') riskFactors += 2;
        if (formData.sleepHours === 'less-than-5') riskFactors += 2;

        // Health score risk
        if (healthScore < 40) riskFactors += 3;
        else if (healthScore < 60) riskFactors += 2;
        else if (healthScore < 80) riskFactors += 1;

        // Determine risk level
        if (riskFactors >= 8) return { level: 'Extreme Risk', class: 'status-danger', score: 4 };
        else if (riskFactors >= 5) return { level: 'Very Risky', class: 'status-danger', score: 3 };
        else if (riskFactors >= 3) return { level: 'Risky', class: 'status-warning', score: 2 };
        else return { level: 'Normal', class: 'status-normal', score: 1 };
    }

    generateRecommendations(formData, bmi, healthScore, riskLevel) {
        const recommendations = [];

        // BMI-based recommendations
        const bmiCategory = this.getBMICategory(bmi);
        if (bmiCategory) {
            if (bmiCategory.category === 'underweight') {
                recommendations.push({
                    icon: '⚖️',
                    title: 'Weight Gain Strategy',
                    description: 'Consider consulting a nutritionist for a healthy weight gain plan with nutrient-dense foods.'
                });
            } else if (bmiCategory.category === 'overweight' || bmiCategory.category === 'obese') {
                recommendations.push({
                    icon: '🏃‍♂️',
                    title: 'Weight Management',
                    description: 'Focus on gradual weight loss through balanced nutrition and regular physical activity.'
                });
            }
        }

        // Activity recommendations
        if (formData.activityLevel === 'sedentary') {
            recommendations.push({
                icon: '💪',
                title: 'Increase Physical Activity',
                description: 'Start with 30 minutes of moderate exercise 3-4 times per week. Even walking counts!'
            });
        }

        // Nutrition recommendations
        if (formData.breakfast !== 'yes') {
            recommendations.push({
                icon: '🍳',
                title: 'Establish Breakfast Routine',
                description: 'Regular breakfast helps maintain stable energy levels and supports healthy metabolism.'
            });
        }

        if (formData.fruitsVeggies === '0-1' || formData.fruitsVeggies === '2-3') {
            recommendations.push({
                icon: '🥗',
                title: 'Increase Fruits & Vegetables',
                description: 'Aim for 5-9 servings of colorful fruits and vegetables daily for optimal nutrition.'
            });
        }

        // Sleep recommendations
        if (formData.sleepHours === 'less-than-5' || formData.sleepHours === '5-6') {
            recommendations.push({
                icon: '😴',
                title: 'Improve Sleep Quality',
                description: 'Aim for 7-9 hours of quality sleep nightly. Good sleep is crucial for health and recovery.'
            });
        }

        // Smoking recommendations
        if (formData.smoking === 'current') {
            recommendations.push({
                icon: '🚭',
                title: 'Smoking Cessation Support',
                description: 'Consider speaking with a healthcare provider about smoking cessation programs and resources.'
            });
        }

        // Water intake
        if (formData.waterIntake === 'less-than-4' || formData.waterIntake === '4-6') {
            recommendations.push({
                icon: '💧',
                title: 'Hydration Goals',
                description: 'Increase daily water intake to 8+ glasses. Proper hydration supports all body functions.'
            });
        }

        // General health recommendations based on score
        if (healthScore < 60) {
            recommendations.push({
                icon: '👩‍⚕️',
                title: 'Healthcare Consultation',
                description: 'Consider scheduling a comprehensive health check-up with your healthcare provider.'
            });
        }

        return recommendations;
    }

    calculateIdealWeight(height, gender, age) {
        if (!height) return null;
        
        const heightInCm = height;
        let idealWeight;
        
        if (gender === 'male') {
            // Robinson formula for men
            idealWeight = 52 + (1.9 * ((heightInCm - 152.4) / 2.54));
        } else {
            // Robinson formula for women
            idealWeight = 49 + (1.7 * ((heightInCm - 152.4) / 2.54));
        }
        
        return Math.round(idealWeight * 10) / 10;
    }

    calculateBMR(weight, height, age, gender) {
        if (!weight || !height || !age || !gender) return null;
        
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        
        return Math.round(bmr);
    }

    calculateTDEE(bmr, activityLevel) {
        if (!bmr || !activityLevel) return null;
        
        const multiplier = this.activityMultipliers[activityLevel];
        return multiplier ? Math.round(bmr * multiplier.factor) : null;
    }
}

// Export for use in other modules
window.HealthCalculator = HealthCalculator;
