from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import Flashcard
import json
import random
from django.contrib.auth.decorators import login_required

@login_required
def flashcard_views(request):
    
    # Get due flashcards (cards ready for review)
    due_flashcards = Flashcard.objects.filter(
        next_review__lte=timezone.now()
    ).order_by('next_review')
    
    # If no due cards, get random cards
    if not due_flashcards.exists():
        all_flashcards = Flashcard.objects.all()
        current_flashcard = random.choice(all_flashcards) if all_flashcards.exists() else None
    else:
        current_flashcard = due_flashcards.first()
    
    # Parse malayalam_meaning to extract POS info
    if current_flashcard and current_flashcard.malayalam_meaning:
        parsed_meaning = parse_meaning_with_pos(current_flashcard.malayalam_meaning)
    else:
        parsed_meaning = None
    
    # Get statistics
    total_cards = Flashcard.objects.count()
    due_today = due_flashcards.count()
    reviewed_today = Flashcard.objects.filter(
        last_reviewed__date=timezone.now().date()
    ).count()
    
    context = {
        'current_flashcard': current_flashcard,
        'parsed_meaning': parsed_meaning,
        'total_cards': total_cards,
        'due_today': due_today,
        'reviewed_today': reviewed_today,
    }
    return render(request, 'flashcard_app/flashcard.html', context)

def parse_meaning_with_pos(meaning_text):
    """Parse meaning text to extract POS classifications"""
    pos_labels = {
        'Noun (നാമം)': 'noun',
        'Verb (ക്രിയ)': 'verb', 
        'Adjective (വിശേഷണം)': 'adjective'
    }
    
    parsed_sections = []
    
    # Split by POS labels
    for label, pos_type in pos_labels.items():
        if label in meaning_text:
            parts = meaning_text.split(label)
            if len(parts) > 1:
                meanings = parts[1].split('|')[0].strip()
                parsed_sections.append({
                    'type': label,
                    'type_code': pos_type,
                    'meanings': [m.strip() for m in meanings.split(',') if m.strip()]
                })
    
    # If no POS found, treat as general meaning
    if not parsed_sections:
        parsed_sections.append({
            'type': 'General',
            'type_code': 'general',
            'meanings': [meaning_text.strip()]
        })
    
    return parsed_sections

@require_POST
@csrf_exempt
def review_flashcard(request):
    try:
        data = json.loads(request.body)
        flashcard_id = data.get('flashcard_id')
        difficulty = int(data.get('difficulty'))
        
        flashcard = get_object_or_404(Flashcard, id=flashcard_id)
        flashcard.update_review_schedule(difficulty)
        
        return JsonResponse({
            'success': True,
            'next_review': flashcard.next_review.isoformat(),
            'times_reviewed': flashcard.times_reviewed
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
