from rest_framework import serializers
from .models import Movie, Genre, UserRating
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Genre
        fields = ['id', 'name']
class MovieSerializer(serializers.ModelSerializer):
    genres         = GenreSerializer(many=True, read_only=True)
    avg_user_rating = serializers.SerializerMethodField()
    class Meta:
        model  = Movie
        fields = [
            'id', 'title', 'description', 'poster_url', 'trailer_url',
            'year', 'rating', 'age_rating', 'content_type',
            'is_coming_soon', 'release_date', 'genres', 'avg_user_rating',
        ]
    def get_avg_user_rating(self, obj):
        return obj.avg_user_rating()
class UserRatingSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model  = UserRating
        fields = ['id', 'username', 'score', 'created_at']
