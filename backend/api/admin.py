from django.contrib import admin
from .models import Movie, Genre, UserRating


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display  = ['name']
    search_fields = ['name']


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display      = ['title', 'year', 'rating', 'content_type', 'is_coming_soon']
    list_filter       = ['content_type', 'is_coming_soon', 'year', 'genres']
    search_fields     = ['title', 'description']
    filter_horizontal = ['genres']
    list_editable     = ['rating', 'is_coming_soon']
    fieldsets = [
        ('Main', {'fields': ['title', 'description', 'year', 'content_type', 'age_rating']}),
        ('Media', {'fields': ['poster_url', 'trailer_url']}),
        ('Catalog', {'fields': ['genres', 'is_coming_soon', 'release_date']}),
        ('Rating', {'fields': ['rating']}),
    ]


@admin.register(UserRating)
class UserRatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'movie', 'score', 'created_at']
    list_filter  = ['score']
    search_fields = ['user__username', 'movie__title']
