from rest_framework import serializers
from .models import Movie, Genre


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Genre
        fields = ['id', 'name']


class MovieSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model  = Movie
        fields = [
            'id', 'title', 'description', 'poster_url',
            'year', 'rating', 'age_rating', 'content_type',
            'is_coming_soon', 'release_date', 'genres',
        ]
