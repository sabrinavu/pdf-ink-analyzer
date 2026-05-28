from django.urls import path
from .views import upload_and_analyze_poster

urlpatterns = [
    path('analyze/', upload_and_analyze_poster, name='analyze-poster'),
]