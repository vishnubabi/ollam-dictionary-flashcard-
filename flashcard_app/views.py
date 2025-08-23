from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from .models import Flashcard
import random
import json
import re # Import the regular expression module


@login_required
def flashcard_views(request):
    """Render the flashcard page with the current due or random flashcard"""

    # Handle AJAX request for random card - simplified for modern fetch API
    if 'random' in request.GET:
        all_cards = Flashcard.objects.all()
        card = random.choice(list(all_cards)) if all_cards.exists() else None

        if card:
            return JsonResponse({
                'success': True,
                'card': {
                    'id': card.id,
                    'english_word': safe_get_attr(card, 'english_word', ''),
                    'malayalam_meaning': safe_get_attr(card, 'malayalam_meaning', ''),
                    'parsed_meaning': parse_meaning_with_pos(safe_get_attr(card, 'malayalam_meaning', '')),
                }
            })
        else:
            return JsonResponse({'success': True, 'card': None})

    # Regular page load
    due_flashcards = Flashcard.objects.filter(
        next_review__lte=timezone.now()
    ).order_by('next_review')

    if due_flashcards.exists():
        current_flashcard = due_flashcards.first()
    else:
        all_cards = Flashcard.objects.all()
        current_flashcard = random.choice(list(all_cards)) if all_cards.exists() else None

    # Parse meanings safely
    parsed_meaning = parse_meaning_with_pos(
        safe_get_attr(current_flashcard, 'malayalam_meaning', '') if current_flashcard else ''
    )

    # Statistics
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


def safe_get_attr(obj, attr_name, default=''):
    """Safely get attribute from object, return default if not exists or None"""
    if obj is None:
        return default
    return getattr(obj, attr_name, default) or default


def parse_meaning_with_pos(meaning_text):
    """
    Robust parser for Malayalam meaning using regular expressions.
    Handles strings with multiple parts of speech.
    Returns: [{'type': str, 'type_code': str, 'meanings': [str, ...]}]
    """
    if not isinstance(meaning_text, str) or not meaning_text.strip():
        return [{
            'type': 'General',
            'type_code': 'general',
            'meanings': [str(meaning_text)] if meaning_text else []
        }]

    # Define POS labels and create a regex pattern to split the string by them
    pos_labels = {
        'Noun (നാമം)': 'noun',
        'Verb (ക്രിയ)': 'verb',
        'Adjective (വിശേഷണം)': 'adjective'
    }
    # Pattern to find any of the labels, like (Noun (നാമം)|Verb (ക്രിയ)|...)
    split_pattern = '|'.join(re.escape(label) for label in pos_labels.keys())

    if not split_pattern:
        return [{
            'type': 'General',
            'type_code': 'general',
            'meanings': [m.strip() for m in meaning_text.split(',') if m.strip()]
        }]

    # Split the text by the labels, keeping the labels in the resulting list
    parts = re.split(f'({split_pattern})', meaning_text)
    parsed_sections = []
    
    # Handle any text that comes *before* the first label
    initial_content = parts[0].strip(' :|,\n')
    if initial_content:
        meanings = [m.strip() for m in initial_content.split(',') if m.strip()]
        if meanings:
            parsed_sections.append({
                'type': 'General',
                'type_code': 'general',
                'meanings': meanings
            })
    
    # Process the text that comes after each label
    # The list is structured as [before, label1, after1, label2, after2, ...]
    i = 1
    while i < len(parts):
        label = parts[i]
        content = parts[i+1] if (i + 1) < len(parts) else ''
        
        pos_code = pos_labels.get(label, 'general')
        
        # Clean up the content and split into individual meanings
        clean_content = content.strip(' :|,\n')
        meanings = [m.strip() for m in clean_content.split(',') if m.strip()]
        
        if meanings:
            parsed_sections.append({
                'type': label,
                'type_code': pos_code,
                'meanings': meanings
            })
        i += 2 # Move to the next label-content pair

    # If parsing resulted in nothing, treat the whole text as a single general meaning
    if not parsed_sections and meaning_text:
        meanings = [m.strip() for m in meaning_text.split(',') if m.strip()]
        parsed_sections.append({
            'type': 'General',
            'type_code': 'general',
            'meanings': meanings if meanings else [meaning_text]
        })

    return parsed_sections


@login_required
@require_POST
def review_flashcard(request):
    """Handle flashcard review and return next flashcard (due-first, else random)"""
    try:
        # Parse request body
        body = request.body.decode('utf-8') if request.body else '{}'
        data = json.loads(body)

        flashcard_id = data.get('flashcard_id')
        difficulty = int(data.get('difficulty', 1))

        if not flashcard_id:
            return JsonResponse({
                'success': False,
                'error': 'flashcard_id is required'
            }, status=400)

        # Get and update current flashcard
        flashcard = get_object_or_404(Flashcard, id=flashcard_id)

        # Update spaced-repetition schedule
        flashcard.update_review_schedule(difficulty)

        # Find next flashcard (due first, else random)
        due_cards = Flashcard.objects.filter(
            next_review__lte=timezone.now()
        ).exclude(id=flashcard_id).order_by('next_review')

        if due_cards.exists():
            next_flashcard = due_cards.first()
        else:
            # Get random card excluding current one
            available_cards = Flashcard.objects.exclude(id=flashcard_id)
            next_flashcard = random.choice(list(available_cards)) if available_cards.exists() else None

        # Prepare next card data
        if next_flashcard:
            next_card_data = {
                'id': next_flashcard.id,
                'english_word': safe_get_attr(next_flashcard, 'english_word', ''),
                'malayalam_meaning': safe_get_attr(next_flashcard, 'malayalam_meaning', ''),
                'parsed_meaning': parse_meaning_with_pos(
                    safe_get_attr(next_flashcard, 'malayalam_meaning', '')
                ),
            }
        else:
            next_card_data = None

        return JsonResponse({
            'success': True,
            'updated_flashcard': {
                'id': flashcard.id,
                'next_review': flashcard.next_review.isoformat() if hasattr(flashcard, 'next_review') and flashcard.next_review else None,
                'times_reviewed': safe_get_attr(flashcard, 'times_reviewed', 0),
            },
            'next_flashcard': next_card_data
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON in request body'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Server error: {str(e)}'
        }, status=500)