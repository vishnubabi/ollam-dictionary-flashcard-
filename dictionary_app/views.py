from django.shortcuts import render
from .models import DictionaryEntry

def dictionary_list(request):
    query = request.GET.get('q')
    exact_match = []
    related_matches = []

    if query:
        # Exact match first
        exact_match = DictionaryEntry.objects.filter(from_content__iexact=query)

        # Related words that *contain* query but not exactly equal
        related_matches = DictionaryEntry.objects.filter(from_content__icontains=query).exclude(from_content__iexact=query).order_by('from_content')

    context = {
        'query': query,
        'exact_match': exact_match,
        'related_matches': related_matches,
    }
    return render(request, 'dictionary_app/dictionary_list.html', context)
