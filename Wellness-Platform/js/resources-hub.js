class ResourcesHub {
    constructor() {
        this.articles = this.generateArticles();
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.displayArticles();
            this.setupCategoryFilters();
        });
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
                image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=200&fit=crop",
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
            });
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const category = card.dataset.category;
                this.selectCategory(category);
            });
        });
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
        if (!article) return;

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
                        <button type="button" class="btn btn-outline-primary" onclick="shareArticle(${article.id})">
                            📤 Share
                        </button>
                        <button type="button" class="btn btn-primary" onclick="bookmarkArticle(${article.id})">
                            🔖 Bookmark
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
        // Generate comprehensive content based on article category
        const contentTemplates = {
            'nutrition': this.generateNutritionContent(article),
            'fitness': this.generateFitnessContent(article),
            'mental-health': this.generateMentalHealthContent(article),
            'sleep': this.generateSleepContent(article),
            'prevention': this.generatePreventionContent(article)
        };

        return contentTemplates[article.category] || this.generateGenericContent(article);
    }

    generateNutritionContent(article) {
        return `
            <h4>Understanding Nutrition Fundamentals</h4>
            <p>Proper nutrition is the foundation of good health. It involves consuming the right balance of macronutrients (carbohydrates, proteins, and fats) and micronutrients (vitamins and minerals) to support your body's functions.</p>
            
            <h5>Key Principles:</h5>
            <ul>
                <li><strong>Balance:</strong> Include foods from all food groups</li>
                <li><strong>Variety:</strong> Eat different foods within each group</li>
                <li><strong>Moderation:</strong> Control portion sizes and limit processed foods</li>
                <li><strong>Adequacy:</strong> Get enough nutrients for your needs</li>
            </ul>

            <h5>Practical Tips:</h5>
            <ul>
                <li>Fill half your plate with vegetables and fruits</li>
                <li>Choose whole grains over refined grains</li>
                <li>Include lean proteins at each meal</li>
                <li>Stay hydrated with water throughout the day</li>
                <li>Limit added sugars and sodium</li>
            </ul>

            <p>Remember, sustainable nutrition changes are gradual. Focus on making small, consistent improvements rather than drastic changes that are hard to maintain.</p>
        `;
    }

    generateFitnessContent(article) {
        return `
            <h4>Building Your Fitness Foundation</h4>
            <p>Regular physical activity is crucial for maintaining good health, preventing chronic diseases, and improving quality of life. The key is finding activities you enjoy and can stick with consistently.</p>
            
            <h5>Types of Exercise:</h5>
            <ul>
                <li><strong>Cardiovascular:</strong> Activities that strengthen your heart and lungs</li>
                <li><strong>Strength Training:</strong> Exercises that build and maintain muscle mass</li>
                <li><strong>Flexibility:</strong> Stretching and mobility work</li>
                <li><strong>Balance:</strong> Activities that improve stability and prevent falls</li>
            </ul>

            <h5>Getting Started:</h5>
            <ul>
                <li>Start with 10-15 minutes of activity daily</li>
                <li>Choose activities you enjoy</li>
                <li>Set realistic, achievable goals</li>
                <li>Listen to your body and rest when needed</li>
                <li>Progress gradually to avoid injury</li>
            </ul>

            <p>Consistency is more important than intensity. It's better to exercise moderately every day than intensely once a week.</p>
        `;
    }

    generateMentalHealthContent(article) {
        return `
            <h4>Caring for Your Mental Well-being</h4>
            <p>Mental health is just as important as physical health. It affects how we think, feel, and act, and influences our ability to handle stress, relate to others, and make decisions.</p>
            
            <h5>Signs of Good Mental Health:</h5>
            <ul>
                <li>Feeling good about yourself</li>
                <li>Having healthy relationships</li>
                <li>Managing stress effectively</li>
                <li>Adapting to change</li>
                <li>Enjoying life</li>
            </ul>

            <h5>Strategies for Mental Wellness:</h5>
            <ul>
                <li>Practice mindfulness and meditation</li>
                <li>Maintain social connections</li>
                <li>Get regular physical activity</li>
                <li>Ensure adequate sleep</li>
                <li>Limit alcohol and avoid drugs</li>
                <li>Seek professional help when needed</li>
            </ul>

            <p>Remember, seeking help is a sign of strength, not weakness. If you're struggling with your mental health, don't hesitate to reach out to a healthcare professional.</p>
        `;
    }

    generateSleepContent(article) {
        return `
            <h4>The Science of Quality Sleep</h4>
            <p>Sleep is essential for physical health, mental well-being, and cognitive function. During sleep, your body repairs itself, consolidates memories, and prepares for the next day.</p>
            
            <h5>Sleep Stages:</h5>
            <ul>
                <li><strong>Light Sleep:</strong> Transition from wakefulness</li>
                <li><strong>Deep Sleep:</strong> Physical restoration and growth</li>
                <li><strong>REM Sleep:</strong> Memory consolidation and dreaming</li>
            </ul>

            <h5>Sleep Hygiene Tips:</h5>
            <ul>
                <li>Maintain a consistent sleep schedule</li>
                <li>Create a relaxing bedtime routine</li>
                <li>Keep your bedroom cool, dark, and quiet</li>
                <li>Avoid screens before bedtime</li>
                <li>Limit caffeine and alcohol</li>
                <li>Get regular exercise (but not close to bedtime)</li>
            </ul>

            <p>Quality sleep is not a luxury—it's a necessity for optimal health and performance.</p>
        `;
    }

    generatePreventionContent(article) {
        return `
            <h4>Prevention: Your Best Health Investment</h4>
            <p>Preventive healthcare focuses on maintaining health and preventing disease rather than treating illness after it occurs. This approach is both more effective and cost-efficient.</p>
            
            <h5>Key Preventive Measures:</h5>
            <ul>
                <li><strong>Regular Screenings:</strong> Early detection of health issues</li>
                <li><strong>Vaccinations:</strong> Protection against infectious diseases</li>
                <li><strong>Healthy Lifestyle:</strong> Diet, exercise, and stress management</li>
                <li><strong>Risk Factor Management:</strong> Controlling blood pressure, cholesterol, etc.</li>
            </ul>

            <h5>Recommended Screenings:</h5>
            <ul>
                <li>Blood pressure checks</li>
                <li>Cholesterol testing</li>
                <li>Cancer screenings (mammograms, colonoscopy, etc.)</li>
                <li>Diabetes screening</li>
                <li>Regular dental and eye exams</li>
            </ul>

            <p>Work with your healthcare provider to create a personalized prevention plan based on your age, family history, and risk factors.</p>
        `;
    }

    generateGenericContent(article) {
        return `
            <p>${article.content}</p>
            <p>This article provides valuable insights into maintaining and improving your health through evidence-based practices and expert recommendations.</p>
        `;
    }

    bookmarkArticle(articleId) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
        if (!bookmarks.includes(articleId)) {
            bookmarks.push(articleId);
            localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarks));
            this.showToast('Article bookmarked!', 'success');
        } else {
            this.showToast('Article already bookmarked', 'info');
        }
    }

    shareArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) return;

        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            const text = `${article.title}\n${article.excerpt}\n${window.location.href}`;
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Article link copied to clipboard!', 'success');
            });
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
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
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function openArticle(articleId) {
    resourcesHub.openArticle(articleId);
}

function shareArticle(articleId) {
    resourcesHub.shareArticle(articleId);
}

function bookmarkArticle(articleId) {
    resourcesHub.bookmarkArticle(articleId);
}

// Initialize resources hub
const resourcesHub = new ResourcesHub();
