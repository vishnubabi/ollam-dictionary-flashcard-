from django.shortcuts import render
from .models import DictionaryEntry
def dictionary_list(request):
    query = request.GET.get('q')
    if query:
        entries = DictionaryEntry.objects.filter(from_content__icontains=query)
    else:
        entries = DictionaryEntry.objects.all()[:100]

    print(f"Query: {query} | Found: {entries.count()}")  # 👀 Debug

    # 👇 Temporary debug output
    for entry in entries[:5]:
        print(entry.from_content, "→", entry.to_content)

    return render(request, 'dictionary_app/dictionary_list.html', {'entries': entries})
