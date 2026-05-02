from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
class Migration(migrations.Migration):
    dependencies = [
        ('api', '0002_movie_trailer_userrating'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name='UserFavorite',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('movie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                    related_name='favorited_by', to='api.movie')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                    related_name='favorites', to=settings.AUTH_USER_MODEL)),
            ],
            options={'db_table': 'user_favorites', 'unique_together': {('user', 'movie')}},
        ),
    ]
