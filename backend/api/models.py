from django.db import models
from django.conf import settings
# Create your models here.
class Film (models.Model):
    title = models.CharField(max_length=100)
    poster = models.ImageField(upload_to='posters/')
    video = models.FileField(upload_to='videos/')
    description = models.TextField()
    category_of_film = models.PositiveIntegerField(("category_of_film"), choices=settings.CATEGORY_OF_FILM)


    def __str__(self):
        return self.title


