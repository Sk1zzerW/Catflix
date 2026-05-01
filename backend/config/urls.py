from django.contrib import admin
from django.shortcuts import redirect
from django.urls import path, include
from api.views import (
    health, csrf_token_view,
    movie_list, movie_detail,
    rate_movie, toggle_favorite, my_favorites,
    genre_list,
)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/',                  csrf_token_view),
    path('api/health/',                health),
    path('api/movies/',                movie_list,       name='api_movies'),
    path('api/movies/<int:pk>/',       movie_detail,     name='api_movie_detail'),
    path('api/movies/<int:pk>/rate/',  rate_movie,       name='api_rate_movie'),
    path('api/movies/<int:pk>/favorite/', toggle_favorite, name='api_toggle_favorite'),
    path('api/favorites/',             my_favorites,     name='api_favorites'),
    path('api/genres/',                genre_list,       name='api_genres'),
    path('', include('users.urls')),
    path('', lambda request: redirect('/home/')),
]
