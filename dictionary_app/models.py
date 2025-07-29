from django.db import models

class DictionaryEntry(models.Model):
    from_content = models.CharField(max_length=255)  # English word or phrase
    types = models.CharField(max_length=100, blank=True)  # {n}, {v}, etc.
    to_content = models.TextField()  # Malayalam translation

    def __str__(self):
        return f"{self.from_content} → {self.to_content}"
