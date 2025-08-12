// Flashcard App with Enhanced Features
class FlashcardApp {
    constructor() {
        this.currentCard = null;
        this.sessionStats = {
            reviewed: 0,
            correct: 0,
            startTime: new Date()
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing Modern Flashcard App');
        
        // Get DOM elements
        this.flashcard = document.getElementById('flashcard');
        this.frontFace = document.getElementById('front-face');
        this.backFace = document.getElementById('back-face');
        this.revealBtn = document.getElementById('revealBtn');
        this.reviewActions = document.getElementById('reviewActions');
        this.meaningContainer = document.getElementById('meaningContainer');
        
        // Get card data
        if (this.flashcard) {
            this.currentCard = {
                id: this.flashcard.dataset.cardId
            };
        }
        
        this.bindEvents();
        this.setupKeyboardShortcuts();
        this.setupTouchGestures();
        this.checkScrollIndicator();
    }
    
    bindEvents() {
        // Reveal answer
        if (this.revealBtn) {
            this.revealBtn.addEventListener('click', () => this.revealAnswer());
        }
        
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = parseInt(e.currentTarget.dataset.difficulty);
                this.submitReview(difficulty);
            });
        });
        
        // Window resize handler
        window.addEventListener('resize', () => this.checkScrollIndicator());
    }
    
    revealAnswer() {
        console.log('👀 Revealing answer');
        
        // Add visual feedback
        this.revealBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Revealing...</span>';
        this.revealBtn.disabled = true;
        
        // Flip card after short delay
        setTimeout(() => {
            this.flashcard.classList.add('flipped');
            
            // Show review actions after flip animation
            setTimeout(() => {
                this.reviewActions.style.display = 'block';
                this.reviewActions.style.opacity = '0';
                
                // Fade in review actions
                requestAnimationFrame(() => {
                    this.reviewActions.style.transition = 'opacity 0.3s ease';
                    this.reviewActions.style.opacity = '1';
                });
                
                this.checkScrollIndicator();
                this.startReviewTimer();
            }, 400);
        }, 300);
    }
    
    submitReview(difficulty) {
        console.log(`📝 Submitting review with difficulty: ${difficulty}`);
        
        // Visual feedback
        const selectedBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
        selectedBtn.classList.add('selected');
        
        // Add completion effect
        this.addCompletionEffect(difficulty);
        
        // Disable all buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.disabled = true;
            if (btn !== selectedBtn) {
                btn.style.opacity = '0.5';
            }
        });
        
        // Update session stats
        this.sessionStats.reviewed++;
        if (difficulty >= 3) {
            this.sessionStats.correct++;
        }
        
        // Show selected state
        selectedBtn.innerHTML = `
            <i class="bi bi-check-circle"></i>
            <span>Selected</span>
            <small>Loading...</small>
        `;
        
        // Auto-proceed to next card
        setTimeout(() => {
            this.loadNextCard();
        }, 1500);
    }
    
    addCompletionEffect(difficulty) {
        // Create effect based on difficulty
        const effects = {
            1: { emoji: '🔄', color: '#fc466b', message: 'Try again!' },
            2: { emoji: '😅', color: '#f5576c', message: 'Getting there!' },
            3: { emoji: '👍', color: '#38ef7d', message: 'Good job!' },
            4: { emoji: '🎉', color: '#667eea', message: 'Excellent!' }
        };
        
        const effect = effects[difficulty];
        
        // Add floating effect
        const floatingEffect = document.createElement('div');
        floatingEffect.className = 'floating-effect';
        floatingEffect.innerHTML = `
            <div class="effect-emoji">${effect.emoji}</div>
            <div class="effect-message">${effect.message}</div>
        `;
        floatingEffect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: ${effect.color};
            animation: float 1.5s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        // Add animation keyframes
        if (!document.querySelector('#float-animation')) {
            const style = document.createElement('style');
            style.id = 'float-animation';
            style.textContent = `
                @keyframes float {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) translateY(20px); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1) translateY(-10px); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) translateY(-30px); }
                }
                .effect-emoji { font-size: 2rem; margin-bottom: 0.5rem; }
                .effect-message { font-size: 1rem; }
            `;
            document.head.appendChild(style);
        }
        
        this.flashcard.appendChild(floatingEffect);
        
        // Remove after animation
        setTimeout(() => {
            floatingEffect.remove();
        }, 1500);
    }
    
    loadNextCard() {
        // Add loading state
        document.body.classList.add('loading');
        
        // Reload page for next card
        window.location.reload();
    }
    
    checkScrollIndicator() {
        if (this.meaningContainer && this.flashcard.classList.contains('flipped')) {
            const isScrollable = this.meaningContainer.scrollHeight > this.meaningContainer.clientHeight;
            
            if (isScrollable) {
                // Add visual scroll indicator
                this.meaningContainer.style.borderRight = '3px solid rgba(102, 126, 234, 0.3)';
                
                // Add scroll hint if not already present
                if (!this.meaningContainer.querySelector('.scroll-hint')) {
                    const hint = document.createElement('div');
                    hint.className = 'scroll-hint';
                    hint.innerHTML = '<i class="bi bi-chevron-down"></i>';
                    hint.style.cssText = `
                        position: absolute;
                        bottom: 5px;
                        right: 5px;
                        color: rgba(102, 126, 234, 0.6);
                        font-size: 1rem;
                        animation: bounce 2s infinite;
                        pointer-events: none;
                    `;
                    
                    // Add bounce animation if not already present
                    if (!document.querySelector('#bounce-animation')) {
                        const bounceStyle = document.createElement('style');
                        bounceStyle.id = 'bounce-animation';
                        bounceStyle.textContent = `
                            @keyframes bounce {
                                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                                40% { transform: translateY(-5px); }
                                60% { transform: translateY(-3px); }
                            }
                        `;
                        document.head.appendChild(bounceStyle);
                    }
                    
                    this.meaningContainer.style.position = 'relative';
                    this.meaningContainer.appendChild(hint);
                    
                    // Remove hint after user scrolls
                    this.meaningContainer.addEventListener('scroll', () => {
                        hint.remove();
                    }, { once: true });
                }
            } else {
                this.meaningContainer.style.borderRight = 'none';
            }
        }
    }
    
    startReviewTimer() {
        // Track time spent reviewing
        this.reviewStartTime = new Date();
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts if typing
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!this.flashcard.classList.contains('flipped')) {
                        this.revealAnswer();
                    }
                    break;
                    
                case 'Digit1':
                case 'Numpad1':
                    e.preventDefault();
                    if (this.flashcard.classList.contains('flipped')) {
                        this.submitReview(1);
                    }
                    break;
                    
                case 'Digit2':
                case 'Numpad2':
                    e.preventDefault();
                    if (this.flashcard.classList.contains('flipped')) {
                        this.submitReview(2);
                    }
                    break;
                    
                case 'Digit3':
                case 'Numpad3':
                    e.preventDefault();
                    if (this.flashcard.classList.contains('flipped')) {
                        this.submitReview(3);
                    }
                    break;
                    
                case 'Digit4':
                case 'Numpad4':
                    e.preventDefault();
                    if (this.flashcard.classList.contains('flipped')) {
                        this.submitReview(4);
                    }
                    break;
                    
                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.loadNextCard();
                    }
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    this.showHelp();
                    break;
            }
        });
        
        // Show keyboard shortcuts hint
        this.showKeyboardHint();
    }
    
    setupTouchGestures() {
        let startY = 0;
        let startX = 0;
        let startTime = 0;
        
        this.flashcard?.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
            startTime = new Date().getTime();
        }, { passive: true });
        
        this.flashcard?.addEventListener('touchend', (e) => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const endTime = new Date().getTime();
            const deltaY = startY - endY;
            const deltaX = Math.abs(startX - endX);
            const deltaTime = endTime - startTime;
            
            // Swipe up to reveal (fast swipe)
            if (deltaY > 50 && deltaX < 100 && deltaTime < 300 && 
                !this.flashcard.classList.contains('flipped')) {
                this.revealAnswer();
            }
            
            // Swipe left/right for next card (when card is flipped)
            if (Math.abs(deltaX) > 100 && deltaY < 50 && deltaTime < 300 &&
                this.flashcard.classList.contains('flipped')) {
                this.loadNextCard();
            }
        }, { passive: true });
    }
    
    showKeyboardHint() {
        // Show keyboard shortcuts for first-time users
        const hasSeenHint = localStorage.getItem('flashcard_keyboard_hint');
        if (!hasSeenHint) {
            setTimeout(() => {
                this.showToast('💡 Tip: Use Space to reveal, 1-4 for difficulty, Ctrl+R for next card', 'info', 5000);
                localStorage.setItem('flashcard_keyboard_hint', 'true');
            }, 2000);
        }
    }
    
    showHelp() {
        const helpText = `⌨️ Keyboard Shortcuts:
Space - Reveal answer
1-4 - Rate difficulty (Again, Hard, Good, Easy)
Ctrl+R - Next card

📱 Touch Gestures:
Swipe up - Reveal answer
Swipe left/right - Next card (after reveal)`;
        
        this.showToast(helpText, 'info', 8000);
    }
    
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">${message}</pre>
            </div>
        `;
        
        const colors = {
            info: '#667eea',
            success: '#38ef7d',
            warning: '#f5576c',
            error: '#fc466b'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 300px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        `;
        
        // Add slide-in animation
        if (!document.querySelector('#toast-animation')) {
            const style = document.createElement('style');
            style.id = 'toast-animation';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        });
    }
    
    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name=csrf-token]')?.content || '';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new FlashcardApp();
});

// Utility functions for external use
window.flashcardUtils = {
    reveal: () => window.flashcardApp?.revealAnswer(),
    rate: (difficulty) => window.flashcardApp?.submitReview(difficulty),
    next: () => window.flashcardApp?.loadNextCard(),
    help: () => window.flashcardApp?.showHelp()
};

// Performance monitoring
if (typeof console !== 'undefined' && console.log) {
    console.log('📚 Malayalam Flashcard App loaded successfully!');
    console.log('🎮 Quick commands: flashcardUtils.reveal(), flashcardUtils.rate(1-4), flashcardUtils.next()');
}
