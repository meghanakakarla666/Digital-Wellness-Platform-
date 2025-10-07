class WellnessAssessment {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {};
        this.init();
    }

    init() {
        this.loadSavedData();
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Auto-save on form changes
        const form = document.getElementById('healthAssessmentForm');
        if (form) {
            form.addEventListener('change', () => this.autoSave());
            form.addEventListener('input', () => this.autoSave());
        }

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStep();
            
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
                this.updateUI();
            }
        } else {
            this.showValidationErrors();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateUI();
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.type === 'radio' ? 
            document.querySelector(`[name="${field.name}"]:checked`)?.value : 
            field.value;

        if (!value || value.trim() === '') {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);

        // Add error class
        field.classList.add('is-invalid');

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    showValidationErrors() {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            <strong>Please complete all required fields before continuing.</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const form = document.getElementById('healthAssessmentForm');
        form.insertBefore(alert, form.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    saveCurrentStep() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const formData = new FormData();
        
        // Get all form elements in current step
        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                if (input.checked) {
                    this.formData[input.name] = input.value;
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });

        this.autoSave();
    }

    autoSave() {
        // Save to localStorage
        localStorage.setItem('wellnessAssessment', JSON.stringify({
            formData: this.formData,
            currentStep: this.currentStep,
            timestamp: new Date().toISOString()
        }));

        // Show save indicator
        this.showSaveIndicator();
    }

    loadSavedData() {
        const saved = localStorage.getItem('wellnessAssessment');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.formData = data.formData || {};
                this.currentStep = data.currentStep || 1;
                
                // Restore form values
                this.restoreFormValues();
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }

    restoreFormValues() {
        Object.keys(this.formData).forEach(name => {
            const value = this.formData[name];
            const field = document.querySelector(`[name="${name}"]`);
            
            if (field) {
                if (field.type === 'radio') {
                    const radioButton = document.querySelector(`[name="${name}"][value="${value}"]`);
                    if (radioButton) radioButton.checked = true;
                } else if (field.type === 'checkbox') {
                    field.checked = value === 'true' || value === true;
                } else {
                    field.value = value;
                }
            }
        });
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.style.display = 'none';
        });

        // Show current step
        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.style.display = 'block';
        }
    }

    updateUI() {
        // Update progress bar
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressBar = document.getElementById('progressBar');
        const currentStepSpan = document.getElementById('currentStep');
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', progress);
        }
        
        if (currentStepSpan) {
            currentStepSpan.textContent = this.currentStep;
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }

        if (nextBtn && submitBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }
    }

    showSaveIndicator() {
        // Create or update save indicator
        let indicator = document.getElementById('saveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'saveIndicator';
            indicator.className = 'position-fixed top-0 end-0 m-3 alert alert-success alert-sm';
            indicator.style.zIndex = '9999';
            indicator.style.opacity = '0';
            indicator.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(indicator);
        }

        indicator.innerHTML = '💾 Progress saved automatically';
        indicator.style.opacity = '1';

        // Fade out after 2 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateCurrentStep()) {
            this.saveCurrentStep();
            this.completeAssessment();
        }
    }

    completeAssessment() {
        // Calculate results
        const results = this.calculateHealthResults();
        
        // Save final results
        localStorage.setItem('wellnessResults', JSON.stringify(results));
        
        // Redirect to results dashboard
        window.location.href = 'results-dashboard.html';
    }

    calculateHealthResults() {
        const data = this.formData;
        
        // Basic health score calculation
        let healthScore = 0;
        let recommendations = [];

        // Breakfast habits (20 points)
        if (data.breakfast === 'yes') healthScore += 20;
        else if (data.breakfast === 'sometimes') healthScore += 10;
        else recommendations.push('Consider establishing a regular breakfast routine');

        // Self-rated health (30 points)
        if (data.healthRating) {
            healthScore += parseInt(data.healthRating) * 3;
        }

        // BMI calculation (if data available)
        let bmi = null;
        if (data.weight && data.height) {
            const heightM = data.height / 100;
            bmi = data.weight / (heightM * heightM);
        }

        return {
            healthScore,
            bmi,
            recommendations,
            completedAt: new Date().toISOString(),
            formData: data
        };
    }
}

// Initialize assessment when page loads
let assessmentInstance;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('healthAssessmentForm')) {
        assessmentInstance = new WellnessAssessment();
    }
});

// Global functions for button clicks
function nextStep() {
    if (assessmentInstance) {
        assessmentInstance.nextStep();
    }
}

function previousStep() {
    if (assessmentInstance) {
        assessmentInstance.previousStep();
    }
}