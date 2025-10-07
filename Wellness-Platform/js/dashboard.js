class WellnessDashboard {
    constructor() {
        this.calculator = null;
        this.charts = {};
        this.init();
    }

    init() {
        // Check if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadResults();
            });
        } else {
            // DOM is already loaded
            this.loadResults();
        }
    }

    async loadResults() {
        try {
            console.log('Dashboard loading results...');
            
            // Initialize calculator if not already done
            if (!this.calculator && window.HealthCalculator) {
                this.calculator = new HealthCalculator();
            }
            
            // Show loading overlay
            this.showLoading(true);
            
            // Get results from localStorage
            const resultsData = localStorage.getItem('wellnessResults');
            const assessmentData = localStorage.getItem('wellnessAssessment');
            
            console.log('Results data:', resultsData ? 'Found' : 'Not found');
            console.log('Assessment data:', assessmentData ? 'Found' : 'Not found');
            
            if (!resultsData && !assessmentData) {
                console.log('No assessment data found in localStorage');
                this.showNoDataMessage();
                return;
            }
            
            // If we have assessment data but no results, calculate them
            if (!resultsData && assessmentData) {
                console.log('Found assessment data, calculating results...');
                const assessment = JSON.parse(assessmentData);
                const formData = assessment.formData;
                
                // Calculate and save results
                const healthMetrics = this.calculateAllMetrics(formData);
                const results = {
                    healthScore: healthMetrics.healthScore,
                    bmi: healthMetrics.bmi,
                    recommendations: healthMetrics.recommendations,
                    completedAt: new Date().toISOString(),
                    formData: formData
                };
                
                localStorage.setItem('wellnessResults', JSON.stringify(results));
                
                console.log('Updating dashboard with calculated metrics...');
                // Update dashboard
                this.updateDashboard(healthMetrics, formData);
                console.log('Creating charts...');
                this.createCharts(healthMetrics, formData);
                console.log('Hiding loading overlay...');
                setTimeout(() => {
                    this.showLoading(false);
                    // Fallback: force hide loading overlay
                    const overlay = document.getElementById('loadingOverlay');
                    if (overlay) {
                        overlay.style.display = 'none';
                        overlay.remove();
                    }
                }, 1000);
                return;
            }

            console.log('Both results and assessment data found, parsing...');
            const results = JSON.parse(resultsData);
            const assessment = JSON.parse(assessmentData);
            const formData = assessment.formData;

            console.log('Calculating health metrics...');
            // Calculate comprehensive health metrics
            const healthMetrics = this.calculateAllMetrics(formData);
            
            console.log('Updating dashboard...');
            // Update dashboard
            this.updateDashboard(healthMetrics, formData);
            
            console.log('Creating charts...');
            // Create charts
            this.createCharts(healthMetrics, formData);
            
            console.log('Hiding loading overlay...');
            // Hide loading overlay
            setTimeout(() => {
                this.showLoading(false);
                // Fallback: force hide loading overlay
                const overlay = document.getElementById('loadingOverlay');
                if (overlay) {
                    overlay.style.display = 'none';
                    overlay.remove();
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error loading results:', error);
            this.showLoading(false);
            this.showErrorMessage();
        }
    }

    calculateAllMetrics(formData) {
        // Ensure calculator is initialized
        if (!this.calculator && window.HealthCalculator) {
            this.calculator = new HealthCalculator();
        }
        
        if (!this.calculator) {
            console.error('HealthCalculator not available');
            return this.getDefaultMetrics();
        }
        
        const weight = parseFloat(formData.weight);
        const height = parseFloat(formData.height);
        const age = parseInt(formData.age);
        const gender = formData.gender;

        const bmi = this.calculator.calculateBMI(weight, height);
        const bmiCategory = this.calculator.getBMICategory(bmi);
        const bodyFat = this.calculator.calculateBodyFat(bmi, age, gender);
        const healthScore = this.calculator.calculateHealthScore(formData);
        const riskLevel = this.calculator.calculateRiskLevel(bmi, healthScore, age, formData);
        const idealWeight = this.calculator.calculateIdealWeight(height, gender, age);
        const bmr = this.calculator.calculateBMR(weight, height, age, gender);
        const tdee = this.calculator.calculateTDEE(bmr, formData.activityLevel);
        const recommendations = this.calculator.generateRecommendations(formData, bmi, healthScore, riskLevel);

        return {
            bmi,
            bmiCategory,
            bodyFat,
            healthScore,
            riskLevel,
            idealWeight,
            bmr,
            tdee,
            recommendations,
            weight,
            height,
            age,
            gender
        };
    }

    getDefaultMetrics() {
        return {
            bmi: null,
            bmiCategory: { status: 'Unknown', class: 'status-warning' },
            bodyFat: null,
            healthScore: 50,
            riskLevel: { level: 'Unknown', class: 'status-warning', score: 2 },
            idealWeight: null,
            bmr: null,
            tdee: null,
            recommendations: [],
            weight: 0,
            height: 0,
            age: 0,
            gender: 'unknown'
        };
    }

    updateDashboard(metrics, formData) {
        // Update completion date
        const completionDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('completionDate').textContent = completionDate;

        // Update key metrics
        this.updateMetricCard('bmiValue', metrics.bmi?.toFixed(1) || '--');
        this.updateMetricCard('bmiStatus', metrics.bmiCategory?.status || '--', metrics.bmiCategory?.class);

        this.updateMetricCard('healthScore', `${metrics.healthScore}/100`);
        this.updateMetricCard('healthScoreStatus', this.getHealthScoreLabel(metrics.healthScore), this.getHealthScoreClass(metrics.healthScore));

        this.updateMetricCard('riskLevel', metrics.riskLevel.level);
        this.updateMetricCard('riskStatus', this.getRiskLabel(metrics.riskLevel.score), metrics.riskLevel.class);

        const activityInfo = this.calculator?.activityMultipliers?.[formData.activityLevel];
        this.updateMetricCard('activityScore', activityInfo?.label || '--');
        this.updateMetricCard('activityStatus', this.getActivityLabel(activityInfo?.score), this.getActivityClass(activityInfo?.score));

        // Update recommendations
        this.updateRecommendations(metrics.recommendations);

        // Update assessment summary
        this.updateAssessmentSummary(metrics, formData);
    }

    updateMetricCard(elementId, value, className = '') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            if (className && element.classList.contains('metric-status')) {
                element.className = `metric-status ${className}`;
            }
        }
    }

    getHealthScoreLabel(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    }

    getHealthScoreClass(score) {
        if (score >= 70) return 'status-normal';
        if (score >= 50) return 'status-warning';
        return 'status-danger';
    }

    getRiskLabel(score) {
        const labels = ['Low Risk', 'Moderate Risk', 'High Risk', 'Very High Risk'];
        return labels[score - 1] || 'Unknown';
    }

    getActivityLabel(score) {
        const labels = ['Low', 'Light', 'Moderate', 'High'];
        return labels[score - 1] || 'Unknown';
    }

    getActivityClass(score) {
        if (score >= 3) return 'status-normal';
        if (score >= 2) return 'status-warning';
        return 'status-danger';
    }

    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendationsList');
        if (!container) return;

        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <div class="fs-1 mb-3">🎉</div>
                    <h6>Great job!</h6>
                    <p class="text-muted mb-0">You're doing well with your current health habits. Keep up the good work!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-content">
                    <h6>${rec.title}</h6>
                    <p>${rec.description}</p>
                </div>
            </div>
        `).join('');
    }

    updateAssessmentSummary(metrics, formData) {
        const container = document.getElementById('assessmentSummary');
        if (!container) return;

        const summaryItems = [
            { label: 'Age', value: `${metrics.age} years` },
            { label: 'Height', value: `${metrics.height} cm` },
            { label: 'Weight', value: `${metrics.weight} kg` },
            { label: 'BMI', value: metrics.bmi ? `${metrics.bmi.toFixed(1)}` : '--' },
            { label: 'Body Fat', value: metrics.bodyFat ? `${metrics.bodyFat}%` : '--' },
            { label: 'Ideal Weight', value: metrics.idealWeight ? `${metrics.idealWeight} kg` : '--' },
            { label: 'Daily Calories (BMR)', value: metrics.bmr ? `${metrics.bmr} kcal` : '--' },
            { label: 'Activity Level', value: this.calculator?.activityMultipliers?.[formData.activityLevel]?.label || '--' }
        ];

        container.innerHTML = summaryItems.map(item => `
            <div class="summary-item">
                <span class="summary-label">${item.label}:</span>
                <span class="summary-value">${item.value}</span>
            </div>
        `).join('');
    }

    createCharts(metrics, formData) {
        this.createHealthMetricsChart(metrics, formData);
        this.createBMIChart(metrics);
    }

    createHealthMetricsChart(metrics, formData) {
        const ctx = document.getElementById('healthMetricsChart');
        if (!ctx) return;

        const data = {
            labels: ['Health Score', 'Activity Level', 'Nutrition', 'Sleep Quality', 'BMI Status'],
            datasets: [{
                label: 'Health Metrics',
                data: [
                    metrics.healthScore,
                    (this.calculator?.activityMultipliers?.[formData.activityLevel]?.score || 1) * 25,
                    this.getNutritionScore(formData),
                    this.getSleepScore(formData),
                    this.getBMIScore(metrics.bmi)
                ],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(23, 162, 184, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(108, 117, 125, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(108, 117, 125, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        };

        this.charts.healthMetrics = new Chart(ctx, {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    createBMIChart(metrics) {
        const ctx = document.getElementById('bmiChart');
        if (!ctx) return;

        const bmiCategory = metrics.bmiCategory;
        if (!bmiCategory) return;

        const categories = this.calculator ? Object.keys(this.calculator.bmiRanges) : ['underweight', 'normal', 'overweight', 'obese'];
        const currentIndex = categories.indexOf(bmiCategory.category);

        this.charts.bmi = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Underweight', 'Normal', 'Overweight', 'Obese'],
                datasets: [{
                    data: [1, 1, 1, 1],
                    backgroundColor: categories.map((cat, index) => 
                        index === currentIndex ? '#28a745' : '#e9ecef'
                    ),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    getNutritionScore(formData) {
        let score = 0;
        
        // Fruits and vegetables
        const fruitVegScores = { '6-plus': 40, '4-5': 30, '2-3': 20, '0-1': 10 };
        score += fruitVegScores[formData.fruitsVeggies] || 0;
        
        // Water intake
        const waterScores = { 'more-than-8': 30, '7-8': 25, '4-6': 15, 'less-than-4': 5 };
        score += waterScores[formData.waterIntake] || 0;
        
        // Sugary drinks (reverse scoring)
        const sugarScores = { 'never': 30, 'sometimes': 20, 'often': 10, 'daily': 0 };
        score += sugarScores[formData.sugaryDrinks] || 0;
        
        return Math.min(100, score);
    }

    getSleepScore(formData) {
        const sleepScores = {
            '7-8': 100,
            'more-than-8': 85,
            '5-6': 60,
            'less-than-5': 30
        };
        return sleepScores[formData.sleepHours] || 50;
    }

    getBMIScore(bmi) {
        if (!bmi) return 50;
        
        if (bmi >= 18.5 && bmi <= 24.9) return 100;
        if (bmi >= 17 && bmi < 18.5) return 70;
        if (bmi >= 25 && bmi <= 29.9) return 60;
        if (bmi >= 30 && bmi <= 34.9) return 40;
        return 20;
    }

    showLoading(show) {
        console.log(`${show ? 'Showing' : 'Hiding'} loading overlay`);
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
            console.log(`Loading overlay ${show ? 'shown' : 'hidden'} successfully`);
        } else {
            console.error('Loading overlay element not found!');
        }
    }

    showNoDataMessage() {
        this.showLoading(false);
        document.querySelector('.container-fluid').innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-6 text-center py-5">
                    <div class="card">
                        <div class="card-body py-5">
                            <div class="fs-1 mb-4">📋</div>
                            <h3>No Assessment Data Found</h3>
                            <p class="text-muted mb-4">Please complete a health assessment first to view your dashboard.</p>
                            <a href="assessment-portal.html" class="btn btn-health">Start Assessment</a>
                            <button class="btn btn-outline-secondary ms-2" onclick="loadTestData()">Load Test Data</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showErrorMessage() {
        this.showLoading(false);
        // Show error message
    }
}

// Global functions for buttons
function exportResults() {
    window.print();
}

function printResults() {
    window.print();
}

// Test data function for debugging
function loadTestData() {
    const testData = {
        formData: {
            firstName: "John",
            lastName: "Doe",
            age: "30",
            gender: "male",
            height: "175",
            weight: "70",
            breakfast: "yes",
            healthRating: "7",
            foodImportance: "very-important",
            activityLevel: "moderate",
            sleepHours: "7-8",
            smoking: "never",
            fruitsVeggies: "4-5",
            sugaryDrinks: "sometimes",
            waterIntake: "7-8",
            lifestyleInfo: "very-interested"
        },
        currentStep: 5,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('wellnessAssessment', JSON.stringify(testData));
    
    // Reload the dashboard
    location.reload();
}

// Initialize dashboard when DOM and dependencies are ready
let dashboard;

function initializeDashboard() {
    if (window.HealthCalculator && !dashboard) {
        dashboard = new WellnessDashboard();
    } else if (!window.HealthCalculator) {
        console.error('HealthCalculator not loaded yet, retrying...');
        setTimeout(initializeDashboard, 100);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}
