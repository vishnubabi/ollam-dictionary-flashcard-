from django.urls import path
from . import views

urlpatterns = [
    path('', views.flashcard_views, name='flashcard_home'),
    path('review/', views.review_flashcard, name='review_flashcard'),
]
