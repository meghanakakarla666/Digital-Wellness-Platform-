class ResourcesHub {
    constructor() {
        this.articles = this.generateArticles();
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    loadUserHealthProfile() {
        const wellnessAssessment = localStorage.getItem('wellnessAssessment');
        const assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
        
        this.userHealthProfile = null;
        
        if (wellnessAssessment) {
            try {
                const assessment = JSON.parse(wellnessAssessment);
                this.userHealthProfile = this.analyzeHealthProfile(assessment.formData);
                console.log('User health profile loaded:', this.userHealthProfile);
            } catch (e) {
                console.error('Error loading user health profile:', e);
            }
        }
        
        return this.userHealthProfile;
    }

    analyzeHealthProfile(formData) {
        if (!formData) return null;
        
        const profile = {
            bmi: null,
            healthRating: parseInt(formData.healthRating) || 5,
            activityLevel: formData.activityLevel || 'moderate',
            sleepHours: formData.sleepHours || '7-8',
            goals: formData.healthGoals || 'general-wellness',
            concerns: [],
            recommendations: [],
            // Add assessment scores if available
            nutritionScore: parseInt(formData.nutritionRating) || null,
            fitnessScore: parseInt(formData.fitnessRating) || null,
            sleepScore: this.getSleepScore(formData.sleepHours),
            strengths: [], // Areas that are already good
            needsImprovement: [] // Areas that need work
        };
        
        // Calculate BMI
        if (formData.height && formData.weight) {
            const height = parseFloat(formData.height);
            const weight = parseFloat(formData.weight);
            profile.bmi = weight / ((height / 100) ** 2);
        }
        
        // Analyze what needs improvement vs what's already good
        this.analyzeAssessmentScores(formData, profile);
        
        // Identify health concerns based on assessment
        if (profile.bmi) {
            if (profile.bmi < 18.5) profile.needsImprovement.push('nutrition');
            else if (profile.bmi >= 25 && profile.bmi < 30) profile.needsImprovement.push('nutrition', 'fitness');
            else if (profile.bmi >= 30) profile.needsImprovement.push('nutrition', 'fitness');
        }
        
        if (profile.healthRating <= 3) profile.needsImprovement.push('mental-health');
        if (profile.activityLevel === 'sedentary') profile.needsImprovement.push('fitness');
        if (formData.sleepHours === '4-5' || formData.sleepHours === '5-6') profile.needsImprovement.push('sleep');
        if (formData.smoking === 'current') profile.needsImprovement.push('prevention');
        if (formData.sugaryDrinks === 'daily') profile.needsImprovement.push('nutrition');
        if (formData.waterIntake === '1-3') profile.needsImprovement.push('nutrition');
        if (formData.fruitsVeggies === '0-1') profile.needsImprovement.push('nutrition');
        
        // Generate content recommendations based on areas that need improvement
        this.generateContentRecommendations(profile);
        
        console.log('Health profile analysis:', {
            strengths: profile.strengths,
            needsImprovement: profile.needsImprovement,
            recommendations: profile.recommendations
        });
        
        return profile;
    }

    analyzeAssessmentScores(formData, profile) {
        console.log('=== ASSESSMENT ANALYSIS ===');
        console.log('Form data:', formData);
        
        // Analyze nutrition based on your actual form values
        let nutritionScore = 0;
        let nutritionQuestions = 0;
        
        // Fruits and vegetables - your form uses "6-plus"
        if (formData.fruitsVeggies) {
            nutritionQuestions++;
            // "6-plus" is excellent, "4-5" and "2-3" are good, "0-1" is poor
            if (formData.fruitsVeggies === '6-plus' || formData.fruitsVeggies === '4-5') {
                nutritionScore++;
            }
            console.log('Fruits & Veggies:', formData.fruitsVeggies, '- Score added:', nutritionScore);
        }
        
        // Water intake - your form uses "more-than-8"
        if (formData.waterIntake) {
            nutritionQuestions++;
            // "more-than-8" and "6-8" are good, less is poor
            if (formData.waterIntake === 'more-than-8' || formData.waterIntake === '6-8') {
                nutritionScore++;
            }
            console.log('Water Intake:', formData.waterIntake, '- Score added:', nutritionScore);
        }
        
        // Sugary drinks - your form uses "never"
        if (formData.sugaryDrinks) {
            nutritionQuestions++;
            // "never" and "rarely" are good
            if (formData.sugaryDrinks === 'never' || formData.sugaryDrinks === 'rarely') {
                nutritionScore++;
            }
            console.log('Sugary Drinks:', formData.sugaryDrinks, '- Score added:', nutritionScore);
        }
        
        // Food importance
        if (formData.foodImportance) {
            nutritionQuestions++;
            if (formData.foodImportance === 'very-important' || formData.foodImportance === 'important') {
                nutritionScore++;
            }
            console.log('Food Importance:', formData.foodImportance, '- Score added:', nutritionScore);
        }
        
        // Analyze fitness based on your actual form values
        let fitnessScore = 0;
        let fitnessQuestions = 0;
        
        // Activity level - your form uses "very"
        if (formData.activityLevel) {
            fitnessQuestions++;
            // "very" and "active" are good, "moderate", "light", "sedentary" need improvement
            if (formData.activityLevel === 'very' || formData.activityLevel === 'active') {
                fitnessScore++;
            }
            console.log('Activity Level:', formData.activityLevel, '- Score added:', fitnessScore);
        }
        
        // Analyze sleep based on your actual form values
        let sleepScore = 0;
        let sleepQuestions = 1;
        
        // Sleep hours - your form uses "more-than-8"
        if (formData.sleepHours) {
            // "more-than-8" and "7-8" are good, less is poor
            if (formData.sleepHours === 'more-than-8' || formData.sleepHours === '7-8') {
                sleepScore++;
            }
            console.log('Sleep Hours:', formData.sleepHours, '- Score added:', sleepScore);
        }
        
        // Calculate percentages
        const nutritionPercentage = nutritionQuestions > 0 ? (nutritionScore / nutritionQuestions) : 0;
        const fitnessPercentage = fitnessQuestions > 0 ? (fitnessScore / fitnessQuestions) : 0;
        const sleepPercentage = sleepScore / sleepQuestions;
        
        console.log('=== FINAL SCORES ===');
        console.log('Nutrition:', nutritionScore, '/', nutritionQuestions, '=', nutritionPercentage);
        console.log('Fitness:', fitnessScore, '/', fitnessQuestions, '=', fitnessPercentage);
        console.log('Sleep:', sleepScore, '/', sleepQuestions, '=', sleepPercentage);
        
        // Areas scoring 75% or higher are strengths
        if (nutritionPercentage >= 0.75) {
            profile.strengths.push('nutrition');
            console.log('✅ Nutrition is a STRENGTH');
        } else {
            profile.needsImprovement.push('nutrition');
            console.log('❌ Nutrition needs improvement');
        }
        
        if (fitnessPercentage >= 0.75) {
            profile.strengths.push('fitness');
            console.log('✅ Fitness is a STRENGTH');
        } else {
            profile.needsImprovement.push('fitness');
            console.log('❌ Fitness needs improvement');
        }
        
        if (sleepPercentage >= 0.75) {
            profile.strengths.push('sleep');
            console.log('✅ Sleep is a STRENGTH');
        } else {
            profile.needsImprovement.push('sleep');
            console.log('❌ Sleep needs improvement');
        }
        
        console.log('=== ANALYSIS COMPLETE ===');
        console.log('Strengths:', profile.strengths);
        console.log('Needs Improvement:', profile.needsImprovement);
    }

    getSleepScore(sleepHours) {
        const sleepValues = {
            '8+': 10,
            '7-8': 9,
            '6-7': 7,
            '5-6': 5,
            '4-5': 3
        };
        return sleepValues[sleepHours] || 5;
    }

    generateContentRecommendations(profile) {
        // Focus on areas that need improvement, not strengths
        const recommendations = [...profile.needsImprovement];
        
        // Goal-based recommendations (secondary priority)
        if (profile.goals === 'weight-loss') {
            if (!recommendations.includes('nutrition')) recommendations.push('nutrition');
            if (!recommendations.includes('fitness')) recommendations.push('fitness');
        }
        if (profile.goals === 'muscle-gain') {
            if (!recommendations.includes('fitness')) recommendations.push('fitness');
            if (!recommendations.includes('nutrition')) recommendations.push('nutrition');
        }
        if (profile.goals === 'disease-prevention') {
            if (!recommendations.includes('prevention')) recommendations.push('prevention');
        }
        if (profile.goals === 'stress-management') {
            if (!recommendations.includes('mental-health')) recommendations.push('mental-health');
        }
        
        // Remove duplicates and limit to top 3 recommendations
        profile.recommendations = [...new Set(recommendations)].slice(0, 3);
        
        console.log('Generated recommendations:', profile.recommendations);
        console.log('Based on needs improvement:', profile.needsImprovement);
        console.log('User strengths:', profile.strengths);
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadUserHealthProfile();
            this.setupEventListeners();
            this.displayArticles();
            this.setupCategoryFilters();
            this.displayBookmarks();
            this.displayPersonalizedRecommendations();
        });
    }

    displayPersonalizedRecommendations() {
        if (!this.userHealthProfile || this.userHealthProfile.recommendations.length === 0) {
            return;
        }
        
        const strengthsText = this.userHealthProfile.strengths.length > 0 
            ? this.userHealthProfile.strengths.map(s => this.getCategoryLabel(s)).join(', ')
            : 'None identified';
        
        const needsImprovementText = this.userHealthProfile.needsImprovement.length > 0
            ? this.userHealthProfile.needsImprovement.map(s => this.getCategoryLabel(s)).join(', ')
            : 'None identified';
        
        // Create personalized section
        const mainContent = document.querySelector('.col-lg-8');
        if (mainContent) {
            const personalizedSection = document.createElement('div');
            personalizedSection.className = 'personalized-recommendations mb-4';
            personalizedSection.innerHTML = `
                <div class="alert alert-info">
                    <h5>📋 Personalized for You</h5>
                    <p class="mb-2">Based on your health assessment:</p>
                    
                    ${this.userHealthProfile.strengths.length > 0 ? `
                        <div class="mb-2">
                            <strong>✅ Your Strengths:</strong> 
                            <span class="text-success">${strengthsText}</span>
                        </div>
                    ` : ''}
                    
                    <div class="mb-3">
                        <strong>🎯 Areas for Improvement:</strong> 
                        <span class="text-warning">${needsImprovementText}</span>
                    </div>
                    
                    <p class="mb-2"><strong>Recommended content for you:</strong></p>
                    <div class="d-flex flex-wrap gap-2">
                        ${this.userHealthProfile.recommendations.map(category => `
                            <span class="badge bg-primary filter-tag-personal" 
                                  data-category="${category}" 
                                  onclick="resourcesHub.selectCategory('${category}')"
                                  style="cursor: pointer; font-size: 0.9rem; padding: 0.5rem 1rem;">
                                ${this.getCategoryLabel(category)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Insert before articles container
            const articlesContainer = document.getElementById('articlesContainer');
            mainContent.insertBefore(personalizedSection, articlesContainer);
        }
    }

    generateArticles() {
        return [
            {
                id: 1,
                title: "The Science of Balanced Nutrition",
                excerpt: "Discover how to create meals that fuel your body optimally with the right balance of macronutrients and micronutrients.",
                category: "nutrition",
                readTime: "8 min read",
                image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop",
                content: "A comprehensive guide to understanding macronutrients, micronutrients, and how to create balanced meals...",
                tags: ["nutrition", "diet", "health", "macronutrients"],
                featured: true
            },
            {
                id: 2,
                title: "Building a Sustainable Exercise Routine",
                excerpt: "Learn how to create a workout plan that fits your lifestyle and keeps you motivated for long-term success.",
                category: "fitness",
                readTime: "6 min read",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
                content: "Step-by-step guide to creating a sustainable exercise routine that you'll actually stick to...",
                tags: ["fitness", "exercise", "routine", "motivation"],
                featured: true
            },
            {
                id: 3,
                title: "Managing Stress in the Modern World",
                excerpt: "Practical strategies for reducing stress and improving mental well-being in our fast-paced society.",
                category: "mental-health",
                readTime: "10 min read",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
                content: "Comprehensive stress management techniques backed by research...",
                tags: ["mental-health", "stress", "mindfulness", "wellness"],
                featured: true
            },
            {
                id: 4,
                title: "The Power of Quality Sleep",
                excerpt: "Understanding sleep cycles, creating the perfect sleep environment, and optimizing your rest for better health.",
                category: "sleep",
                readTime: "7 min read",
                image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=200&fit=crop",
                content: "Everything you need to know about improving your sleep quality...",
                tags: ["sleep", "health", "recovery", "lifestyle"]
            },
            {
                id: 5,
                title: "Heart-Healthy Foods for Life",
                excerpt: "Explore foods that support cardiovascular health and learn how to incorporate them into your daily diet.",
                category: "nutrition",
                readTime: "5 min read",
                image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=200&fit=crop",
                content: "A guide to foods that support heart health and how to include them in your meals...",
                tags: ["nutrition", "heart-health", "diet", "prevention"]
            },
            {
                id: 6,
                title: "Home Workouts: No Gym Required",
                excerpt: "Effective exercises you can do at home with minimal equipment to stay fit and healthy.",
                category: "fitness",
                readTime: "9 min read",
                image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=200&fit=crop",
                content: "Complete home workout routines for all fitness levels...",
                tags: ["fitness", "home-workout", "exercise", "bodyweight"]
            },
            {
                id: 7,
                title: "Mindfulness and Meditation for Beginners",
                excerpt: "Simple techniques to start your mindfulness journey and reduce anxiety in just a few minutes a day.",
                category: "mental-health",
                readTime: "6 min read",
                image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=200&fit=crop",
                content: "Beginner-friendly meditation and mindfulness practices...",
                tags: ["mental-health", "meditation", "mindfulness", "anxiety"]
            },
            {
                id: 8,
                title: "Preventive Health: Your Best Investment",
                excerpt: "Learn about essential health screenings, vaccinations, and lifestyle choices that prevent disease.",
                category: "prevention",
                readTime: "12 min read",
                image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop",
                content: "Comprehensive guide to preventive healthcare and wellness...",
                tags: ["prevention", "health", "screening", "wellness"]
            },
            {
                id: 9,
                title: "Hydration: More Than Just Water",
                excerpt: "Understanding proper hydration, electrolyte balance, and how to stay optimally hydrated throughout the day.",
                category: "nutrition",
                readTime: "4 min read",
                image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=250&fit=crop",
                content: "Complete guide to hydration and electrolyte balance...",
                tags: ["nutrition", "hydration", "health", "electrolytes"]
            },
            {
                id: 10,
                title: "Creating Healthy Sleep Habits",
                excerpt: "Build a bedtime routine that promotes deep, restful sleep and improves your overall health.",
                category: "sleep",
                readTime: "8 min read",
                image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=200&fit=crop",
                content: "Proven strategies for better sleep hygiene and habits...",
                tags: ["sleep", "habits", "health", "routine"]
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('resourceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.displayArticles();
                if (this.searchQuery) {
                    // Scroll to articles when searching
                    setTimeout(() => this.scrollToArticles(), 100);
                }
            });
        }

        // Category filter tags
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                // Remove active class from all tags
                document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tag
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.displayArticles();
                
                // Scroll to articles section after filtering
                setTimeout(() => this.scrollToArticles(), 100);
            });
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = card.dataset.category;
                this.selectCategory(category);
                
                // Scroll to articles section after selecting category
                setTimeout(() => this.scrollToArticles(), 100);
            });
        });
    }

    scrollToArticles() {
        const articlesContainer = document.getElementById('articlesContainer');
        if (articlesContainer) {
            articlesContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }
    }

    setupCategoryFilters() {
        // Initialize category counts
        const categoryCounts = {};
        this.articles.forEach(article => {
            categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
        });

        // Update filter tags with counts
        document.querySelectorAll('.filter-tag').forEach(tag => {
            const category = tag.dataset.category;
            if (category !== 'all') {
                const count = categoryCounts[category] || 0;
                if (count > 0) {
                    tag.textContent += ` (${count})`;
                }
            }
        });
    }

    selectCategory(category) {
        // Update category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update filter tags
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        document.querySelector(`.filter-tag[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        this.displayArticles();
        
        // Scroll to articles section
        setTimeout(() => this.scrollToArticles(), 100);
    }

    filterArticles() {
        let filtered = this.articles;

        // Filter by category
        if (this.currentCategory && this.currentCategory !== 'all') {
            filtered = filtered.filter(article => article.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(this.searchQuery) ||
                article.excerpt.toLowerCase().includes(this.searchQuery) ||
                article.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        // Prioritize personalized content if no specific filter is applied
        if (this.currentCategory === 'all' && !this.searchQuery && this.userHealthProfile) {
            const personalizedArticles = filtered.filter(article => 
                this.userHealthProfile.recommendations.includes(article.category)
            );
            const otherArticles = filtered.filter(article => 
                !this.userHealthProfile.recommendations.includes(article.category)
            );
            
            // Show personalized articles first
            filtered = [...personalizedArticles, ...otherArticles];
        }

        return filtered;
    }

    displayArticles() {
        const container = document.getElementById('articlesContainer');
        if (!container) return;

        const filteredArticles = this.filterArticles();

        if (filteredArticles.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📚</div>
                    <h4>No articles found</h4>
                    <p class="text-muted">Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        const articlesHTML = filteredArticles.map(article => `
            <div class="article-card" onclick="openArticle(${article.id})">
                <div class="article-image" style="background-image: url('${article.image}')">
                    <div class="article-badge">${this.getCategoryLabel(article.category)}</div>
                </div>
                <div class="article-content">
                    <h4 class="article-title">${article.title}</h4>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-meta">
                        <span>📖 ${article.readTime}</span>
                        <span class="read-time">Read Article</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = articlesHTML;
    }

    getCategoryLabel(category) {
        const labels = {
            'nutrition': '🥗 Nutrition',
            'fitness': '💪 Fitness',
            'mental-health': '🧠 Mental Health',
            'sleep': '😴 Sleep',
            'prevention': '🛡️ Prevention'
        };
        return labels[category] || '📚 Health';
    }

    openArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) {
            console.log('Article not found:', articleId);
            return;
        }

        const isBookmarked = this.isArticleBookmarked(articleId);
        console.log('Opening article:', article.title, 'Bookmarked:', isBookmarked);

        // Create modal for article
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${article.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <img src="${article.image}" class="img-fluid rounded" alt="${article.title}">
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="badge bg-primary">${this.getCategoryLabel(article.category)}</span>
                            <small class="text-muted">📖 ${article.readTime}</small>
                        </div>
                        <div class="mb-4">
                            <p class="lead">${article.excerpt}</p>
                        </div>
                        <div class="article-full-content">
                            ${this.generateFullContent(article)}
                        </div>
                        <div class="mt-4">
                            <h6>Tags:</h6>
                            ${article.tags.map(tag => `<span class="badge bg-secondary me-2">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" onclick="shareArticle(${article.id})">
                            📤 Share
                        </button>
                        <button type="button" class="btn ${isBookmarked ? 'btn-success' : 'btn-outline-primary'}" 
                                data-bookmark-id="${article.id}"
                                onclick="bookmarkArticle(${article.id})">
                            ${isBookmarked ? '✅ Bookmarked' : '🔖 Bookmark'}
                        </button>
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

    generateFullContent(article) {
        // Generate some sample content based on the article
        const content = {
            nutrition: `
                <h6>Nutritional Benefits</h6>
                <p>This article covers essential nutritional information to help you make better dietary choices...</p>
                <ul>
                    <li>Key nutrients and their benefits</li>
                    <li>Meal planning strategies</li>
                    <li>Healthy recipe suggestions</li>
                </ul>
            `,
            fitness: `
                <h6>Exercise Guidelines</h6>
                <p>Learn about effective fitness routines and exercise techniques...</p>
                <ul>
                    <li>Proper form and technique</li>
                    <li>Progressive workout plans</li>
                    <li>Recovery and rest days</li>
                </ul>
            `,
            sleep: `
                <h6>Sleep Optimization</h6>
                <p>Discover strategies for improving your sleep quality and duration...</p>
                <ul>
                    <li>Sleep hygiene practices</li>
                    <li>Creating the ideal sleep environment</li>
                    <li>Managing sleep disorders</li>
                </ul>
            `,
            'mental-health': `
                <h6>Mental Wellness</h6>
                <p>Explore techniques for maintaining good mental health and managing stress...</p>
                <ul>
                    <li>Mindfulness and meditation</li>
                    <li>Stress management techniques</li>
                    <li>Building resilience</li>
                </ul>
            `,
            prevention: `
                <h6>Preventive Care</h6>
                <p>Learn about preventive measures to maintain long-term health...</p>
                <ul>
                    <li>Regular health screenings</li>
                    <li>Lifestyle modifications</li>
                    <li>Early detection strategies</li>
                </ul>
            `
        };
        
        return content[article.category] || `
            <p>This comprehensive article provides valuable insights into ${article.category} topics, helping you make informed decisions about your health and wellness journey.</p>
        `;
    }

    bookmarkArticle(articleId) {
        let bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
        const article = this.articles.find(a => a.id === articleId);
        
        if (!article) {
            console.log('Article not found:', articleId);
            return;
        }
        
        // Check if already bookmarked
        const existingIndex = bookmarks.findIndex(b => b.id === articleId);
        
        if (existingIndex === -1) {
            // Add new bookmark
            const bookmarkData = {
                id: articleId,
                title: article.title,
                category: article.category,
                readTime: article.readTime,
                excerpt: article.excerpt,
                image: article.image,
                bookmarkedDate: new Date().toISOString(),
                tags: article.tags
            };
            
            bookmarks.push(bookmarkData);
            localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks));
            
            console.log('Article bookmarked:', article.title);
            this.showToast('Article bookmarked successfully!', 'success');
            
        } else {
            // Remove bookmark
            bookmarks.splice(existingIndex, 1);
            localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks));
            
            console.log('Bookmark removed:', article.title);
            this.showToast('Bookmark removed', 'info');
        }
        
        // Update bookmark display
        this.displayBookmarks();
        
        // Update button state in modal if open
        this.updateBookmarkButton(articleId);
    }

    isArticleBookmarked(articleId) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
        return bookmarks.some(b => b.id === articleId);
    }

    updateBookmarkButton(articleId) {
        const isBookmarked = this.isArticleBookmarked(articleId);
        const bookmarkBtn = document.querySelector('.modal [data-bookmark-id="' + articleId + '"]');
        
        if (bookmarkBtn) {
            if (isBookmarked) {
                bookmarkBtn.innerHTML = '✅ Bookmarked';
                bookmarkBtn.classList.remove('btn-outline-primary');
                bookmarkBtn.classList.add('btn-success');
            } else {
                bookmarkBtn.innerHTML = '🔖 Bookmark';
                bookmarkBtn.classList.remove('btn-success');
                bookmarkBtn.classList.add('btn-outline-primary');
            }
        }
    }

    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-bg-${type} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    displayBookmarks() {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
        
        // Find or create bookmarks section
        let bookmarksSection = document.getElementById('bookmarksSection');
        if (!bookmarksSection) {
            // Create bookmarks section in sidebar
            const sidebar = document.querySelector('.col-lg-4');
            if (sidebar) {
                bookmarksSection = document.createElement('div');
                bookmarksSection.id = 'bookmarksSection';
                bookmarksSection.className = 'bookmarks-sidebar'; // Use new CSS class
                
                // Insert after existing sidebar content
                const sidebarCard = sidebar.querySelector('.calculator-widget');
                if (sidebarCard && sidebarCard.nextSibling) {
                    sidebar.insertBefore(bookmarksSection, sidebarCard.nextSibling);
                } else {
                    sidebar.appendChild(bookmarksSection);
                }
            }
        }
        
        if (bookmarksSection) {
            if (bookmarks.length > 0) {
                bookmarksSection.innerHTML = `
                    <h5 class="mb-3">🔖 Bookmarks (${bookmarks.length})</h5>
                    <div class="bookmark-list">
                        ${bookmarks.map(bookmark => `
                            <div class="bookmark-item mb-2 p-2 border rounded" style="cursor: pointer;" onclick="openArticle(${bookmark.id})">
                                <div class="fw-bold" style="font-size: 0.9rem;">${bookmark.title}</div>
                                <small class="text-muted">
                                    ${this.getCategoryLabel(bookmark.category)} • ${bookmark.readTime}
                                    <br>Saved: ${new Date(bookmark.bookmarkedDate).toLocaleDateString()}
                                </small>
                            </div>
                        `).join('')}
                    </div>
                    ${bookmarks.length > 3 ? `
                        <div class="text-center mt-3">
                            <button class="btn btn-sm btn-outline-primary" onclick="showAllBookmarks()">
                                View All Bookmarks
                            </button>
                        </div>
                    ` : ''}
                `;
            } else {
                bookmarksSection.innerHTML = `
                    <h5 class="mb-3">🔖 Bookmarks</h5>
                    <p class="text-muted text-center">
                        <small>No bookmarks yet.<br>Start bookmarking articles you find useful!</small>
                    </p>
                `;
            }
        }
    }
}

// Global functions for HTML interactions
function toggleFAQ(index) {
    const faqItems = document.querySelectorAll('.faq-item');
    const faqItem = faqItems[index];
    const answer = faqItem.querySelector('.faq-answer');
    const toggle = faqItem.querySelector('.faq-toggle');
    
    if (answer.classList.contains('show')) {
        answer.classList.remove('show');
        toggle.classList.remove('rotate');
        toggle.textContent = '+';
    } else {
        // Close other FAQs
        document.querySelectorAll('.faq-answer.show').forEach(a => {
            a.classList.remove('show');
        });
        document.querySelectorAll('.faq-toggle.rotate').forEach(t => {
            t.classList.remove('rotate');
            t.textContent = '+';
        });
        
        // Open selected FAQ
        answer.classList.add('show');
        toggle.classList.add('rotate');
        toggle.textContent = '×';
    }
}

function calculateBMI() {
    const height = parseFloat(document.getElementById('calcHeight').value);
    const weight = parseFloat(document.getElementById('calcWeight').value);
    
    if (!height || !weight || height <= 0 || weight <= 0) {
        alert('Please enter valid height and weight values');
        return;
    }
    
    const bmi = weight / ((height / 100) ** 2);
    const category = getBMICategory(bmi);
    
    document.getElementById('bmiValue').textContent = bmi.toFixed(1);
    document.getElementById('bmiCategory').textContent = category;
    document.getElementById('bmiResult').style.display = 'block';
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi < 24.9) return 'Normal weight';
    if (bmi >= 25 && bmi < 29.9) return 'Overweight';
    return 'Obesity';
}

// Global function to open article (called from HTML onclick)
function openArticle(articleId) {
    if (typeof resourcesHub !== 'undefined') {
        resourcesHub.openArticle(articleId);
    } else {
        console.error('ResourcesHub not initialized');
    }
}

// Global function to bookmark article (called from HTML onclick) 
function bookmarkArticle(articleId) {
    if (typeof resourcesHub !== 'undefined') {
        resourcesHub.bookmarkArticle(articleId);
    } else {
        console.error('ResourcesHub not initialized');
    }
}

// Add to existing global functions section (don't duplicate if already there):
function showAllBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    
    if (bookmarks.length === 0) {
        resourcesHub.showToast('No bookmarks found', 'info');
        return;
    }

    // Create modal for all bookmarks
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">🔖 Bookmarked Articles (${bookmarks.length})</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        ${bookmarks.map(bookmark => `
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between">
                                            <div class="flex-grow-1">
                                                <h6 class="card-title">${bookmark.title}</h6>
                                                <p class="card-text">
                                                    <small class="text-muted">
                                                        ${resourcesHub.getCategoryLabel(bookmark.category)} • ${bookmark.readTime}
                                                        <br>Bookmarked: ${new Date(bookmark.bookmarkedDate).toLocaleDateString()}
                                                    </small>
                                                </p>
                                                <p class="card-text">${bookmark.excerpt}</p>
                                            </div>
                                            <div class="ms-3 d-flex flex-column gap-2">
                                                <button class="btn btn-sm btn-primary" onclick="openArticle(${bookmark.id})">
                                                    📖 Read
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="removeBookmarkFromModal(${bookmark.id})">
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-danger" onclick="clearAllBookmarks()">
                        Clear All Bookmarks
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Close
                    </button>
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

function removeBookmarkFromModal(articleId) {
    resourcesHub.bookmarkArticle(articleId); // This will remove it since it's already bookmarked
    // Refresh the bookmarks modal
    const modal = document.querySelector('.modal.show');
    if (modal) {
        modal.querySelector('.btn-close').click();
        setTimeout(() => showAllBookmarks(), 300);
    }
}

function clearAllBookmarks() {
    if (confirm('Are you sure you want to clear all bookmarks? This cannot be undone.')) {
        localStorage.removeItem('bookmarkedArticles');
        resourcesHub.displayBookmarks();
        resourcesHub.showToast('All bookmarks cleared', 'info');
        
        // Close modal if open
        const modal = document.querySelector('.modal.show');
        if (modal) {
            modal.querySelector('.btn-close').click();
        }
    }
}

function shareArticle(articleId) {
    const article = resourcesHub.articles.find(a => a.id === articleId);
    if (article) {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(`${article.title}\n${article.excerpt}\n\n${window.location.href}`);
            resourcesHub.showToast('Article link copied to clipboard!', 'success');
        }
    }
}

// Initialize the ResourcesHub instance
const resourcesHub = new ResourcesHub();
