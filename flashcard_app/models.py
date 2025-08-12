from django.db import models
from django.utils import timezone

class Flashcard(models.Model):
    DIFFICULTY_CHOICES = [
        (1, 'Again'),
        (2, 'Hard'), 
        (3, 'Good'),
        (4, 'Easy'),
    ]
    
    english_word = models.CharField(max_length=255, default='')
    malayalam_meaning = models.TextField(default='')
    word_type = models.CharField(max_length=100, blank=True)  # Store POS info
    difficulty_level = models.IntegerField(choices=DIFFICULTY_CHOICES, default=1)
    times_reviewed = models.IntegerField(default=0)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    next_review = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.english_word} → {self.malayalam_meaning}"
    
    def update_review_schedule(self, difficulty):
        """Update review schedule based on spaced repetition algorithm"""
        from datetime import timedelta
        
        self.times_reviewed += 1
        self.last_reviewed = timezone.now()
        self.difficulty_level = difficulty
        
        # Spaced repetition intervals (in days)
        intervals = {
            1: 1,    # Again - 1 day
            2: 2,    # Hard - 2 days  
            3: 4,    # Good - 4 days
            4: 7,    # Easy - 7 days
        }
        
        # Increase interval based on review count
        base_interval = intervals.get(difficulty, 1)
        multiplier = min(self.times_reviewed * 0.5, 3)  # Cap at 3x
        final_interval = int(base_interval * (1 + multiplier))
        
        self.next_review = timezone.now() + timedelta(days=final_interval)
        self.save()
