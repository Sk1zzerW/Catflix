from django.contrib import admin
from .models import Movie, Genre


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display  = ['title', 'year', 'rating', 'content_type', 'is_coming_soon', 'genres_list']
    list_filter   = ['content_type', 'is_coming_soon', 'year', 'genres']
    search_fields = ['title', 'description']
    filter_horizontal = ['genres']
    list_editable = ['rating', 'is_coming_soon']
