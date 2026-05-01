from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include
from api.views import health, movie_list, movie_detail, genre_list, rate_movie

urlpatterns = [
    path('admin/', admin.site.urls),

    # API
    path('api/health/',                health),
    path('api/movies/',                movie_list,   name='api_movies'),
    path('api/movies/<int:pk>/',       movie_detail, name='api_movie_detail'),
    path('api/movies/<int:pk>/rate/',  rate_movie,   name='api_rate_movie'),
    path('api/genres/',                genre_list,   name='api_genres'),

    # Auth + Django-шаблоны
    path('', include('users.urls')),
    path('', lambda request: redirect('/home/')),
]
