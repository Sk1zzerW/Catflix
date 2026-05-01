from django.db import models
from django.contrib.auth.models import User
class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    class Meta:
        db_table = 'genres'
        ordering = ['name']
    def __str__(self):
        return self.name
class Movie(models.Model):
    TYPE_CHOICES = [('movie', 'Movie'), ('series', 'Series')]
    title          = models.CharField(max_length=255)
    description    = models.TextField(blank=True)
    poster_url     = models.URLField(blank=True, default='')
    trailer_url    = models.URLField(blank=True, default='',
                        help_text='YouTube embed URL, e.g. https://www.youtube.com/embed/VIDEO_ID')
    year           = models.PositiveIntegerField()
    rating         = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    age_rating     = models.CharField(max_length=10, default='16+')
    content_type   = models.CharField(max_length=10, choices=TYPE_CHOICES, default='movie')
    is_coming_soon = models.BooleanField(default=False)
    release_date   = models.DateField(null=True, blank=True)
    genres         = models.ManyToManyField(Genre, blank=True, related_name='movies')
    created_at     = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'movies'
        ordering = ['-created_at']
    def __str__(self):
        return f"{self.title} ({self.year})"
    def genres_list(self):
        return ', '.join(g.name for g in self.genres.all())
    def avg_user_rating(self):
        ratings = self.user_ratings.all()
        if not ratings:
            return None
        return round(sum(r.score for r in ratings) / len(ratings), 1)
class UserRating(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    movie      = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='user_ratings')
    score      = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'user_ratings'
        unique_together = ('user', 'movie')
    def __str__(self):
        return f"{self.user.username} → {self.movie.title}: {self.score}/10"
class UserFavorite(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    movie      = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'user_favorites'
        unique_together = ('user', 'movie')
    def __str__(self):
        return f"{self.user.username} ♥ {self.movie.title}"
