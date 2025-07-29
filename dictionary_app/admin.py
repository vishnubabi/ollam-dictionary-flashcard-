from django.contrib import admin
from .models import DictionaryEntry

@admin.register(DictionaryEntry)
class DictionaryEntryAdmin(admin.ModelAdmin):
    list_display = ('from_content', 'types', 'to_content')
    search_fields = ('from_content', 'to_content')
