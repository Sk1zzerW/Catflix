from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Genre',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
            options={'db_table': 'genres', 'ordering': ['name']},
        ),
        migrations.CreateModel(
            name='Movie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title',          models.CharField(max_length=255)),
                ('description',    models.TextField(blank=True)),
                ('poster_url',     models.URLField(blank=True, default='')),
                ('year',           models.PositiveIntegerField()),
                ('rating',         models.DecimalField(decimal_places=1, default=0.0, max_digits=3)),
                ('age_rating',     models.CharField(default='16+', max_length=10)),
                ('content_type',   models.CharField(choices=[('movie', 'Movie'), ('series', 'Series')], default='movie', max_length=10)),
                ('is_coming_soon', models.BooleanField(default=False)),
                ('release_date',   models.DateField(blank=True, null=True)),
                ('genres',         models.ManyToManyField(blank=True, related_name='movies', to='api.genre')),
                ('created_at',     models.DateTimeField(auto_now_add=True)),
            ],
            options={'db_table': 'movies', 'ordering': ['-created_at']},
        ),
    ]
