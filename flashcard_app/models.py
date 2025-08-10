from django.db import models

class Flashcard(models.Model):
    english_word = models.CharField(max_length=255, default='')
    malayalam_meaning = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.english_word} → {self.malayalam_meaning}"
