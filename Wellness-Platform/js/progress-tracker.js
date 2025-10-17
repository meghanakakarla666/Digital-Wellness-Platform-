class ProgressTracker {
    constructor() {
        this.currentTimeRange = '7d';
        this.currentMetric = 'wellness';
        this.charts = {};
        this.progressData = this.generateProgressData();
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserProgress();
            this.updateOverallStats();
        });
    }

    debugLocalStorage() {
        console.log('=== LOCALSTORAGE DEBUG ===');
        console.log('All localStorage keys:', Object.keys(localStorage));
        
        // Check different possible keys where assessment data might be stored
        const possibleKeys = [
            'assessmentHistory', 
            'wellnessAssessment', 
            'userAssessments', 
            'assessmentData',
            'wellnessResults',
            'userProgress'
        ];
        
        possibleKeys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                console.log(`${key}:`, JSON.parse(data));
            } else {
                console.log(`${key}: null`);
            }
        });
        console.log('=== END DEBUG ===');
    }

    generateProgressData() {
        // Generate realistic progress data for the past 90 days
        const data = {
            wellness: [],
            bmi: [],
            calories: [],
            activity: [],
            sleep: []
        };

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);

        for (let i = 0; i < 90; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            // Generate trending upward data with some variation
            const progress = (i / 90) * 0.3 + 0.6; // Base improvement trend
            const variation = (Math.random() - 0.5) * 0.2; // Random variation
            
            data.wellness.push({
                date: date.toISOString().split('T')[0],
                value: Math.max(40, Math.min(100, 65 + (progress * 25) + (variation * 15)))
            });

            data.bmi.push({
                date: date.toISOString().split('T')[0],
                value: Math.max(18, Math.min(35, 28 - (progress * 3) + (variation * 1)))
            });

            data.calories.push({
                date: date.toISOString().split('T')[0],
                value: Math.max(1200, Math.min(3000, 1800 + (variation * 400)))
            });

            data.activity.push({
                date: date.toISOString().split('T')[0],
                value: Math.max(0, Math.min(10, 3 + (progress * 4) + (variation * 2)))
            });

            data.sleep.push({
                date: date.toISOString().split('T')[0],
                value: Math.max(4, Math.min(10, 6.5 + (progress * 1.5) + (variation * 1)))
            });
        }

        return data;
    }

    loadUserProgress() {
        // Debug what's in localStorage first
        this.debugLocalStorage();
        
        // Build assessment history from single assessments
        const assessmentHistory = this.buildAssessmentHistory();
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        
        console.log('Assessment history length after building:', assessmentHistory.length);
        
        if (assessmentHistory.length > 1) {
            console.log('Using multiple assessments from history');
            this.replaceWithRealData(assessmentHistory);
        } else if (wellnessAssessment) {
            try {
                console.log('Using single wellness assessment');
                const assessment = JSON.parse(wellnessAssessment);
                this.userData = assessment;
                this.updateTodayDataFromSingleAssessment(assessment);
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        } else {
            console.log('No user data found, using generated data');
        }
        
        // Keep only these essential updates
        this.updateStatsFromRealData();
        this.createMainTrendChart();
        this.createComparisonChart();
    }

    updateTodayData(assessment) {
        const today = new Date().toISOString().split('T')[0];
        const todayIndex = this.progressData.wellness.length - 1;
        
        if (assessment.results) {
            // Update with real BMI and health score if available
            this.progressData.wellness[todayIndex].value = assessment.results.healthScore || this.progressData.wellness[todayIndex].value;
            this.progressData.bmi[todayIndex].value = assessment.results.bmi || this.progressData.bmi[todayIndex].value;
        }
    }

    updateTodayDataFromSingleAssessment(assessment) {
        console.log('Processing single assessment:', assessment);
        
        const today = new Date().toISOString().split('T')[0];
        const formData = assessment.formData;
        
        // Calculate BMI from the form data
        const height = parseFloat(formData.height);
        const weight = parseFloat(formData.weight);
        const bmi = weight / ((height / 100) * (height / 100));
        
        // Convert health rating to wellness score (1-10 to 0-100)
        const healthRating = parseFloat(formData.healthRating);
        const wellnessScore = (healthRating / 10) * 100;
        
        // Calculate estimated calories based on weight, height, age, gender, activity
        const age = parseFloat(formData.age);
        const gender = formData.gender;
        const activityLevel = formData.activityLevel;
        
        let bmr;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }
        
        // Activity multiplier
        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very-active': 1.9
        };
        
        const dailyCalories = bmr * (activityMultipliers[activityLevel] || 1.375);
        
        // Get sleep hours - FIXED MAPPING
        const sleepHours = formData.sleepHours;
        let sleepValue = 7; // default
        if (sleepHours === 'less-than-5') sleepValue = 4;        // Your actual value
        else if (sleepHours === '4-5') sleepValue = 4.5;
        else if (sleepHours === '5-6') sleepValue = 5.5;
        else if (sleepHours === '6-7') sleepValue = 6.5;
        else if (sleepHours === '7-8') sleepValue = 7.5;
        else if (sleepHours === '8-9') sleepValue = 8.5;
        else if (sleepHours === 'more-than-8') sleepValue = 9;   // Your other value
        else if (sleepHours === '8+') sleepValue = 8.5;
        
        // Calculate activity level score - FIXED MAPPING
        let activityScore = 5; // default
        if (activityLevel === 'sedentary') activityScore = 2;
        else if (activityLevel === 'light') activityScore = 4;
        else if (activityLevel === 'moderate') activityScore = 6;
        else if (activityLevel === 'active') activityScore = 8;
        else if (activityLevel === 'very') activityScore = 10;           // Your actual value
        else if (activityLevel === 'very-active') activityScore = 10;   // Alternative
        
        console.log('Calculated values:', {
            bmi: bmi.toFixed(1),
            wellnessScore: wellnessScore.toFixed(1),
            dailyCalories: dailyCalories.toFixed(0),
            sleepHours: sleepValue,
            activityScore
        });
        
        // Replace the last 3 days of data with real assessment data
        const daysToReplace = 3;
        for (let i = 0; i < daysToReplace; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const index = this.progressData.wellness.length - 1 - i;
            if (index >= 0) {
                // Add some variation for historical days, but keep today's data accurate
                const variation = i === 0 ? 0 : (Math.random() - 0.5) * 5;
                
                this.progressData.wellness[index] = {
                    date: dateStr,
                    value: Math.max(20, Math.min(100, wellnessScore + variation))
                };
                
                this.progressData.bmi[index] = {
                    date: dateStr,
                    value: bmi + (i === 0 ? 0 : (Math.random() - 0.5) * 0.5)
                };
                
                this.progressData.calories[index] = {
                    date: dateStr,
                    value: dailyCalories + (i === 0 ? 0 : (Math.random() - 0.5) * 100)
                };
                
                this.progressData.activity[index] = {
                    date: dateStr,
                    value: activityScore + (i === 0 ? 0 : (Math.random() - 0.5) * 1)
                };
                
                this.progressData.sleep[index] = {
                    date: dateStr,
                    value: sleepValue + (i === 0 ? 0 : (Math.random() - 0.5) * 0.5)
                };
            }
        }
        
        console.log('Updated progress data with real assessment:', this.progressData);
    }

    updateProgressWithRealData(assessmentHistory) {
        // Replace generated data with real assessment data
        assessmentHistory.forEach((assessment, index) => {
            const assessmentDate = assessment.date || new Date().toISOString().split('T')[0];
            
            // Find corresponding date in progress data or add new entry
            const dateIndex = this.progressData.wellness.findIndex(item => item.date === assessmentDate);
            
            if (dateIndex !== -1) {
                // Update existing date with real data
                if (assessment.healthRating) {
                    this.progressData.wellness[dateIndex].value = (assessment.healthRating / 10) * 100;
                }
                if (assessment.bmi) {
                    this.progressData.bmi[dateIndex].value = assessment.bmi;
                }
                if (assessment.weight) {
                    // Calculate calories estimate based on weight (rough estimation)
                    this.progressData.calories[dateIndex].value = assessment.weight * 25; // Basic BMR estimation
                }
            } else {
                // Add new data point
                this.progressData.wellness.push({
                    date: assessmentDate,
                    value: assessment.healthRating ? (assessment.healthRating / 10) * 100 : 75
                });
                
                if (assessment.bmi) {
                    this.progressData.bmi.push({
                        date: assessmentDate,
                        value: assessment.bmi
                    });
                }
            }
        });
        
        // Sort all arrays by date
        Object.keys(this.progressData).forEach(metric => {
            this.progressData[metric].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
    }

    replaceWithRealData(assessmentHistory) {
        console.log('Replacing generated data with real assessment data');
        
        // Clear existing progress data
        this.progressData = {
            wellness: [],
            bmi: [],
            calories: [],
            activity: [],
            sleep: []
        };
        
        // Process each assessment and create data points
        assessmentHistory.forEach((assessment, index) => {
            console.log(`Processing assessment ${index + 1}:`, assessment);
            
            const assessmentDate = assessment.date || assessment.timestamp || new Date().toISOString().split('T')[0];
            
            // Extract wellness score
            let wellnessScore = 75; // default
            if (assessment.results?.healthScore) {
                wellnessScore = assessment.results.healthScore;
            } else if (assessment.healthRating) {
                wellnessScore = (assessment.healthRating / 10) * 100;
            } else if (assessment.overallScore) {
                wellnessScore = assessment.overallScore;
            }
            
            // Extract BMI
            let bmi = 25; // default
            if (assessment.results?.bmi) {
                bmi = assessment.results.bmi;
            } else if (assessment.bmi) {
                bmi = assessment.bmi;
            } else if (assessment.weight && assessment.height) {
                const heightInM = assessment.height / 100;
                bmi = assessment.weight / (heightInM * heightInM);
            }
            
            // Calculate estimated calories
            let calories = 2000; // default
            if (assessment.weight) {
                calories = assessment.weight * 25; // Basic BMR estimation
            } else if (bmi && assessment.height) {
                const heightInM = assessment.height / 100;
                const estimatedWeight = bmi * heightInM * heightInM;
                calories = estimatedWeight * 25;
            }
            
            // Add data points
            this.progressData.wellness.push({
                date: assessmentDate,
                value: wellnessScore
            });
            
            this.progressData.bmi.push({
                date: assessmentDate,
                value: bmi
            });
            
            this.progressData.calories.push({
                date: assessmentDate,
                value: calories
            });
            
            // Generate reasonable activity and sleep data for now
            this.progressData.activity.push({
                date: assessmentDate,
                value: Math.min(10, wellnessScore / 10) // Scale wellness to activity level
            });
            
            this.progressData.sleep.push({
                date: assessmentDate,
                value: Math.min(10, Math.max(5, 6 + (wellnessScore - 50) / 25)) // Sleep based on wellness
            });
        });
        
        // Fill in missing days if needed (only recent ones)
        this.fillRecentDays();
        
        console.log('Updated progress data with real assessments:', this.progressData);
    }

    fillRecentDays() {
        // If we have less than 7 days of data, fill with generated data for recent days
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        
        if (this.progressData.wellness.length < 7) {
            const lastRealData = this.progressData.wellness[this.progressData.wellness.length - 1];
            const baseWellness = lastRealData ? lastRealData.value : 75;
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                // Check if we already have data for this date
                const exists = this.progressData.wellness.some(item => item.date === dateStr);
                if (!exists) {
                    const variation = (Math.random() - 0.5) * 10;
                    
                    this.progressData.wellness.push({
                        date: dateStr,
                        value: Math.max(40, Math.min(100, baseWellness + variation))
                    });
                    
                    // Add corresponding data for other metrics
                    this.progressData.bmi.push({
                        date: dateStr,
                        value: 25 + (Math.random() - 0.5) * 2
                    });
                    
                    this.progressData.calories.push({
                        date: dateStr,
                        value: 2000 + (Math.random() - 0.5) * 400
                    });
                    
                    this.progressData.activity.push({
                        date: dateStr,
                        value: Math.max(0, Math.min(10, 5 + (Math.random() - 0.5) * 3))
                    });
                    
                    this.progressData.sleep.push({
                        date: dateStr,
                        value: Math.max(5, Math.min(9, 7 + (Math.random() - 0.5) * 2))
                    });
                }
            }
        }
        
        // Sort all arrays by date
        Object.keys(this.progressData).forEach(metric => {
            this.progressData[metric].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
    }

    updateStatsFromRealData() {
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');

        if (wellnessAssessment) {
            try {
                const assessment = JSON.parse(wellnessAssessment);
                const formData = assessment.formData;
                
                console.log('Full assessment data for wellness score:', formData);
                
                // Calculate comprehensive wellness score from multiple factors
                let totalScore = 0;
                let factors = 0;
                
                // Health rating (self-assessment) - 25% weight
                if (formData.healthRating) {
                    totalScore += (parseFloat(formData.healthRating) / 10) * 25;
                    factors++;
                }
                
                // Sleep quality - 20% weight
                let sleepScore = 0;
                if (formData.sleepHours === 'less-than-5') sleepScore = 3;
                else if (formData.sleepHours === '5-6') sleepScore = 6;
                else if (formData.sleepHours === '6-7') sleepScore = 8;
                else if (formData.sleepHours === '7-8') sleepScore = 10;
                else if (formData.sleepHours === '8-9') sleepScore = 9;
                else if (formData.sleepHours === 'more-than-8') sleepScore = 7;
                totalScore += (sleepScore / 10) * 20;
                
                // Activity level - 20% weight
                let activityScore = 0;
                if (formData.activityLevel === 'sedentary') activityScore = 2;
                else if (formData.activityLevel === 'light') activityScore = 4;
                else if (formData.activityLevel === 'moderate') activityScore = 6;
                else if (formData.activityLevel === 'active') activityScore = 8;
                else if (formData.activityLevel === 'very') activityScore = 10;
                totalScore += (activityScore / 10) * 20;
                
                // Nutrition factors - 15% weight
                let nutritionScore = 5; // base score
                if (formData.fruitsVeggies === '6-plus') nutritionScore += 2;
                else if (formData.fruitsVeggies === '4-5') nutritionScore += 1;
                if (formData.breakfast === 'yes') nutritionScore += 1;
                if (formData.sugaryDrinks === 'never') nutritionScore += 1;
                if (formData.waterIntake === 'more-than-8') nutritionScore += 1;
                totalScore += (nutritionScore / 10) * 15;
                
                // Lifestyle factors - 10% weight
                let lifestyleScore = 5;
                if (formData.smoking === 'never') lifestyleScore += 3;
                else if (formData.smoking === 'former') lifestyleScore += 1;
                if (formData.lifestyleInfo === 'very-interested') lifestyleScore += 2;
                else if (formData.lifestyleInfo === 'interested') lifestyleScore += 1;
                totalScore += (lifestyleScore / 10) * 10;
                
                // BMI factor - 10% weight
                const height = parseFloat(formData.height);
                const weight = parseFloat(formData.weight);
                const bmi = weight / ((height / 100) * (height / 100));
                let bmiScore = 5;
                if (bmi >= 18.5 && bmi < 25) bmiScore = 10;
                else if (bmi >= 25 && bmi < 30) bmiScore = 7;
                else if (bmi >= 30) bmiScore = 4;
                else if (bmi < 18.5) bmiScore = 6;
                totalScore += (bmiScore / 10) * 10;
                
                const wellnessScore = Math.round(totalScore);
                
                console.log('Comprehensive wellness score calculation:', {
                    healthRating: formData.healthRating,
                    sleepScore: sleepScore,
                    activityScore: activityScore,
                    nutritionScore: nutritionScore,
                    lifestyleScore: lifestyleScore,
                    bmiScore: bmiScore,
                    totalScore: wellnessScore
                });
                
                // Update the displayed stats
                const overallScoreElement = document.getElementById('overallScore');
                if (overallScoreElement) {
                    overallScoreElement.textContent = wellnessScore;
                    console.log('Updated comprehensive wellness score to:', wellnessScore);
                }
                
                // Update trend indicator
                const trendElement = document.getElementById('overallTrend');
                if (trendElement) {
                    trendElement.textContent = `Comprehensive Health Score`;
                    trendElement.className = 'trend-change trend-stable mt-2';
                }
                
            } catch (e) {
                console.error('Error calculating comprehensive wellness score:', e);
            }
        }
    }

    getFilteredData(timeRange) {
        const days = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };

        const dayCount = days[timeRange] || 7;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dayCount);

        const filtered = {};
        Object.keys(this.progressData).forEach(metric => {
            filtered[metric] = this.progressData[metric].filter(item => 
                new Date(item.date) >= cutoffDate
            );
        });

        return filtered;
    }

    createMainTrendChart() {
        const ctx = document.getElementById('mainTrendChart');
        if (!ctx) return;

        const data = this.getFilteredData(this.currentTimeRange);
        const metricData = data[this.currentMetric];

        if (this.charts.mainTrend) {
            this.charts.mainTrend.destroy();
        }

        this.charts.mainTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: metricData.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                }),
                datasets: [{
                    label: this.getMetricLabel(this.currentMetric),
                    data: metricData.map(item => item.value),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y.toFixed(1);
                                const unit = this.getMetricUnit(this.currentMetric);
                                return `${context.dataset.label}: ${value}${unit}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6c757d',
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    createComparisonChart() {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx) return;

        const data = this.getFilteredData(this.currentTimeRange);
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }

        // Normalize data to 0-100 scale for comparison
        const normalizeData = (metricData, metric) => {
            const values = metricData.map(item => item.value);
            const min = Math.min(...values);
            const max = Math.max(...values);
            
            return metricData.map(item => {
                if (metric === 'bmi') {
                    // Inverse for BMI (lower is better)
                    return 100 - ((item.value - 18) / (35 - 18)) * 100;
                }
                return ((item.value - min) / (max - min)) * 100;
            });
        };

        this.charts.comparison = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.wellness.map(item => {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                }),
                datasets: [
                    {
                        label: 'Wellness Score',
                        data: normalizeData(data.wellness, 'wellness'),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Activity Level',
                        data: normalizeData(data.activity, 'activity'),
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Sleep Quality',
                        data: normalizeData(data.sleep, 'sleep'),
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6c757d',
                            callback: function(value) {
                                return value.toFixed(0) + '%';
                            }
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    updateWeeklyActivity() {
        const assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        
        // Get last 7 days of data
        const today = new Date();
        const weekDays = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            weekDays.push({
                date: date.toISOString().split('T')[0],
                dayIndex: (date.getDay() + 6) % 7, // Convert to Monday = 0
                letter: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][(date.getDay() + 6) % 7]
            });
        }
        
        // Map assessment data to days
        weekDays.forEach((day, index) => {
            let activityLevel = 'no-data';
            
            // Check if we have assessment for this day
            const dayAssessment = assessmentHistory.find(assessment => 
                assessment.timestamp && new Date(assessment.timestamp).toISOString().split('T')[0] === day.date
            );
            
            if (dayAssessment) {
                const healthRating = parseFloat(dayAssessment.formData?.healthRating || 5);
                if (healthRating >= 8) activityLevel = 'great';
                else if (healthRating >= 6) activityLevel = 'good';  
                else if (healthRating >= 4) activityLevel = 'fair';
                else activityLevel = 'poor';
            } else if (wellnessAssessment && index === 6) {
                // Use today's assessment if available
                const assessment = JSON.parse(wellnessAssessment);
                const healthRating = parseFloat(assessment.formData?.healthRating || 5);
                if (healthRating >= 8) activityLevel = 'great';
                else if (healthRating >= 6) activityLevel = 'good';
                else if (healthRating >= 4) activityLevel = 'fair';
                else activityLevel = 'poor';
            }
            
            const dayElement = document.getElementById(`day-${index}`);
            if (dayElement) {
                dayElement.className = `day-indicator day-${activityLevel}`;
                dayElement.textContent = day.letter;
            }
        });
    }

    updateGoalProgress() {
        // Update circular progress indicators
        this.updateCircularProgress('weight-progress', 70, '#28a745');
        this.updateCircularProgress('activity-progress', 80, '#17a2b8');
        this.updateCircularProgress('nutrition-progress', 90, '#ffc107');
    }

    updateAchievementsFromData() {
        const assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        
        const achievements = [];
        
        // Check for various achievements
        if (assessmentHistory.length >= 7) {
            achievements.push({
                icon: '🎯',
                title: 'First Week Complete!',
                description: `Completed ${assessmentHistory.length} days of health tracking`
            });
        } else if (wellnessAssessment) {
            achievements.push({
                icon: '🌟',
                title: 'Journey Started!',
                description: 'Completed your first wellness assessment'
            });
        }
        
        // Check for consistency
        const recentAssessments = assessmentHistory.filter(assessment => {
            const assessmentDate = new Date(assessment.timestamp);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return assessmentDate >= sevenDaysAgo;
        });
        
        if (recentAssessments.length >= 5) {
            achievements.push({
                icon: '💪',
                title: 'Consistency Champion',
                description: `${recentAssessments.length} assessments this week`
            });
        }
        
        // Check for health improvements
        if (wellnessAssessment) {
            const assessment = JSON.parse(wellnessAssessment);
            const healthRating = parseFloat(assessment.formData?.healthRating || 0);
            
            if (healthRating >= 8) {
                achievements.push({
                    icon: '🥗',
                    title: 'Health Champion',
                    description: `Excellent health rating: ${healthRating}/10`
                });
            } else if (healthRating >= 6) {
                achievements.push({
                    icon: '📈',
                    title: 'Good Progress',
                    description: `Solid health rating: ${healthRating}/10`
                });
            }
        }
        
        // Update the achievements section
        this.renderAchievements(achievements.slice(0, 3)); // Show top 3
    }

    renderAchievements(achievements) {
        const achievementsContainer = document.querySelector('.col-lg-4 .mb-4:nth-of-type(2)');
        if (!achievementsContainer) return;
        
        // Keep the title, update the cards
        const titleElement = achievementsContainer.querySelector('h5');
        
        // Clear the container but preserve the title
        achievementsContainer.innerHTML = '';
        
        // Re-add the title if it exists, otherwise create a new one
        if (titleElement) {
            achievementsContainer.appendChild(titleElement);
        } else {
            const newTitle = document.createElement('h5');
            newTitle.className = 'mb-3';
            newTitle.textContent = '🏆 Recent Achievements';
            achievementsContainer.appendChild(newTitle);
        }
        
        // Add achievement cards
        achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = 'milestone-card';
            achievementCard.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="me-3" style="font-size: 2rem;">${achievement.icon}</div>
                    <div>
                        <div class="fw-bold">${achievement.title}</div>
                        <small>${achievement.description}</small>
                    </div>
                </div>
            `;
            achievementsContainer.appendChild(achievementCard);
        });
    }

    updateSmartInsights() {
        const recentData = this.getFilteredData('7d');
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        
        const insights = [];
        
        if (recentData.wellness.length > 1) {
            const trend = recentData.wellness[recentData.wellness.length - 1].value - recentData.wellness[0].value;
            
            if (trend > 5) {
                insights.push({
                    icon: '📈',
                    title: 'Trending Up!',
                    description: `Your wellness score improved by ${Math.round(trend)}% this week. Keep up the great work!`
                });
            } else if (trend < -5) {
                insights.push({
                    icon: '⚠️',
                    title: 'Focus Needed',
                    description: `Wellness score declined by ${Math.round(Math.abs(trend))}%. Consider reviewing your habits.`
                });
            } else {
                insights.push({
                    icon: '→',
                    title: 'Steady Progress',
                    description: 'Your wellness score is stable. Consistency is key to long-term health.'
                });
            }
        }
        
        if (wellnessAssessment) {
            const assessment = JSON.parse(wellnessAssessment);
            const formData = assessment.formData;
            
            // Activity insight
            if (formData.activityLevel === 'sedentary') {
                insights.push({
                    icon: '🚶',
                    title: 'Movement Matters',
                    description: 'Consider adding 15-30 minutes of daily activity to boost your wellness score.'
                });
            } else if (formData.activityLevel === 'very-active') {
                insights.push({
                    icon: '🏃',
                    title: 'Active Lifestyle',
                    description: 'Your high activity level is contributing positively to your overall health!'
                });
            }
            
            // Sleep insight
            if (formData.sleepHours === '4-5' || formData.sleepHours === '5-6') {
                insights.push({
                    icon: '😴',
                    title: 'Sleep Priority',
                    description: 'Aim for 7-8 hours of sleep to optimize your recovery and wellness.'
                });
            }
        }
        
        this.renderInsights(insights.slice(0, 3));
    }

    renderInsights(insights) {
        const insightsContainer = document.querySelector('.col-lg-4 > div:last-child');
        if (!insightsContainer) return;
        
        // Keep the title, update the cards
        const titleElement = insightsContainer.querySelector('h5');
        
        // Clear the container but preserve the title
        insightsContainer.innerHTML = '';
        
        // Re-add the title if it exists, otherwise create a new one
        if (titleElement) {
            insightsContainer.appendChild(titleElement);
        } else {
            const newTitle = document.createElement('h5');
            newTitle.className = 'mb-3';
            newTitle.textContent = '💡 Smart Insights';
            insightsContainer.appendChild(newTitle);
        }
        
        // Add insight cards
        insights.forEach(insight => {
            const insightCard = document.createElement('div');
            insightCard.className = 'insight-card';
            insightCard.innerHTML = `
                <div class="d-flex align-items-start">
                    <span class="insight-icon">${insight.icon}</span>
                    <div>
                        <strong>${insight.title}</strong>
                        <p class="mb-1 small">${insight.description}</p>
                    </div>
                </div>
            </div>
            `;
            insightsContainer.appendChild(insightCard);
        });
    }

    getMetricLabel(metric) {
        const labels = {
            'wellness': 'Wellness Score',
            'bmi': 'BMI',
            'calories': 'Daily Calories',
            'activity': 'Activity Level',
            'sleep': 'Sleep Quality'
        };
        return labels[metric] || 'Metric';
    }

    getMetricUnit(metric) {
        const units = {
            'wellness': '/100',
            'bmi': '',
            'calories': ' cal',
            'activity': '/10',
            'sleep': ' hrs'
        };
        return units[metric] || '';
    }

    // Export data functionality
    exportProgress(format = 'json') {
        if (format === 'csv') {
            this.exportCSV();
        } else {
            this.exportJSON();
        }
    }

    exportJSON() {
        const assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        
        // Get FILTERED data based on current time range selection
        const filteredData = this.getFilteredData(this.currentTimeRange);
        
        const data = {
            exportDate: new Date().toISOString(),
            selectedTimeRange: this.currentTimeRange,
            
            // Use FILTERED progress data (not all data)
            progressData: {
                wellness: filteredData.wellness,
                bmi: filteredData.bmi,
                calories: filteredData.calories,
                activity: filteredData.activity,
                sleep: filteredData.sleep
            },
            
            // Raw user assessment data (keep as is - no filtering for now)
            rawAssessmentHistory: assessmentHistory,
            currentWellnessAssessment: wellnessAssessment ? JSON.parse(wellnessAssessment) : null,
            
            // Summary statistics for filtered data
            summary: this.generateDetailedSummary(),
            
            // Export metadata
            metadata: {
                totalDataPoints: filteredData.wellness.length,
                timeRangeSelected: this.currentTimeRange,
                dateRange: {
                    start: filteredData.wellness[0]?.date,
                    end: filteredData.wellness[filteredData.wellness.length - 1]?.date
                }
            }
        };

        console.log('Exporting JSON data:', data); // Debug log

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wellness-progress-${this.currentTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('JSON export completed'); // Debug log
    }

    exportCSV() {
        console.log('Starting CSV export'); // Debug log
        
        // Get FILTERED data based on current time range selection
        const filteredData = this.getFilteredData(this.currentTimeRange);
        
        console.log('Filtered data for CSV:', filteredData); // Debug log
        
        const csvHeaders = ['Date', 'Wellness Score', 'BMI', 'Daily Calories', 'Activity Level', 'Sleep Hours'];
        const csvRows = [csvHeaders.join(',')];
        
        // Use filtered data length instead of all data
        const maxLength = Math.max(
            filteredData.wellness.length,
            filteredData.bmi.length,
            filteredData.calories.length,
            filteredData.activity.length,
            filteredData.sleep.length
        );
        
        console.log('CSV will have', maxLength, 'data rows'); // Debug log
        
        for (let i = 0; i < maxLength; i++) {
            const row = [
                filteredData.wellness[i]?.date || '',
                filteredData.wellness[i]?.value?.toFixed(1) || '',
                filteredData.bmi[i]?.value?.toFixed(1) || '',
                filteredData.calories[i]?.value?.toFixed(0) || '',
                filteredData.activity[i]?.value?.toFixed(1) || '',
                filteredData.sleep[i]?.value?.toFixed(1) || ''
            ];
            csvRows.push(row.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        console.log('CSV content preview:', csvContent.substring(0, 200) + '...'); // Debug log
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wellness-progress-${this.currentTimeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('CSV export completed'); // Debug log
    }

    generateDetailedSummary() {
        const recentData = this.getFilteredData(this.currentTimeRange);
        
        const calculateStats = (dataArray) => {
            if (dataArray.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 };
            
            const values = dataArray.map(item => item.value);
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;
            
            return {
                avg: Math.round(avg * 10) / 10,
                min: Math.round(min * 10) / 10,
                max: Math.round(max * 10) / 10,
                trend: Math.round(trend * 10) / 10
            };
        };
        
        return {
            wellness: calculateStats(recentData.wellness),
            bmi: calculateStats(recentData.bmi),
            calories: calculateStats(recentData.calories),
            activity: calculateStats(recentData.activity),
            sleep: calculateStats(recentData.sleep),
            daysTracked: recentData.wellness.length
        };
    }

    // Replace this method to help build assessment history:
    buildAssessmentHistory() {
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        let assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        
        if (wellnessAssessment) {
            const assessment = JSON.parse(wellnessAssessment);
            
            // Check if this assessment is already in history
            const existingIndex = assessmentHistory.findIndex(
                item => item.timestamp === assessment.timestamp
            );
            
            if (existingIndex === -1) {
                // Add to history if not already there
                assessmentHistory.push(assessment);
                localStorage.setItem('assessmentHistory', JSON.stringify(assessmentHistory));
                console.log('Added assessment to history. Total assessments:', assessmentHistory.length);
            }
        }
        
        return assessmentHistory;
    }

    updateTimeRange(range) {
        this.currentTimeRange = range;
        
        // Update button states - FIXED VERSION
        document.querySelectorAll('.time-filter .btn').forEach(btn => {
            btn.classList.remove('btn-primary', 'active');
            btn.classList.add('btn-outline-primary');
        });
        
        // Activate the selected button
        const selectedButton = document.getElementById(`filter-${range}`);
        if (selectedButton) {
            selectedButton.classList.remove('btn-outline-primary');
            selectedButton.classList.add('btn-primary', 'active');
        }

        // Update charts with filtered data
        this.createMainTrendChart();
        this.createComparisonChart();
    }

    updateMetric(metric) {
        this.currentMetric = metric;
        this.createMainTrendChart();
    }

    updateCircularProgress(elementId, percentage, color) {
        const circle = document.getElementById(elementId);
        if (circle) {
            const circumference = 2 * Math.PI * 50; // radius = 50
            const offset = circumference - (percentage / 100) * circumference;
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
            circle.style.stroke = color;
        }
    }

    updateOverallStats() {
        console.log('Updating overall stats with real data:', this.progressData);
        
        // Add this line to update the overall score display
        this.updateStatsFromRealData();
        
        // Only call methods that actually exist in your class
        if (typeof this.updateProgressBars === 'function') {
            this.updateProgressBars();
        }
        
        if (typeof this.updateChartsFromData === 'function') {
            this.updateChartsFromData();
        }
        
        if (typeof this.updateInsightsFromData === 'function') {
            this.updateInsightsFromData();
        }
    }

    // Find the updateChartsFromData method (around line 600-700) and update it to use comprehensive score:
    updateChartsFromData() {
        if (!this.progressData || !this.progressData.weeklyData) return;
        
        // Calculate comprehensive wellness score for the chart
        const comprehensiveScore = this.calculateComprehensiveWellnessScore();
        
        // Update the trend chart with comprehensive score
        if (this.trendChart) {
            // Use the comprehensive score for all data points
            const chartData = this.progressData.weeklyData.map(day => ({
                ...day,
                wellnessScore: comprehensiveScore // Use comprehensive score instead of 70
            }));
            
            this.trendChart.data.datasets[0].data = chartData.map(d => d.wellnessScore);
            this.trendChart.update();
        }
        
        // Update other charts...
        if (this.activityChart) {
            this.activityChart.data.datasets[0].data = this.progressData.weeklyData.map(d => d.steps);
            this.activityChart.update();
        }
    }

    // Add this new method to calculate the comprehensive score (add this anywhere in the class):
    calculateComprehensiveWellnessScore() {
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        
        if (!wellnessAssessment) return 70; // fallback
        
        try {
            const assessment = JSON.parse(wellnessAssessment);
            const formData = assessment.formData;
            
            let totalScore = 0;
            
            // Health rating (self-assessment) - 25% weight
            if (formData.healthRating) {
                totalScore += (parseFloat(formData.healthRating) / 10) * 25;
            }
            
            // Sleep quality - 20% weight
            let sleepScore = 0;
            if (formData.sleepHours === 'less-than-5') sleepScore = 3;
            else if (formData.sleepHours === '5-6') sleepScore = 6;
            else if (formData.sleepHours === '6-7') sleepScore = 8;
            else if (formData.sleepHours === '7-8') sleepScore = 10;
            else if (formData.sleepHours === '8-9') sleepScore = 9;
            else if (formData.sleepHours === 'more-than-8') sleepScore = 7;
            totalScore += (sleepScore / 10) * 20;
            
            // Activity level - 20% weight
            let activityScore = 0;
            if (formData.activityLevel === 'sedentary') activityScore = 2;
            else if (formData.activityLevel === 'light') activityScore = 4;
            else if (formData.activityLevel === 'moderate') activityScore = 6;
            else if (formData.activityLevel === 'active') activityScore = 8;
            else if (formData.activityLevel === 'very') activityScore = 10;
            totalScore += (activityScore / 10) * 20;
            
            // Nutrition factors - 15% weight
            let nutritionScore = 5;
            if (formData.fruitsVeggies === '6-plus') nutritionScore += 2;
            else if (formData.fruitsVeggies === '4-5') nutritionScore += 1;
            if (formData.breakfast === 'yes') nutritionScore += 1;
            if (formData.sugaryDrinks === 'never') nutritionScore += 1;
            if (formData.waterIntake === 'more-than-8') nutritionScore += 1;
            totalScore += (nutritionScore / 10) * 15;
            
            // Lifestyle factors - 10% weight
            let lifestyleScore = 5;
            if (formData.smoking === 'never') lifestyleScore += 3;
            else if (formData.smoking === 'former') lifestyleScore += 1;
            if (formData.lifestyleInfo === 'very-interested') lifestyleScore += 2;
            else if (formData.lifestyleInfo === 'interested') lifestyleScore += 1;
            totalScore += (lifestyleScore / 10) * 10;
            
            // BMI factor - 10% weight
            const height = parseFloat(formData.height);
            const weight = parseFloat(formData.weight);
            const bmi = weight / ((height / 100) * (height / 100));
            let bmiScore = 5;
            if (bmi >= 18.5 && bmi < 25) bmiScore = 10;
            else if (bmi >= 25 && bmi < 30) bmiScore = 7;
            else if (bmi >= 30) bmiScore = 4;
            else if (bmi < 18.5) bmiScore = 6;
            totalScore += (bmiScore / 10) * 10;
            
            return Math.round(totalScore);
            
        } catch (e) {
            console.error('Error calculating comprehensive score for chart:', e);
            return 70; // fallback
        }
    }
}

// Global functions for HTML interactions
function updateTimeRange(range) {
    progressTracker.updateTimeRange(range);
}

function updateMetric(metric) {
    progressTracker.updateMetric(metric);
}

function exportData() {
    const exportFormat = document.getElementById('exportFormat')?.value || 'json';
    progressTracker.exportProgress(exportFormat);
}

// Initialize progress tracker
const progressTracker = new ProgressTracker();
