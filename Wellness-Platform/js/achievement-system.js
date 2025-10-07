class AchievementSystem {
    constructor() {
        this.achievements = this.defineAchievements();
        this.userProgress = this.loadUserProgress();
        this.points = this.userProgress.totalPoints || 0;
        this.level = this.calculateLevel();
        this.init();
    }

    init() {
        this.setupAchievementTracker();
        this.updateDisplays();
        this.checkForNewAchievements();
    }

    defineAchievements() {
        return {
            // Assessment Achievements
            'first-assessment': {
                id: 'first-assessment',
                name: 'Health Explorer',
                description: 'Complete your first health assessment',
                icon: '🏃‍♂️',
                points: 100,
                category: 'assessment',
                unlocked: false
            },
            'assessment-streak-3': {
                id: 'assessment-streak-3',
                name: 'Consistency Champion',
                description: 'Complete assessments 3 days in a row',
                icon: '🔥',
                points: 250,
                category: 'assessment',
                unlocked: false
            },

            // Nutrition Achievements
            'first-meal-plan': {
                id: 'first-meal-plan',
                name: 'Meal Planner',
                description: 'Create your first meal plan',
                icon: '🍽️',
                points: 50,
                category: 'nutrition',
                unlocked: false
            },
            'nutrition-goal-met': {
                id: 'nutrition-goal-met',
                name: 'Nutrition Master',
                description: 'Meet your daily nutrition goals',
                icon: '🥗',
                points: 150,
                category: 'nutrition',
                unlocked: false
            },
            'balanced-week': {
                id: 'balanced-week',
                name: 'Wellness Warrior',
                description: 'Maintain balanced nutrition for 7 days',
                icon: '⚖️',
                points: 500,
                category: 'nutrition',
                unlocked: false
            },

            // Progress Achievements
            'progress-viewer': {
                id: 'progress-viewer',
                name: 'Data Detective',
                description: 'View your progress tracker for the first time',
                icon: '📊',
                points: 75,
                category: 'progress',
                unlocked: false
            },
            'improvement-trend': {
                id: 'improvement-trend',
                name: 'Rising Star',
                description: 'Show improvement trend for 2 weeks',
                icon: '📈',
                points: 300,
                category: 'progress',
                unlocked: false
            },

            // Learning Achievements
            'knowledge-seeker': {
                id: 'knowledge-seeker',
                name: 'Knowledge Seeker',
                description: 'Read your first health article',
                icon: '📚',
                points: 25,
                category: 'learning',
                unlocked: false
            },
            'article-reader-5': {
                id: 'article-reader-5',
                name: 'Health Scholar',
                description: 'Read 5 health articles',
                icon: '🎓',
                points: 200,
                category: 'learning',
                unlocked: false
            },

            // Engagement Achievements
            'daily-login-7': {
                id: 'daily-login-7',
                name: 'Committed User',
                description: 'Use the platform 7 days in a row',
                icon: '💪',
                points: 400,
                category: 'engagement',
                unlocked: false
            },
            'feature-explorer': {
                id: 'feature-explorer',
                name: 'Platform Explorer',
                description: 'Visit all platform sections',
                icon: '🗺️',
                points: 150,
                category: 'engagement',
                unlocked: false
            },

            // Milestone Achievements
            'points-500': {
                id: 'points-500',
                name: 'Point Collector',
                description: 'Earn 500 points',
                icon: '💎',
                points: 100,
                category: 'milestone',
                unlocked: false
            },
            'points-1000': {
                id: 'points-1000',
                name: 'Point Master',
                description: 'Earn 1000 points',
                icon: '👑',
                points: 200,
                category: 'milestone',
                unlocked: false
            },
            'level-5': {
                id: 'level-5',
                name: 'Wellness Expert',
                description: 'Reach level 5',
                icon: '🌟',
                points: 300,
                category: 'milestone',
                unlocked: false
            }
        };
    }

    loadUserProgress() {
        const stored = localStorage.getItem('userAchievements');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error loading achievements:', e);
            }
        }
        
        return {
            unlockedAchievements: [],
            totalPoints: 0,
            level: 1,
            visitedSections: [],
            articlesRead: [],
            loginStreak: 0,
            lastLogin: null,
            assessmentDates: [],
            mealPlansCreated: 0,
            nutritionGoalsMet: 0
        };
    }

    saveUserProgress() {
        localStorage.setItem('userAchievements', JSON.stringify(this.userProgress));
    }

    calculateLevel() {
        // Level up every 200 points
        return Math.floor(this.points / 200) + 1;
    }

    setupAchievementTracker() {
        // Track page visits
        this.trackPageVisit();
        
        // Track daily login
        this.trackDailyLogin();
    }

    trackPageVisit() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const pageMap = {
            'index.html': 'home',
            'assessment-portal.html': 'assessment',
            'results-dashboard.html': 'dashboard',
            'nutrition-planner.html': 'nutrition',
            'progress-tracker.html': 'progress',
            'resources-hub.html': 'resources'
        };
        
        const section = pageMap[currentPage] || 'unknown';
        if (section !== 'unknown' && !this.userProgress.visitedSections.includes(section)) {
            this.userProgress.visitedSections.push(section);
            
            // Check for feature explorer achievement
            if (this.userProgress.visitedSections.length >= 5) {
                this.unlockAchievement('feature-explorer');
            }
            
            // Check specific page achievements
            if (section === 'progress') {
                this.unlockAchievement('progress-viewer');
            }
            
            this.saveUserProgress();
        }
    }

    trackDailyLogin() {
        const today = new Date().toDateString();
        const lastLogin = this.userProgress.lastLogin;
        
        if (lastLogin !== today) {
            this.userProgress.lastLogin = today;
            
            if (lastLogin) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastLogin === yesterday.toDateString()) {
                    this.userProgress.loginStreak++;
                } else {
                    this.userProgress.loginStreak = 1;
                }
            } else {
                this.userProgress.loginStreak = 1;
            }
            
            // Check streak achievements
            if (this.userProgress.loginStreak >= 7) {
                this.unlockAchievement('daily-login-7');
            }
            
            this.saveUserProgress();
        }
    }

    unlockAchievement(achievementId) {
        if (!this.achievements[achievementId]) return;
        
        const achievement = this.achievements[achievementId];
        if (achievement.unlocked || this.userProgress.unlockedAchievements.includes(achievementId)) {
            return; // Already unlocked
        }
        
        // Unlock achievement
        achievement.unlocked = true;
        this.userProgress.unlockedAchievements.push(achievementId);
        this.userProgress.totalPoints += achievement.points;
        this.points = this.userProgress.totalPoints;
        this.level = this.calculateLevel();
        
        // Check milestone achievements
        if (this.points >= 500 && !this.userProgress.unlockedAchievements.includes('points-500')) {
            this.unlockAchievement('points-500');
        }
        if (this.points >= 1000 && !this.userProgress.unlockedAchievements.includes('points-1000')) {
            this.unlockAchievement('points-1000');
        }
        if (this.level >= 5 && !this.userProgress.unlockedAchievements.includes('level-5')) {
            this.unlockAchievement('level-5');
        }
        
        this.saveUserProgress();
        this.showAchievementNotification(achievement);
        this.updateDisplays();
    }

    checkForNewAchievements() {
        // Check assessment-related achievements
        const assessmentData = localStorage.getItem('wellnessAssessment');
        if (assessmentData && !this.userProgress.unlockedAchievements.includes('first-assessment')) {
            this.unlockAchievement('first-assessment');
        }
        
        // Check nutrition achievements
        const mealPlanData = localStorage.getItem('simpleMealPlan');
        if (mealPlanData && !this.userProgress.unlockedAchievements.includes('first-meal-plan')) {
            this.unlockAchievement('first-meal-plan');
        }
        
        // Check learning achievements
        const bookmarks = localStorage.getItem('bookmarkedArticles');
        if (bookmarks && !this.userProgress.unlockedAchievements.includes('knowledge-seeker')) {
            this.unlockAchievement('knowledge-seeker');
        }
    }

    trackAssessmentCompletion() {
        const today = new Date().toDateString();
        if (!this.userProgress.assessmentDates.includes(today)) {
            this.userProgress.assessmentDates.push(today);
            this.unlockAchievement('first-assessment');
            
            // Check for streak
            if (this.userProgress.assessmentDates.length >= 3) {
                this.unlockAchievement('assessment-streak-3');
            }
            
            this.saveUserProgress();
        }
    }

    trackMealPlanCreation() {
        this.userProgress.mealPlansCreated++;
        this.unlockAchievement('first-meal-plan');
        this.saveUserProgress();
    }

    trackNutritionGoalMet() {
        this.userProgress.nutritionGoalsMet++;
        this.unlockAchievement('nutrition-goal-met');
        
        if (this.userProgress.nutritionGoalsMet >= 7) {
            this.unlockAchievement('balanced-week');
        }
        
        this.saveUserProgress();
    }

    trackArticleRead(articleId) {
        if (!this.userProgress.articlesRead.includes(articleId)) {
            this.userProgress.articlesRead.push(articleId);
            this.unlockAchievement('knowledge-seeker');
            
            if (this.userProgress.articlesRead.length >= 5) {
                this.unlockAchievement('article-reader-5');
            }
            
            this.saveUserProgress();
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
            padding: 1rem 1.5rem;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
            z-index: 10000;
            border: 2px solid #ffd700;
            animation: achievementSlide 0.5s ease-out;
            max-width: 350px;
            font-weight: 600;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 2rem;">${achievement.icon}</div>
                <div>
                    <div style="font-size: 1.1rem; margin-bottom: 0.25rem;">🎉 Achievement Unlocked!</div>
                    <div style="font-size: 1rem; color: #555;">${achievement.name}</div>
                    <div style="font-size: 0.9rem; color: #666;">${achievement.description}</div>
                    <div style="font-size: 0.8rem; color: #777; margin-top: 0.25rem;">+${achievement.points} points</div>
                </div>
            </div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes achievementSlide {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Play achievement sound (if available)
        this.playAchievementSound();
        
        setTimeout(() => {
            notification.style.animation = 'achievementSlide 0.5s ease-out reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 500);
        }, 4000);
    }

    playAchievementSound() {
        try {
            // Create a simple achievement sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            // Sound not available, continue silently
        }
    }

    updateDisplays() {
        // Update points and level displays across the site
        document.querySelectorAll('.user-points').forEach(el => {
            el.textContent = this.points;
        });
        
        document.querySelectorAll('.user-level').forEach(el => {
            el.textContent = this.level;
        });
        
        // Update progress bars
        const levelProgress = (this.points % 200) / 200 * 100;
        document.querySelectorAll('.level-progress').forEach(el => {
            el.style.width = levelProgress + '%';
        });
    }

    getUnlockedAchievements() {
        return this.userProgress.unlockedAchievements.map(id => this.achievements[id]).filter(Boolean);
    }

    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(achievement => 
            achievement.category === category
        );
    }

    getAchievementProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.userProgress.unlockedAchievements.length;
        return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
    }

    createAchievementsModal() {
        const progress = this.getAchievementProgress();
        const categories = ['assessment', 'nutrition', 'progress', 'learning', 'engagement', 'milestone'];
        
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">🏆 Your Achievements</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <div class="achievement-progress-circle" style="position: relative; width: 120px; height: 120px; margin: 0 auto;">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" stroke-width="8"></circle>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#28a745" stroke-width="8" 
                                            stroke-dasharray="314" stroke-dashoffset="${314 - (314 * progress.percentage / 100)}"
                                            stroke-linecap="round" transform="rotate(-90 60 60)"></circle>
                                </svg>
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #28a745;">${progress.percentage}%</div>
                                    <div style="font-size: 0.8rem; color: #6c757d;">Complete</div>
                                </div>
                            </div>
                            <p class="mt-3">${progress.unlocked} of ${progress.total} achievements unlocked</p>
                            <div class="d-flex justify-content-center gap-4">
                                <div class="text-center">
                                    <div class="h4 text-primary">${this.points}</div>
                                    <small class="text-muted">Total Points</small>
                                </div>
                                <div class="text-center">
                                    <div class="h4 text-success">${this.level}</div>
                                    <small class="text-muted">Current Level</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="achievements-grid">
                            ${categories.map(category => `
                                <div class="achievement-category mb-4">
                                    <h6 class="text-capitalize mb-3">${category.replace('-', ' ')} Achievements</h6>
                                    <div class="row g-2">
                                        ${this.getAchievementsByCategory(category).map(achievement => `
                                            <div class="col-md-6">
                                                <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                                                     style="display: flex; align-items: center; padding: 1rem; border-radius: 10px; 
                                                            border: 2px solid ${achievement.unlocked ? '#28a745' : '#e9ecef'}; 
                                                            background: ${achievement.unlocked ? '#f8fff8' : '#f8f9fa'};">
                                                    <div style="font-size: 2rem; margin-right: 1rem; ${achievement.unlocked ? '' : 'filter: grayscale(100%);'}">${achievement.icon}</div>
                                                    <div>
                                                        <div style="font-weight: 600; color: ${achievement.unlocked ? '#495057' : '#6c757d'};">${achievement.name}</div>
                                                        <div style="font-size: 0.9rem; color: ${achievement.unlocked ? '#6c757d' : '#999'};">${achievement.description}</div>
                                                        <div style="font-size: 0.8rem; color: ${achievement.unlocked ? '#28a745' : '#999'};">${achievement.points} points</div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    showAchievementsModal() {
        const modal = this.createAchievementsModal();
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
}

// Global achievement system instance
const achievementSystem = new AchievementSystem();

// Global functions for tracking achievements
function trackAssessmentCompletion() {
    achievementSystem.trackAssessmentCompletion();
}

function trackMealPlanCreation() {
    achievementSystem.trackMealPlanCreation();
}

function trackNutritionGoalMet() {
    achievementSystem.trackNutritionGoalMet();
}

function trackArticleRead(articleId) {
    achievementSystem.trackArticleRead(articleId);
}

function showAchievements() {
    achievementSystem.showAchievementsModal();
}
