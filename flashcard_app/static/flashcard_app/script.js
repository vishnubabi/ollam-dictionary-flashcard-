// Get main card and buttons
const card = document.getElementById('card');
const showBtn = document.getElementById('show-btn');
const backButtons = document.getElementById('back-buttons');
const frontButtons = document.getElementById('front-buttons');

// Flip the card
showBtn.addEventListener('click', function () {
  card.classList.add('flipped');
  setTimeout(() => {
    backButtons.style.display = 'flex';
    frontButtons.style.display = 'none';
  }, 410); 
});

// Handle review buttons
backButtons.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', function() {
    location.reload(); // Placeholder logic
  });
});
