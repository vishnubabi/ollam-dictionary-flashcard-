// Flashcard functionality with dark mode support
document.addEventListener('DOMContentLoaded', function() {
    const card = document.getElementById('card');
    const showBtn = document.getElementById('show-btn');
    const backButtons = document.getElementById('back-buttons');
    const frontButtons = document.getElementById('front-buttons');

    // Show answer functionality
    if (showBtn) {
        showBtn.addEventListener('click', function() {
            card.classList.add('flipped');
            
            // Wait for flip animation to complete
            setTimeout(() => {
                if (backButtons) {
                    backButtons.style.display = 'flex';
                }
                if (frontButtons) {
                    frontButtons.style.display = 'none';
                }
            }, 400);
        });
    }

    // Handle difficulty buttons
    const difficultyBtns = document.querySelectorAll('.multi-buttons button');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Add loading state
            this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Loading...';
            this.disabled = true;
            
            // Reload after short delay
            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
    });

    // Listen for theme changes
    window.addEventListener('themeChanged', function(event) {
        // Apply any additional theme-specific changes if needed
        console.log('Theme changed to:', event.detail.isDark ? 'dark' : 'light');
    });
});
