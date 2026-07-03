// ==========================================================================
// PERSISTENT COUNTDOWN TIMER (Oferta Especial)
// ==========================================================================
function initCountdown() {
    function getRandomSeconds() {
        return Math.floor(Math.random() * (59 - 10 + 1)) + 10;
    }

    function setTargetTime() {
        const durationMs = (27 * 60 * 1000) + (getRandomSeconds() * 1000);
        const target = new Date().getTime() + durationMs;
        localStorage.setItem('enem_countdown_target', target);
        return target;
    }

    let countdownTarget = localStorage.getItem('enem_countdown_target');

    if (!countdownTarget) {
        countdownTarget = setTargetTime();
    } else {
        countdownTarget = parseInt(countdownTarget, 10);
        // If the saved target has already passed, reset it to a new 27m + randomS interval
        if (new Date().getTime() > countdownTarget) {
            countdownTarget = setTargetTime();
        }
    }

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateTimer() {
        const now = new Date().getTime();
        let distance = countdownTarget - now;

        // If countdown reaches zero, reset the target
        if (distance < 0) {
            countdownTarget = setTargetTime();
            distance = countdownTarget - now;
        }

        // Calculate days, hours, minutes, seconds
        // Max duration is ~28 minutes, so days and hours will be 0
        const days = 0;
        const hours = 0;
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Render with leading zeros
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer(); // Initial call
    setInterval(updateTimer, 1000);
}

// ==========================================================================
// DIAGNOSTIC QUIZ SYSTEM
// ==========================================================================
const totalSteps = 3;
const quizAnswers = { q1: '', q2: '', q3: '' };

// Event listener for quiz options selection styling
document.querySelectorAll('.quiz-option-card').forEach(card => {
    card.addEventListener('click', function() {
        const radio = this.querySelector('.quiz-radio');
        radio.checked = true;
        
        // Remove active selection classes from siblings
        const siblingCards = this.parentElement.querySelectorAll('.quiz-option-card');
        siblingCards.forEach(sCard => sCard.classList.remove('selected'));
        
        // Add class to selected
        this.classList.add('selected');
        
        // Save the chosen value
        const questionName = radio.getAttribute('name');
        quizAnswers[questionName] = radio.value;
    });
});

function updateProgressBar(stepNum) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (stepNum <= totalSteps) {
        const percentage = (stepNum / totalSteps) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `Pergunta ${stepNum} de ${totalSteps}`;
    }
}

function nextStep(currentStep) {
    // Check validation: user must select an option
    const optionsSelected = document.querySelectorAll(`#step-${currentStep} .quiz-radio:checked`);
    if (optionsSelected.length === 0) {
        // Highlight option cards with a shake/error glow effect to guide user
        const optionsContainer = document.querySelector(`#step-${currentStep} .quiz-options`);
        optionsContainer.style.animation = 'none';
        // Trigger reflow
        void optionsContainer.offsetWidth;
        optionsContainer.style.animation = 'shakeGlow 0.5s ease-in-out';
        return;
    }

    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Show next step
    const nextStepNum = currentStep + 1;
    const nextStepEl = document.getElementById(`step-${nextStepNum}`);
    if (nextStepEl) {
        nextStepEl.classList.add('active');
        updateProgressBar(nextStepNum);
    }
}

function prevStep(currentStep) {
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    // Show previous step
    const prevStepNum = currentStep - 1;
    document.getElementById(`step-${prevStepNum}`).classList.add('active');
    updateProgressBar(prevStepNum);
}

function showResult() {
    // Validate Step 3 selection
    const optionsSelected = document.querySelectorAll(`#step-3 .quiz-radio:checked`);
    if (optionsSelected.length === 0) {
        const optionsContainer = document.querySelector(`#step-3 .quiz-options`);
        optionsContainer.style.animation = 'none';
        void optionsContainer.offsetWidth;
        optionsContainer.style.animation = 'shakeGlow 0.5s ease-in-out';
        return;
    }

    // Hide step 3
    document.getElementById('step-3').classList.remove('active');
    
    // Hide progress bar wrapper to highlight the final result card cleanly
    document.querySelector('.quiz-progress-wrapper').style.display = 'none';
    
    // Show result step
    document.getElementById('step-result').classList.add('active');
}

// Style inject for shake/error feedback animation on options container
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shakeGlow {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
}
`;
document.head.appendChild(styleSheet);

// ==========================================================================
// FAQ ACCORDION ACCESSIBILITY & ANIMATION
// ==========================================================================
function toggleFaq(button) {
    const item = button.parentElement;
    const content = item.querySelector('.faq-content');
    const isActive = item.classList.contains('active');

    // Close all other active items
    document.querySelectorAll('.faq-item').forEach(faqItem => {
        if (faqItem !== item) {
            faqItem.classList.remove('active');
            faqItem.querySelector('.faq-content').style.maxHeight = null;
        }
    });

    // Toggle current item
    if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
    } else {
        item.classList.add('active');
        // Set dynamic height for smooth CSS transition
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

// ==========================================================================
// SCROLL REVEAL (INTERSECTION OBSERVER)
// ==========================================================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            threshold: 0.1, // trigger when 10% of element is visible
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Stop observing after animation triggers
                }
            });
        }, observerOptions);

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
    }
}

// ==========================================================================
// PAGE INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initScrollReveal();
});
