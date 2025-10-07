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
            this.createMainTrendChart();
            this.createComparisonChart();
            this.updateWeeklyActivity();
            this.updateGoalProgress();
            this.updateOverallStats();
        });
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
        // Load existing user data and merge with generated data
        const assessmentData = localStorage.getItem('wellnessAssessment');
        const nutritionData = localStorage.getItem('simpleMealPlan');
        
        if (assessmentData) {
            try {
                const assessment = JSON.parse(assessmentData);
                this.userData = assessment;
                // Update today's data point with real user data
                this.updateTodayData(assessment);
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        }
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
        // Simulate weekly activity data
        const activities = ['great', 'good', 'great', 'fair', 'good', 'poor', 'no-data'];
        const letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        
        activities.forEach((activity, index) => {
            const dayElement = document.getElementById(`day-${index}`);
            if (dayElement) {
                dayElement.className = `day-indicator day-${activity}`;
                dayElement.textContent = letters[index];
            }
        });
    }

    updateGoalProgress() {
        // Update circular progress indicators
        this.updateCircularProgress('weight-progress', 70, '#28a745');
        this.updateCircularProgress('activity-progress', 80, '#17a2b8');
        this.updateCircularProgress('nutrition-progress', 90, '#ffc107');
    }

    updateCircularProgress(elementId, percentage, color) {
        const circle = document.getElementById(elementId);
        if (!circle) return;

        const circumference = 2 * Math.PI * 50; // radius = 50
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = color;
    }

    updateOverallStats() {
        // Calculate and display overall statistics
        const recentData = this.getFilteredData('7d');
        const currentScore = recentData.wellness[recentData.wellness.length - 1]?.value || 78;
        const previousScore = recentData.wellness[recentData.wellness.length - 8]?.value || 73;
        const change = currentScore - previousScore;

        document.getElementById('overallScore').textContent = Math.round(currentScore);
        
        const trendElement = document.getElementById('overallTrend');
        if (change > 0) {
            trendElement.textContent = `+${Math.round(change)} this week`;
            trendElement.className = 'trend-change trend-up mt-2';
        } else if (change < 0) {
            trendElement.textContent = `${Math.round(change)} this week`;
            trendElement.className = 'trend-change trend-down mt-2';
        } else {
            trendElement.textContent = 'Stable this week';
            trendElement.className = 'trend-change trend-stable mt-2';
        }
    }

    updateTimeRange(range) {
        this.currentTimeRange = range;
        
        // Update button states
        document.querySelectorAll('.time-filter .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });
        document.getElementById(`filter-${range}`).classList.remove('btn-outline-primary');
        document.getElementById(`filter-${range}`).classList.add('btn-primary');

        // Update charts
        this.createMainTrendChart();
        this.createComparisonChart();
    }

    updateMetric(metric) {
        this.currentMetric = metric;
        this.createMainTrendChart();
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
    exportProgress() {
        const data = {
            exportDate: new Date().toISOString(),
            timeRange: this.currentTimeRange,
            progressData: this.progressData,
            summary: this.generateSummary()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wellness-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateSummary() {
        const recentData = this.getFilteredData('30d');
        const wellnessData = recentData.wellness;
        
        if (wellnessData.length === 0) return {};

        const values = wellnessData.map(item => item.value);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const trend = values[values.length - 1] - values[0];

        return {
            averageScore: Math.round(avg),
            minScore: Math.round(min),
            maxScore: Math.round(max),
            trend: Math.round(trend),
            daysTracked: values.length
        };
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
    progressTracker.exportProgress();
}

// Initialize progress tracker
const progressTracker = new ProgressTracker();
