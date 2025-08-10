from django.shortcuts import render
from .models import Flashcard
import random

def flashcard_views(request):
    # Get a random flashcard
    flashcards = Flashcard.objects.all()
    current_flashcard = None
    
    if flashcards.exists():
        current_flashcard = random.choice(flashcards)
    
    context = {
        'current_flashcard': current_flashcard
    }
    return render(request, 'flashcard_app/flashcard.html', context)
