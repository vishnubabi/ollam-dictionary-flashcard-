// ============================================
// Malayalam Flashcard App - Auto Next Flashcard
// ============================================

class FlashcardApp {
    constructor() {
        this.currentCard = null;
        this._submitting = false;
        this.sessionStats = {
            reviewed: 0,
            correct: 0,
            startTime: new Date()
        };

        this.init();
    }

    init() {
        console.log('🎯 Initializing Malayalam Flashcard App');

        // DOM Elements
        this.flashcard = document.getElementById('flashcard');
        this.frontFace = document.getElementById('front-face');
        this.backFace = document.getElementById('back-face');
        this.revealBtn = document.getElementById('revealBtn');
        this.reviewActions = document.getElementById('reviewActions');
        this.meaningContainer = document.getElementById('meaningContainer');

        if (this.flashcard) {
            this.currentCard = { id: this.flashcard.dataset.cardId };
        }

        // Initial bindings
        this.setupEventListeners(); // Replaced bindCardEvents with a single setup
        this.setupKeyboardShortcuts();
        this.setupTouchGestures();
        this.checkScrollIndicator();
    }

    /**
     * FIX: Use event delegation to avoid attaching multiple listeners.
     * A single listener on the document body handles clicks for all relevant buttons.
     */
    setupEventListeners() {
        document.body.addEventListener('click', (e) => {
            // Find the closest matching button from the click target
            const revealButton = e.target.closest('#revealBtn');
            const difficultyButton = e.target.closest('.difficulty-btn');

            if (revealButton) {
                this.revealAnswer();
            } else if (difficultyButton) {
                const difficulty = parseInt(difficultyButton.dataset.difficulty);
                this.submitReview(difficulty);
            }
        });
    }

    revealAnswer() {
        if (!this.flashcard || this.flashcard.classList.contains('flipped')) return;

        this.revealBtn.disabled = true;
        this.revealBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Revealing...</span>';

        setTimeout(() => {
            this.flashcard.classList.add('flipped');

            setTimeout(() => {
                this.reviewActions.style.display = 'block';
                this.reviewActions.style.opacity = '0';
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
        if (!this.currentCard || this._submitting) return; // prevent double submit
        this._submitting = true;

        const selectedBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
        if (selectedBtn) selectedBtn.classList.add('selected');

        this.addCompletionEffect(difficulty);

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.disabled = true;
            if (btn !== selectedBtn) btn.style.opacity = '0.5';
        });

        // Update stats
        this.sessionStats.reviewed++;
        if (difficulty >= 3) this.sessionStats.correct++;

        if (selectedBtn) {
            selectedBtn.innerHTML = `
                <i class="bi bi-check-circle"></i>
                <span>Selected</span>
                <small>Loading next...</small>
            `;
        }

        setTimeout(() => {
            this.fetchNextCard(difficulty)
                .then(nextCard => {
                    if (nextCard) {
                        this.updateCardDOM(nextCard);
                    } else {
                        this.showNoMoreCardsMessage();
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch next card', err);
                    this.showError('Could not load next card. Please try again.');
                    this.resetButtonsAfterError();
                })
                .finally(() => {
                    this._submitting = false;
                });
        }, 600);
    }

    addCompletionEffect(difficulty) {
        const effects = {
            1: { emoji: '🔄', color: '#fc466b', message: 'Try again!' },
            2: { emoji: '😅', color: '#f5576c', message: 'Getting there!' },
            3: { emoji: '👍', color: '#38ef7d', message: 'Good job!' },
            4: { emoji: '🎉', color: '#667eea', message: 'Excellent!' }
        };

        const effect = effects[difficulty] || effects[3];
        const floatingEffect = document.createElement('div');
        floatingEffect.className = 'floating-effect';
        floatingEffect.innerHTML = `
            <div class="effect-emoji">${effect.emoji}</div>
            <div class="effect-message">${effect.message}</div>
        `;
        floatingEffect.style.cssText = `
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%); text-align: center;
            font-size: 1.5rem; font-weight: 700; color: ${effect.color};
            animation: float 1.5s ease-out; pointer-events: none; z-index: 1000;
        `;

        if (!document.querySelector('#float-animation')) {
            const style = document.createElement('style');
            style.id = 'float-animation';
            style.textContent = `
                @keyframes float {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) translateY(20px); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1) translateY(-10px); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) translateY(-30px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.flashcard.appendChild(floatingEffect);
        setTimeout(() => floatingEffect.remove(), 1500);
    }

    fetchNextCard(difficulty) {
        const csrftoken = this.getCsrfToken();

        return fetch('/flashcards/review/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                'X-Requested-With': 'XMLHttpRequest' // Good practice for AJAX
            },
            body: JSON.stringify({
                flashcard_id: this.currentCard.id,
                difficulty: difficulty
            })
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!data.success) throw new Error(data.error || 'Unknown error');
            return data.next_flashcard || null;
        });
    }

    fetchRandomFlashcard() {
        return fetch('/flashcards/?random=1', {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => res.json())
            .then(data => data.success && data.card ? data.card : null)
            .catch(() => null);
    }

    updateCardDOM(card) {
        if (!card) return;

        this.currentCard = { id: card.id };
        this.flashcard.dataset.cardId = card.id;
        
        const englishNode = document.querySelector('.english-word');
        if (englishNode) englishNode.textContent = card.english_word || '';

        this.meaningContainer.innerHTML = '';

        (card.parsed_meaning || []).forEach(section => {
            const secDiv = document.createElement('div');
            secDiv.classList.add('meaning-section');
            secDiv.innerHTML = `
                <div class="pos-tag pos-${section.type_code}">${section.type}</div>
                <div class="meanings-list">
                    ${(section.meanings || []).map(m => `<div class="meaning-item">${m}</div>`).join('')}
                </div>
            `;
            this.meaningContainer.appendChild(secDiv);
        });

        // Reset state
        this.flashcard.classList.remove('flipped');
        this.reviewActions.style.display = 'none';
        this.revealBtn.disabled = false;
        this.revealBtn.innerHTML = '<i class="bi bi-eye"></i> <span>Show Answer</span>';
        
        // Reset difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.classList.remove('selected');
            if (btn.dataset.original) {
                btn.innerHTML = btn.dataset.original;
            } else { // Store original state on first run
                btn.dataset.original = btn.innerHTML;
            }
        });

        this.checkScrollIndicator();
    }

    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    }

    checkScrollIndicator() {
        if (!this.meaningContainer) return;
        this.meaningContainer.style.borderRight = this.flashcard.classList.contains('flipped') &&
            this.meaningContainer.scrollHeight > this.meaningContainer.clientHeight
            ? '3px solid rgba(102,126,234,0.3)' : 'none';
    }

    startReviewTimer() { this.reviewStartTime = new Date(); }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (!this.flashcard) return;

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    if (!this.flashcard.classList.contains('flipped')) this.revealAnswer();
                    break;
                case 'Digit1': case 'Numpad1':
                    if (this.flashcard.classList.contains('flipped')) this.submitReview(1);
                    break;
                case 'Digit2': case 'Numpad2':
                    if (this.flashcard.classList.contains('flipped')) this.submitReview(2);
                    break;
                case 'Digit3': case 'Numpad3':
                    if (this.flashcard.classList.contains('flipped')) this.submitReview(3);
                    break;
                case 'Digit4': case 'Numpad4':
                    if (this.flashcard.classList.contains('flipped')) this.submitReview(4);
                    break;
            }
        });
    }

    setupTouchGestures() {
        if (!this.flashcard) return;
        let startY = 0, startX = 0, startTime = 0;
        
        this.flashcard.addEventListener('touchstart', e => {
            startY = e.touches[0].clientY; 
            startX = e.touches[0].clientX; // FIX: Was e.touches.clientX
            startTime = new Date().getTime();
        }, {passive: true});
        
        this.flashcard.addEventListener('touchend', e => {
            const endY = e.changedTouches[0].clientY; // FIX: Was e.changedTouches.clientY
            const endX = e.changedTouches[0].clientX; // FIX: Was e.changedTouches.clientX
            const endTime = new Date().getTime();
            const deltaY = startY - endY;
            const deltaX = startX - endX;
            const deltaTime = endTime - startTime;
            
            // Swipe up to reveal
            if(deltaY > 50 && Math.abs(deltaX) < 100 && deltaTime < 300 && !this.flashcard.classList.contains('flipped')) {
                this.revealAnswer();
            }
            // Swipe left/right to get random card
            if(Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50 && deltaTime < 300 && this.flashcard.classList.contains('flipped')) {
                this.fetchRandomFlashcard().then(nextCard => {
                    if (nextCard) this.updateCardDOM(nextCard);
                });
            }
        }, {passive: true});
    }

    resetButtonsAfterError() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.classList.remove('selected');
            if (btn.dataset.original) btn.innerHTML = btn.dataset.original;
        });
        this.revealBtn.disabled = false;
        this.revealBtn.innerHTML = '<i class="bi bi-eye"></i> <span>Show Answer</span>';
    }

    showNoMoreCardsMessage() {
        this.flashcard.classList.remove('flipped');
        this.reviewActions.style.display = 'none';
        const frontFace = this.flashcard.querySelector('.flashcard-front');
        if (frontFace) {
            frontFace.innerHTML = `
                <div class="word-container" style="color: white; text-align: center;">
                    <i class="bi bi-check2-circle" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.5rem;">All done for now!</h3>
                    <p>Great job clearing your reviews.</p>
                </div>
            `;
        }
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; bottom: 16px; left: 50%;
            transform: translateX(-50%); padding: 10px 14px;
            background: #e11d48; color: #fff; border-radius: 8px;
            z-index: 9999; font-size: 14px;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardApp = new FlashcardApp();
});