from django.urls import path
from landing.views import reviews_create

app_name = 'reviews'

urlpatterns = [
    path('create/', reviews_create, name='create'),   # страница с слайдером отзывов
]
