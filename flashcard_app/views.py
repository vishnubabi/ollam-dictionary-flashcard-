from django.shortcuts import render

# Create your views here.
def flashcard_views(request):
    return render(request,'flashcard_app/flashcard.html')
