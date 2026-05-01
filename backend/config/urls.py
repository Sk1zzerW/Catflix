from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include
from api.views import health, movie_list, movie_detail, genre_list

urlpatterns = [
    path('admin/', admin.site.urls),

    # API — health
    path('api/health/',           health),
    # API — movies
    path('api/movies/',           movie_list,   name='api_movies'),
    path('api/movies/<int:pk>/',  movie_detail, name='api_movie_detail'),
    path('api/genres/',           genre_list,   name='api_genres'),

    # API — auth (в users/urls.py)
    path('', include('users.urls')),

    # Редирект с корня на главную
    path('', lambda request: redirect('/home/')),
]
