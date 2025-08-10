from django.urls import path
from . import views

urlpatterns = [
    path('', views.dictionary_list, name='dictionary_list'),
    path('add-flashcard/', views.add_flashcard, name='add_flashcard'),
]
