from django.shortcuts import render
from .models import DictionaryEntry
from collections import defaultdict

def dictionary_list(request):
    query = request.GET.get('q')
    grouped_exact = {}
    related_matches = []

    # POS label mapping
    type_labels = {
        'n': 'Noun (നാമം)',
        'v': 'Verb (ക്രിയ)',
        'a': 'Adjective (വിശേഷണം)',
    }

    if query:
        # Exact match entries
        exact_entries = DictionaryEntry.objects.filter(from_content__iexact=query)

        # Group exact matches by type
        grouped = defaultdict(list)
        for entry in exact_entries:
            label = type_labels.get(entry.types.lower(), entry.types)  # fallback: original
            grouped[label].append(entry.to_content)

        grouped_exact = dict(grouped)

        # Related matches
        related_matches = DictionaryEntry.objects.filter(
            from_content__icontains=query
        ).exclude(from_content__iexact=query).order_by('from_content')

    context = {
        'query': query,
        'grouped_exact': grouped_exact,
        'related_matches': related_matches,
    }
    return render(request, 'dictionary_app/dictionary_list.html', context)
