from django.urls import path
from . import views

urlpatterns = [
    path('', views.dictionary_list, name='dictionary_list'),
]
