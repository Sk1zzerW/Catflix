from django.db import models


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'genres'
        ordering = ['name']

    def __str__(self):
        return self.name


class Movie(models.Model):
    TYPE_CHOICES = [
        ('movie',  'Movie'),
        ('series', 'Series'),
    ]

    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    poster_url  = models.URLField(blank=True, default='')
    year        = models.PositiveIntegerField()
    rating      = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    age_rating  = models.CharField(max_length=10, default='16+')
    content_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='movie')
    is_coming_soon = models.BooleanField(default=False)
    release_date   = models.DateField(null=True, blank=True)
    genres      = models.ManyToManyField(Genre, blank=True, related_name='movies')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'movies'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.year})"

    def genres_list(self):
        return ', '.join(g.name for g in self.genres.all())
